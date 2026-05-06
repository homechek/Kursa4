import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";

import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const meRouter = Router();

meRouter.use(requireAuth);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(process.cwd(), "uploads"));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || "").slice(0, 12) || ".bin";
      cb(null, `avatar_${req.userId}_${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.mimetype);
    cb(ok ? null : new Error("INVALID_FILE_TYPE"), ok);
  },
});

function isLocalUploadPath(p) {
  return typeof p === "string" && p.startsWith("/uploads/");
}

function safeUnlinkByAvatarPath(avatarPath) {
  try {
    if (!isLocalUploadPath(avatarPath)) return;
    const filename = avatarPath.slice("/uploads/".length);
    if (!filename) return;
    const filePath = path.resolve(process.cwd(), "uploads", filename);
    fs.unlink(filePath, () => {});
  } catch {
    // ignore
  }
}

meRouter.get("/dashboard", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        username: true,
        profile: true,
        skills: { orderBy: { createdAt: "desc" } },
        projects: { orderBy: { createdAt: "desc" } },
        achievements: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!user) return res.status(404).json({ error: "NOT_FOUND" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

const profileSchema = z.object({
  fio: z.string().min(2).max(80),
  fioEn: z.string().min(2).max(80).optional().nullable(),
  fioZh: z.string().min(1).max(80).optional().nullable(),
  bio: z.string().max(800).optional().default(""),
  bioEn: z.string().max(800).optional().nullable(),
  bioZh: z.string().max(800).optional().nullable(),
  avatar: z.string().max(500).optional().nullable(),
});

meRouter.put("/profile", async (req, res, next) => {
  try {
    const input = profileSchema.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: "VALIDATION_ERROR" });

    const profile = await prisma.profile.upsert({
      where: { userId: req.userId },
      create: { ...input.data, userId: req.userId },
      update: { ...input.data },
    });
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

meRouter.post(
  "/avatar",
  (req, res, next) => {
    upload.single("avatar")(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") return res.status(400).json({ error: "FILE_TOO_LARGE" });
        return res.status(400).json({ error: "UPLOAD_ERROR", code: err.code });
      }
      if (String(err?.message) === "INVALID_FILE_TYPE") return res.status(400).json({ error: "INVALID_FILE_TYPE" });
      return next(err);
    });
  },
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: "NO_FILE" });

      const avatarPath = `/uploads/${req.file.filename}`;

      const prev = await prisma.profile.findUnique({
        where: { userId: req.userId },
        select: { avatar: true },
      });

      const profile = await prisma.profile.upsert({
        where: { userId: req.userId },
        create: { fio: "—", bio: "", avatar: avatarPath, userId: req.userId },
        update: { avatar: avatarPath },
      });

      safeUnlinkByAvatarPath(prev?.avatar);
      res.status(201).json({ avatar: profile.avatar });
    } catch (err) {
      next(err);
    }
  }
);

const skillCreateSchema = z.object({
  title: z.string().min(1).max(60),
  titleEn: z.string().min(1).max(60).optional().nullable(),
  titleZh: z.string().min(1).max(60).optional().nullable(),
  level: z.number().int().min(1).max(5).default(3),
});

meRouter.post("/skills", async (req, res, next) => {
  try {
    const input = skillCreateSchema.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: "VALIDATION_ERROR" });

    const skill = await prisma.skill.create({
      data: { ...input.data, userId: req.userId },
    });
    res.status(201).json({ skill });
  } catch (err) {
    next(err);
  }
});

meRouter.delete("/skills/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const deleted = await prisma.skill.deleteMany({
      where: { id, userId: req.userId },
    });
    if (!deleted.count) return res.status(404).json({ error: "NOT_FOUND" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

const projectCreateSchema = z.object({
  name: z.string().min(1).max(80),
  nameEn: z.string().min(1).max(80).optional().nullable(),
  nameZh: z.string().min(1).max(80).optional().nullable(),
  description: z.string().max(1200).optional().default(""),
  descriptionEn: z.string().max(1200).optional().nullable(),
  descriptionZh: z.string().max(1200).optional().nullable(),
  link: z.string().url().optional().nullable(),
});

meRouter.post("/projects", async (req, res, next) => {
  try {
    const input = projectCreateSchema.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: "VALIDATION_ERROR" });

    const project = await prisma.project.create({
      data: { ...input.data, userId: req.userId },
    });
    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
});

meRouter.delete("/projects/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const deleted = await prisma.project.deleteMany({
      where: { id, userId: req.userId },
    });
    if (!deleted.count) return res.status(404).json({ error: "NOT_FOUND" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

const achievementCreateSchema = z.object({
  title: z.string().min(1).max(120),
  titleEn: z.string().min(1).max(120).optional().nullable(),
  titleZh: z.string().min(1).max(120).optional().nullable(),
  date: z.string().min(4),
  certificateUrl: z.string().url().optional().nullable(),
});

meRouter.post("/achievements", async (req, res, next) => {
  try {
    const input = achievementCreateSchema.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: "VALIDATION_ERROR" });

    const achievement = await prisma.achievement.create({
      data: {
        userId: req.userId,
        title: input.data.title,
        titleEn: input.data.titleEn ?? null,
        titleZh: input.data.titleZh ?? null,
        date: new Date(input.data.date),
        certificateUrl: input.data.certificateUrl ?? null,
      },
    });
    res.status(201).json({ achievement });
  } catch (err) {
    next(err);
  }
});

meRouter.delete("/achievements/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const deleted = await prisma.achievement.deleteMany({
      where: { id, userId: req.userId },
    });
    if (!deleted.count) return res.status(404).json({ error: "NOT_FOUND" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

