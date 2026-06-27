import express from "express";
import { registerRoutes } from "../server/routes";
import { createServer } from "http";

const app = express();

// Trust Vercel's proxy
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = createServer(app);

// Register all your API routes
registerRoutes(server, app).catch(console.error);

// Export the Express app for Vercel
export default app;
