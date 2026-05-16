import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import userRoutes from "./routes/user.routes";
import reviewRoutes from "./routes/review.routes";
import { apiLimiter } from "./middleware/rateLimiter";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Trust proxy — required when behind a reverse proxy (nginx, Caddy, etc.)
app.set("trust proxy", 1);

app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// Redirect HTTP → HTTPS in production (requires reverse proxy for TLS termination)
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (!req.secure) {
      res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
      return;
    }
    next();
  });
}
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiter
app.use("/api", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", reviewRoutes);

// Health Check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Marketplace API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error Handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
    if (process.env.NODE_ENV === "production") {
      console.log("  → TLS termination handled by reverse proxy (nginx/Caddy)");
    }
  });
}

export default app;