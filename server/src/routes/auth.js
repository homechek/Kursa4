import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { signJwt } from "../lib/jwt.js";
import { usernameFromEmail } from "../lib/username.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-z0-9_]+$/i, "username: only letters/numbers/_"),
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const input = registerSchema.safeParse({
      ...req.body,
      username: req.body?.username || usernameFromEmail(req.body?.email),
    });
    if (!input.success) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: input.error.flatten() });
    }

    const { email, password, username } = input.data;

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          email,
          username: username.toLowerCase(),
          password: passwordHash,
          profile: {
            create: {
              fio: username,
              bio: "",
              avatar: null,
            },
          },
        },
        select: { id: true, email: true, username: true },
      });

      const token = signJwt({ sub: user.id });
      return res.status(201).json({ token, user });
    } catch (e) {
      // Unique constraint violation
      if (e?.code === "P2002") {
        return res.status(409).json({ error: "ALREADY_EXISTS" });
      }
      throw e;
    }
  } catch (err) {
    next(err);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.safeParse(req.body);
    if (!input.success) {
      return res.status(400).json({ error: "VALIDATION_ERROR" });
    }

    const user = await prisma.user.findUnique({
      where: { email: input.data.email },
      select: { id: true, email: true, username: true, password: true },
    });
    if (!user) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

    const ok = await bcrypt.compare(input.data.password, user.password);
    if (!ok) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

    const token = signJwt({ sub: user.id });
    return res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, username: true },
    });
    if (!user) return res.status(404).json({ error: "NOT_FOUND" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

