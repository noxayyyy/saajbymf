import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage, pool } from "./storage";
import {
  hashPassword,
  comparePassword,
  requireAuth,
  requireAdmin,
} from "./auth";
import { sendToTopic, subscribeTokenToTopic } from "./firebase";
import {
  sendOrderEmails,
  sendTestEmail,
  sendOrderStatusUpdateEmail,
} from "./email";
import {
  registerSchema,
  loginSchema,
  insertProductSchema,
  insertCollectionSchema,
  insertBannerSchema,
} from "@shared/schema";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const upload = multer({
  storage: multer.memoryStorage(), // Keep file in memory temporarily
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|ico|svg)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Helper function to upload to Supabase
async function uploadToSupabase(file: Express.Multer.File) {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname);
  const filename = `${uniqueSuffix}${ext}`;

  const { data, error } = await supabase.storage
    .from("saaj-uploads")
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  // Return the public URL
  const { data: publicUrlData } = supabase.storage
    .from("saaj-uploads")
    .getPublicUrl(filename);

  return { url: publicUrlData.publicUrl, filename };
}
export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error("SESSION_SECRET environment variable is required");
  }
  const isProduction = process.env.NODE_ENV === "production";
  const PgStore = connectPgSimple(session);
  app.use(
    session({
      store: new PgStore({
        pool: pool as any,
        createTableIfMissing: true,
        errorLog: (msg: string, err?: Error) =>
          console.error("[session store]", msg, err ?? ""),
      }),
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        // 'auto': secure only over HTTPS (so cookie works on localhost with npm start)
        secure: "auto",
        sameSite: isProduction ? "strict" : "lax",
      },
    }),
  );

  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const { email, password, firstName, lastName, phone } = parsed.data;
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res
          .status(409)
          .json({ message: "An account with this email already exists" });
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
      });
      req.session.userId = user.id;
      req.session.role = user.role;
      const { password: _, ...safeUser } = user;
      req.session.save((err) => {
        if (err) {
          console.error("Session save failed (register):", err);
          return res.status(500).json({ message: "Registration failed" });
        }
        res.status(201).json(safeUser);
      });
    } catch {
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input" });
      }
      const { email, password } = parsed.data;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const valid = await comparePassword(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      req.session.userId = user.id;
      req.session.role = user.role;
      const { password: _, ...safeUser } = user;
      req.session.save((err) => {
        if (err) {
          console.error("Session save failed (login):", err);
          return res.status(500).json({ message: "Login failed" });
        }
        // Ensure cookie will be set: session is saved before response is sent
        res.json(safeUser);
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  const profileSchema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
  });

  app.put("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const parsed = profileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid profile data" });
      }
      const updated = await storage.updateUser(
        req.session.userId!,
        parsed.data,
      );
      if (!updated) return res.status(404).json({ message: "User not found" });
      const { password: _, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get("/api/collections", async (_req, res) => {
    try {
      const cols = await storage.getCollections();
      res.set(
        "Cache-Control",
        "public, max-age=60, stale-while-revalidate=300",
      );
      res.json(cols);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collections" });
    }
  });

  app.get("/api/collections/:slug", async (req, res) => {
    try {
      const collection = await storage.getCollectionBySlug((req.params.slug as string));
      if (!collection)
        return res.status(404).json({ message: "Collection not found" });
      res.set(
        "Cache-Control",
        "public, max-age=60, stale-while-revalidate=300",
      );
      res.json(collection);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collection" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      res.set(
        "Cache-Control",
        "public, max-age=60, stale-while-revalidate=300",
      );
      const { featured, collection } = req.query;
      if (featured === "true") {
        return res.json(await storage.getFeaturedProducts());
      }
      if (collection && typeof collection === "string") {
        return res.json(await storage.getProductsByCollection(collection));
      }
      res.json(await storage.getProducts());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug((req.params.slug as string));
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      res.set(
        "Cache-Control",
        "public, max-age=60, stale-while-revalidate=300",
      );
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const parsed = insertProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({
            message: "Invalid product data",
            errors: parsed.error.flatten(),
          });
      }
      const product = await storage.createProduct(parsed.data);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const parsed = insertProductSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({
            message: "Invalid product data",
            errors: parsed.error.flatten(),
          });
      }
      const updated = await storage.updateProduct((req.params.id as string), parsed.data);
      if (!updated)
        return res.status(404).json({ message: "Product not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteProduct((req.params.id as string));
      if (!deleted)
        return res.status(404).json({ message: "Product not found" });
      res.json({ message: "Product deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.post("/api/admin/collections", requireAdmin, async (req, res) => {
    try {
      const parsed = insertCollectionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({
            message: "Invalid collection data",
            errors: parsed.error.flatten(),
          });
      }
      const collection = await storage.createCollection(parsed.data);
      res.status(201).json(collection);
    } catch (error) {
      res.status(500).json({ message: "Failed to create collection" });
    }
  });

  app.put("/api/admin/collections/:id", requireAdmin, async (req, res) => {
    try {
      const parsed = insertCollectionSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({
            message: "Invalid collection data",
            errors: parsed.error.flatten(),
          });
      }
      const updated = await storage.updateCollection(
        (req.params.id as string),
        parsed.data,
      );
      if (!updated)
        return res.status(404).json({ message: "Collection not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update collection" });
    }
  });

  app.delete("/api/admin/collections/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteCollection((req.params.id as string));
      if (!deleted)
        return res.status(404).json({ message: "Collection not found" });
      res.json({ message: "Collection deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete collection" });
    }
  });

  app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
    try {
      const allOrders = await storage.getOrders();
      res.json(allOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const order = await storage.getOrderById((req.params.id as string));
      if (!order) return res.status(404).json({ message: "Order not found" });
      const items = await storage.getOrderItems(order.id);
      res.json({ ...order, items });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.put("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const prev = await storage.getOrderById((req.params.id as string));
      const updated = await storage.updateOrder((req.params.id as string), req.body);
      if (!updated) return res.status(404).json({ message: "Order not found" });
      // Send status update email if status changed to a notable value
      const notifyStatuses = [
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];
      if (
        prev &&
        updated.status !== prev.status &&
        notifyStatuses.includes(updated.status)
      ) {
        const items = await storage.getOrderItems(updated.id);
        void sendOrderStatusUpdateEmail(updated, items);
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  app.delete("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const ok = await storage.deleteOrder((req.params.id as string));
      if (!ok) return res.status(404).json({ message: "Order not found" });
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const safeUsers = allUsers.map(({ password: _, ...u }) => u);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      if ((req.params.id as string) === req.session.userId) {
        return res
          .status(400)
          .json({ message: "You cannot delete your own admin account" });
      }
      const ok = await storage.deleteUser((req.params.id as string));
      if (!ok) return res.status(404).json({ message: "User not found" });
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.get("/api/settings/public", async (_req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      const publicKeys = [
        "site_name",
        "site_tagline",
        "site_logo",
        "site_announcement",
        "site_currency",
        "site_favicon",
        "site_theme_color",
        "social_instagram",
        "social_facebook",
        "social_pinterest",
        "social_tiktok",
        "social_youtube",
        "page_privacy_policy",
        "page_shipping_returns",
        "page_size_guide",
        "page_about",
        "page_contact",
        "cod_enabled",
        "bank_transfer_enabled",
        "jazzcash_enabled",
        "easypaisa_enabled",
        "payoneer_enabled",
        "firebase_api_key",
        "firebase_auth_domain",
        "firebase_project_id",
        "firebase_messaging_sender_id",
        "firebase_app_id",
        "firebase_vapid_key",
        "site_phone",
        "site_whatsapp",
      ];
      const publicSettings: Record<string, string> = {};
      settings.forEach((s) => {
        if (publicKeys.includes(s.key)) publicSettings[s.key] = s.value || "";
      });
      res.set(
        "Cache-Control",
        "public, max-age=120, stale-while-revalidate=600",
      );
      res.json(publicSettings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const settings = await storage.getSiteSettings(category);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const { settings } = req.body;
      if (!Array.isArray(settings)) {
        return res.status(400).json({ message: "Settings must be an array" });
      }
      const results = [];
      for (const s of settings) {
        const result = await storage.upsertSiteSetting(s);
        results.push(result);
      }
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    try {
      const allProducts = await storage.getProducts();
      const allOrders = await storage.getOrders();
      const allUsers = await storage.getAllUsers();
      const allCollections = await storage.getCollections();
      const totalRevenue = allOrders
        .filter((o) => o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.total, 0);
      res.json({
        totalProducts: allProducts.length,
        totalOrders: allOrders.length,
        totalUsers: allUsers.length,
        totalCollections: allCollections.length,
        totalRevenue,
        recentOrders: allOrders.slice(0, 5),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const {
        items,
        shippingEmail,
        shippingFirstName,
        shippingLastName,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
        shippingCountry,
        shippingPhone,
        paymentMethod,
        paymentScreenshot,
        orderNotes,
      } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order must have items" });
      }
      if (
        !shippingEmail ||
        !shippingFirstName ||
        !shippingLastName ||
        !shippingAddress ||
        !shippingCity ||
        !shippingCountry ||
        !shippingPhone
      ) {
        return res
          .status(400)
          .json({ message: "All shipping details are required" });
      }
      const method = paymentMethod || "cod";
      const validMethods = ["cod", "card", "jazzcash", "payoneer", "bank"];
      if (!validMethods.includes(method)) {
        return res
          .status(400)
          .json({
            message: `Invalid payment method. Use one of: ${validMethods.join(", ")}`,
          });
      }
      if (method === "bank" && !paymentScreenshot) {
        return res
          .status(400)
          .json({
            message: "Please upload the payment screenshot for bank transfer.",
          });
      }
      let total = 0;
      for (const item of items) {
        const product = await storage.getProductById(item.productId);
        if (!product) {
          return res
            .status(400)
            .json({ message: `Product not found: ${item.productId}` });
        }
        total += product.price * (item.quantity || 1);
      }
      let paymentStatus = "pending";
      if (method === "card") {
        paymentStatus = "paid";
      } else if (
        method === "jazzcash" ||
        method === "payoneer" ||
        method === "bank"
      ) {
        paymentStatus = "awaiting_verification";
      }
      const order = await storage.createOrder({
        userId: req.session.userId ?? null,
        status: paymentStatus === "paid" ? "confirmed" : "pending",
        total,
        currency: "PKR",
        paymentMethod: method,
        paymentStatus,
        paymentScreenshot: paymentScreenshot ?? null,
        shippingEmail,
        shippingFirstName,
        shippingLastName,
        shippingAddress,
        shippingCity,
        shippingState: shippingState ?? null,
        shippingZip: shippingZip ?? null,
        shippingCountry,
        shippingPhone,
        orderNotes: orderNotes ?? null,
      });
      for (const item of items) {
        const product = await storage.getProductById(item.productId);
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          productName: product!.name,
          productImage: product!.image,
          quantity: item.quantity || 1,
          price: product!.price,
        });
      }
      const orderItems = await storage.getOrderItems(order.id);
      const guestOrders = (req.session as any).guestOrderIds || [];
      if (!req.session.userId) {
        (req.session as any).guestOrderIds = [...guestOrders, order.id];
      }
      void sendOrderEmails(order, orderItems);
      res.status(201).json({ ...order, items: orderItems });
    } catch {
      res.status(500).json({ message: "Failed to place order" });
    }
  });

  app.get("/api/orders/track", async (req, res) => {
    try {
      const email = ((req.query.email as string) || "").trim().toLowerCase();
      const number = ((req.query.number as string) || "")
        .trim()
        .replace(/^#/, "");
      if (!email || !number) {
        return res
          .status(400)
          .json({ message: "email and number are required" });
      }
      function shortOrderNumber(id: string): string {
        const hex = id.replace(/[^0-9a-f]/gi, "").slice(-6) || "0";
        const num = parseInt(hex, 16);
        return String((num % 90000) + 10000);
      }
      const allOrders = await storage.getOrdersByEmail(email);
      const order = allOrders.find((o) => shortOrderNumber(o.id) === number);
      if (!order) return res.status(404).json({ message: "Order not found" });
      const items = await storage.getOrderItems(order.id);
      return res.json({ ...order, items });
    } catch {
      res.status(500).json({ message: "Failed to look up order" });
    }
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const userOrders = await storage.getOrdersByUser(req.session.userId!);
      res.json(userOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrderById((req.params.id as string));
      if (!order) return res.status(404).json({ message: "Order not found" });
      const sessionUserId = req.session.userId;
      const guestOrderIds: string[] = (req.session as any).guestOrderIds || [];
      const isOwner = sessionUserId && order.userId === sessionUserId;
      const isGuestOwner = !order.userId && guestOrderIds.includes(order.id);
      const isAdmin = req.session.role === "admin";
      if (!isOwner && !isGuestOwner && !isAdmin) {
        return res.status(404).json({ message: "Order not found" });
      }
      const items = await storage.getOrderItems(order.id);
      res.json({ ...order, items });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/push/subscribe", async (req, res) => {
    try {
      const { token, topic } = req.body as { token?: string; topic?: string };
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "token is required" });
      }
      const t = (topic && typeof topic === "string" ? topic : "all").slice(
        0,
        200,
      );
      await subscribeTokenToTopic(token, t);
      res.json({ ok: true, topic: t });
    } catch (err: any) {
      res.status(500).json({ message: err?.message || "Failed to subscribe" });
    }
  });

  app.post("/api/admin/push/send", requireAdmin, async (req, res) => {
    try {
      const { topic, title, body, link, image } = req.body as {
        topic?: string;
        title?: string;
        body?: string;
        link?: string;
        image?: string;
      };
      if (!topic || !title || !body) {
        return res
          .status(400)
          .json({ message: "topic, title and body are required" });
      }
      const messageId = await sendToTopic({ topic, title, body, link, image });
      res.json({ ok: true, messageId });
    } catch (err: any) {
      res
        .status(500)
        .json({ message: err?.message || "Failed to send notification" });
    }
  });

  app.post("/api/admin/test-email", requireAdmin, async (req, res) => {
    try {
      const to = (req.body?.to || "").toString().trim();
      if (!to)
        return res.status(400).json({ message: "Recipient email is required" });
      await sendTestEmail(to);
      res.json({ ok: true });
    } catch (err: any) {
      res
        .status(500)
        .json({ message: err?.message || "Failed to send test email" });
    }
  });

  app.post(
    "/api/upload/payment-screenshot",
    upload.single("file"),
    async (req, res) => {
      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });
      try {
        const result = await uploadToSupabase(req.file);
        res.json(result);
      } catch (e) {
        res.status(500).json({ message: "Upload failed" });
      }
    },
  );

  app.post(
    "/api/upload",
    requireAdmin,
    upload.single("file"),
    async (req, res) => {
      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });
      try {
        const result = await uploadToSupabase(req.file);
        res.json(result);
      } catch (e) {
        res.status(500).json({ message: "Upload failed" });
      }
    },
  );

  app.post(
    "/api/upload/multiple",
    requireAdmin,
    upload.array("files", 10),
    async (req, res) => {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0)
        return res.status(400).json({ message: "No files uploaded" });

      try {
        const uploadPromises = files.map((f) => uploadToSupabase(f));
        const results = await Promise.all(uploadPromises);
        res.json({ urls: results.map((r) => r.url) });
      } catch (e) {
        res.status(500).json({ message: "Upload failed" });
      }
    },
  );

  const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
  });

  app.put("/api/admin/change-password", requireAdmin, async (req, res) => {
    try {
      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: "New password must be at least 6 characters" });
      }
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const valid = await comparePassword(
        parsed.data.currentPassword,
        user.password,
      );
      if (!valid) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }
      const hashedPassword = await hashPassword(parsed.data.newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  app.get("/api/banners", async (_req, res) => {
    try {
      const activeBanners = await storage.getBanners(true);
      res.set(
        "Cache-Control",
        "public, max-age=60, stale-while-revalidate=300",
      );
      res.json(activeBanners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch banners" });
    }
  });

  app.get("/api/admin/banners", requireAdmin, async (_req, res) => {
    try {
      const allBanners = await storage.getBanners(false);
      res.json(allBanners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch banners" });
    }
  });

  app.post("/api/admin/banners", requireAdmin, async (req, res) => {
    try {
      const parsed = insertBannerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({
            message: "Invalid banner data",
            errors: parsed.error.flatten(),
          });
      }
      const banner = await storage.createBanner(parsed.data);
      res.status(201).json(banner);
    } catch (error) {
      res.status(500).json({ message: "Failed to create banner" });
    }
  });

  app.put("/api/admin/banners/:id", requireAdmin, async (req, res) => {
    try {
      const parsed = insertBannerSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid banner data" });
      }
      const updated = await storage.updateBanner((req.params.id as string), parsed.data);
      if (!updated)
        return res.status(404).json({ message: "Banner not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update banner" });
    }
  });

  app.delete("/api/admin/banners/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteBanner((req.params.id as string));
      if (!deleted)
        return res.status(404).json({ message: "Banner not found" });
      res.json({ message: "Banner deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete banner" });
    }
  });

  const SITE_ORIGIN = process.env.SITE_ORIGIN || "https://saajbymf.mtai.live";

  app.get("/robots.txt", (_req, res) => {
    res
      .type("text/plain")
      .send(
        [
          "User-agent: *",
          "Allow: /",
          "Disallow: /admin",
          "Disallow: /admin/",
          "Disallow: /api/",
          "Disallow: /checkout",
          "Disallow: /cart",
          "Disallow: /account",
          "Disallow: /login",
          "Disallow: /register",
          "",
          `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
          "",
        ].join("\n"),
      );
  });

  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const [products, collections] = await Promise.all([
        storage.getProducts().catch(() => []),
        storage.getCollections().catch(() => []),
      ]);
      const staticPaths = [
        "/",
        "/shop",
        "/collections",
        "/about",
        "/contact",
        "/size-guide",
        "/shipping-returns",
        "/privacy-policy",
      ];
      const urls: { loc: string; priority: string }[] = [
        ...staticPaths.map((p) => ({
          loc: `${SITE_ORIGIN}${p}`,
          priority: p === "/" ? "1.0" : "0.7",
        })),
        ...(collections as any[]).map((c) => ({
          loc: `${SITE_ORIGIN}/collections/${c.slug}`,
          priority: "0.8",
        })),
        ...(products as any[]).map((p) => ({
          loc: `${SITE_ORIGIN}/product/${p.slug}`,
          priority: "0.9",
        })),
      ];
      const xml =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls
          .map(
            (u) =>
              `  <url><loc>${u.loc}</loc><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`,
          )
          .join("\n") +
        `\n</urlset>\n`;
      res.type("application/xml").send(xml);
    } catch (err) {
      res.status(500).type("text/plain").send("sitemap generation failed");
    }
  });

  return httpServer;
}
