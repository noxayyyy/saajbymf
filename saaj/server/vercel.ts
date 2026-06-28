import express from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";

const app = express();

// Trust Vercel's proxy
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = createServer(app);

// Register routes asynchronously without blocking the export
registerRoutes(server, app).catch(console.error);

export default app;
