import nodemailer from "nodemailer";
import type { Order, OrderItem } from "@shared/schema";
import { storage } from "./storage";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  adminEmail: string;
  storeName: string;
  publicUrl: string;
};

async function loadConfig(): Promise<SmtpConfig | null> {
  const all = await storage.getSiteSettings();
  const map: Record<string, string> = {};
  for (const s of all) map[s.key] = s.value || "";
  const host = map.smtp_host?.trim();
  const user = map.smtp_user?.trim();
  const pass = map.smtp_pass?.trim();
  if (!host || !user || !pass) return null;
  const port = parseInt(map.smtp_port || "587", 10);
  return {
    host,
    port,
    secure: map.smtp_secure === "true" || port === 465,
    user,
    pass,
    from: map.smtp_from?.trim() || user,
    adminEmail: map.admin_notify_email?.trim() || map.site_email?.trim() || user,
    storeName: map.site_name?.trim() || "SAAJ by MF",
    publicUrl: map.site_public_url?.trim() || "",
  };
}

function buildTransport(cfg: SmtpConfig) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });
}

function fmtPrice(n: number, currency = "PKR") {
  return `${currency} ${Number(n || 0).toLocaleString()}`;
}

function shortOrderNumber(id: string): string {
  if (!id) return "00000";
  const hex = id.replace(/[^0-9a-f]/gi, "").slice(-6) || "0";
  const num = parseInt(hex, 16);
  return String((num % 90000) + 10000);
}

function itemsTable(items: OrderItem[], currency: string) {
  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eee;">
          <img src="${i.productImage || ""}" alt="" width="56" height="56" style="display:block;border-radius:4px;object-fit:cover;background:#f5f5f5;" />
        </td>
        <td style="padding:12px;border-bottom:1px solid #eee;font:14px/1.4 Arial,sans-serif;color:#222;">
          ${i.productName}<br/>
          <span style="color:#888;font-size:12px;">Qty: ${i.quantity}</span>
        </td>
        <td style="padding:12px;border-bottom:1px solid #eee;font:14px/1.4 Arial,sans-serif;color:#222;text-align:right;white-space:nowrap;">
          ${fmtPrice(i.price * i.quantity, currency)}
        </td>
      </tr>`
    )
    .join("");
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:16px;">
      ${rows}
    </table>`;
}

function customerHtml(order: Order, items: OrderItem[], cfg: SmtpConfig) {
  const link = cfg.publicUrl ? `${cfg.publicUrl.replace(/\/$/, "")}/order/${order.id}` : "";
  return `
  <div style="background:#f7f7f7;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px;font-family:Georgia,serif;color:#1a1a1a;">
      <h1 style="font-size:24px;letter-spacing:2px;margin:0 0 8px;">${cfg.storeName.toUpperCase()}</h1>
      <p style="color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 24px;">Order Confirmation</p>
      <p style="font:14px/1.6 Arial,sans-serif;">Hi ${order.shippingFirstName},</p>
      <p style="font:14px/1.6 Arial,sans-serif;">Thank you for your order! We've received your purchase and our team will be in touch shortly.</p>
      <div style="background:#faf7ef;border:1px solid #ecdfb9;padding:16px;margin:20px 0;font:14px/1.6 Arial,sans-serif;">
        <strong>Order #${shortOrderNumber(order.id)}</strong><br/>
        Status: ${order.status}<br/>
        Payment: ${order.paymentMethod} (${order.paymentStatus})
      </div>
      ${itemsTable(items, order.currency)}
      <table width="100%" style="margin-top:16px;font:14px/1.4 Arial,sans-serif;">
        <tr><td style="padding:6px 12px;color:#666;">Total</td><td style="padding:6px 12px;text-align:right;font-weight:bold;">${fmtPrice(order.total, order.currency)}</td></tr>
      </table>
      <div style="margin-top:24px;font:14px/1.6 Arial,sans-serif;">
        <strong>Shipping to:</strong><br/>
        ${order.shippingFirstName} ${order.shippingLastName}<br/>
        ${order.shippingAddress}<br/>
        ${order.shippingCity}${order.shippingState ? ", " + order.shippingState : ""} ${order.shippingZip || ""}<br/>
        ${order.shippingCountry}<br/>
        Phone: ${order.shippingPhone}
      </div>
      ${link ? `<p style="text-align:center;margin:32px 0;"><a href="${link}" style="background:#1a1a1a;color:#fff;text-decoration:none;padding:14px 32px;font:12px/1 Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;">Track Your Order</a></p>` : ""}
      <p style="font:12px/1.6 Arial,sans-serif;color:#888;margin-top:32px;border-top:1px solid #eee;padding-top:16px;">If you have questions, simply reply to this email.<br/>— ${cfg.storeName}</p>
    </div>
  </div>`;
}

function adminHtml(order: Order, items: OrderItem[], cfg: SmtpConfig) {
  const link = cfg.publicUrl ? `${cfg.publicUrl.replace(/\/$/, "")}/admin/orders` : "";
  return `
  <div style="background:#f7f7f7;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px;font-family:Arial,sans-serif;color:#1a1a1a;">
      <h2 style="margin:0 0 8px;">New Order Received</h2>
      <p style="color:#888;font-size:12px;margin:0 0 20px;">Order #${shortOrderNumber(order.id)} · ${new Date(order.createdAt || Date.now()).toLocaleString()}</p>
      <div style="background:#fff8e1;border:1px solid #ffe082;padding:12px 16px;margin-bottom:16px;font-size:14px;">
        <strong>Total:</strong> ${fmtPrice(order.total, order.currency)}<br/>
        <strong>Payment:</strong> ${order.paymentMethod} — ${order.paymentStatus}
        ${order.paymentScreenshot ? `<br/><strong>Screenshot uploaded</strong>` : ""}
      </div>
      ${itemsTable(items, order.currency)}
      <h3 style="margin-top:24px;font-size:15px;">Customer</h3>
      <p style="font-size:14px;line-height:1.6;margin:0;">
        ${order.shippingFirstName} ${order.shippingLastName}<br/>
        ${order.shippingEmail} · ${order.shippingPhone}<br/>
        ${order.shippingAddress}<br/>
        ${order.shippingCity}${order.shippingState ? ", " + order.shippingState : ""} ${order.shippingZip || ""}, ${order.shippingCountry}
      </p>
      ${order.orderNotes ? `<p style="font-size:13px;color:#555;margin-top:16px;"><strong>Notes:</strong> ${order.orderNotes}</p>` : ""}
      ${link ? `<p style="margin-top:24px;"><a href="${link}" style="color:#c4972a;text-decoration:underline;">Open in admin panel →</a></p>` : ""}
    </div>
  </div>`;
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  processing: "Being Processed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function statusUpdateHtml(order: Order, items: OrderItem[], cfg: SmtpConfig) {
  const statusLabel = STATUS_LABELS[order.status] || order.status;
  const trackLink = cfg.publicUrl
    ? `${cfg.publicUrl.replace(/\/$/, "")}/track-order`
    : "";
  const statusColor =
    order.status === "delivered" ? "#22c55e"
    : order.status === "shipped" ? "#3b82f6"
    : order.status === "cancelled" ? "#ef4444"
    : "#c4972a";

  return `
  <div style="background:#f7f7f7;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px;font-family:Georgia,serif;color:#1a1a1a;">
      <h1 style="font-size:22px;letter-spacing:2px;margin:0 0 6px;">${cfg.storeName.toUpperCase()}</h1>
      <p style="color:#888;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 24px;">Order Status Update</p>

      <p style="font:14px/1.6 Arial,sans-serif;">Hi ${order.shippingFirstName},</p>
      <p style="font:14px/1.6 Arial,sans-serif;">Your order status has been updated.</p>

      <div style="border:2px solid ${statusColor};padding:16px 20px;margin:20px 0;text-align:center;">
        <p style="font:11px/1 Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#888;margin:0 0 6px;">Order #${shortOrderNumber(order.id)}</p>
        <p style="font:22px/1.2 Georgia,serif;color:${statusColor};margin:0;font-weight:bold;">${statusLabel.toUpperCase()}</p>
        ${order.status === "shipped" ? `<p style="font:12px/1.6 Arial,sans-serif;color:#555;margin:8px 0 0;">Your parcel is on its way! You will receive it soon.</p>` : ""}
        ${order.status === "delivered" ? `<p style="font:12px/1.6 Arial,sans-serif;color:#555;margin:8px 0 0;">Your order has been delivered. We hope you love it!</p>` : ""}
        ${order.status === "cancelled" ? `<p style="font:12px/1.6 Arial,sans-serif;color:#555;margin:8px 0 0;">Your order has been cancelled. Contact us if you have questions.</p>` : ""}
      </div>

      ${itemsTable(items, order.currency)}

      <div style="margin-top:16px;font:14px/1.6 Arial,sans-serif;border-top:1px solid #eee;padding-top:16px;">
        <strong>Delivering to:</strong><br/>
        ${order.shippingFirstName} ${order.shippingLastName}<br/>
        ${order.shippingAddress}, ${order.shippingCity}${order.shippingState ? ", " + order.shippingState : ""}<br/>
        ${order.shippingCountry} · ${order.shippingPhone}
      </div>

      ${trackLink ? `<p style="text-align:center;margin:28px 0 0;"><a href="${trackLink}" style="background:#1a1a1a;color:#fff;text-decoration:none;padding:13px 28px;font:11px/1 Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;">Track Your Order</a></p>` : ""}

      <p style="font:12px/1.6 Arial,sans-serif;color:#888;margin-top:28px;border-top:1px solid #eee;padding-top:16px;">
        Questions? WhatsApp us or reply to this email.<br/>— ${cfg.storeName}
      </p>
    </div>
  </div>`;
}

export async function sendOrderStatusUpdateEmail(order: Order, items: OrderItem[]) {
  try {
    const cfg = await loadConfig();
    if (!cfg) return;
    const transporter = buildTransport(cfg);
    const num = shortOrderNumber(order.id);
    const statusLabel = STATUS_LABELS[order.status] || order.status;
    await transporter.sendMail({
      from: cfg.from,
      to: order.shippingEmail,
      subject: `Your Order #${num} is ${statusLabel} — ${cfg.storeName}`,
      html: statusUpdateHtml(order, items, cfg),
    });
  } catch (err: any) {
    console.error("[email] Failed to send status update email:", err?.message || err);
  }
}

export async function sendOrderEmails(order: Order, items: OrderItem[]) {
  try {
    const cfg = await loadConfig();
    if (!cfg) {
      console.warn("[email] SMTP not configured; skipping order emails");
      return;
    }
    const transporter = buildTransport(cfg);
    const num = shortOrderNumber(order.id);
    await Promise.allSettled([
      transporter.sendMail({
        from: cfg.from,
        to: order.shippingEmail,
        subject: `Order Confirmation #${num} — ${cfg.storeName}`,
        html: customerHtml(order, items, cfg),
      }),
      transporter.sendMail({
        from: cfg.from,
        to: cfg.adminEmail,
        subject: `[New Order #${num}] ${order.shippingFirstName} ${order.shippingLastName} — ${fmtPrice(order.total, order.currency)}`,
        html: adminHtml(order, items, cfg),
      }),
    ]);
  } catch (err: any) {
    console.error("[email] Failed to send order emails:", err?.message || err);
  }
}

export async function sendTestEmail(to: string) {
  const cfg = await loadConfig();
  if (!cfg) throw new Error("SMTP is not configured. Save SMTP settings first.");
  const transporter = buildTransport(cfg);
  await transporter.verify();
  await transporter.sendMail({
    from: cfg.from,
    to,
    subject: `Test email from ${cfg.storeName}`,
    html: `<div style="font-family:Arial,sans-serif;padding:24px;">
      <h2>SMTP is working ✓</h2>
      <p>This is a test email from <strong>${cfg.storeName}</strong>. If you can read this, your SMTP settings are configured correctly.</p>
    </div>`,
  });
}
