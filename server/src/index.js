import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";

import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { portfolioRouter } from "./routes/portfolio.js";
import { translateRouter } from "./routes/translate.js";

dotenv.config();

const app = express();

const port = Number(process.env.PORT || 4000);
const allowedOrigins = String(process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);

const uploadsDir = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients or same-origin requests without Origin header.
      if (!origin) return callback(null, true);
      // If CLIENT_ORIGIN is not set, allow all origins.
      if (!allowedOrigins.length) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS_ORIGIN_NOT_ALLOWED"));
    },
    credentials: false,
  })
);
app.use(express.json({ limit: "1mb" }));

app.use("/uploads", express.static(uploadsDir, { maxAge: "1h", etag: true }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/me", meRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/translate", translateRouter);

app.use((req, res) => {
  res.status(404).json({ error: "NOT_FOUND" });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err?.message === "CORS_ORIGIN_NOT_ALLOWED") {
    return res.status(403).json({ error: "CORS_ORIGIN_NOT_ALLOWED" });
  }

  // Prisma connection / initialization issues (common on Render when DATABASE_URL is missing/wrong)
  const code = String(err?.code || "");
  const name = String(err?.name || "");
  const msg = String(err?.message || "");
  if (name.includes("Prisma") || msg.toLowerCase().includes("prisma")) {
    // e.g. P1001 (can't reach DB), P1000 (auth failed), etc.
    if (code.startsWith("P1") || msg.toLowerCase().includes("database")) {
      return res.status(500).json({ error: "DB_CONNECTION_FAILED", details: code || undefined });
    }
  }

  res.status(500).json({ error: "INTERNAL_ERROR" });
});

app.listen(port, () => {
  console.log(`ProfPortfolio API listening on port ${port}`);
});

