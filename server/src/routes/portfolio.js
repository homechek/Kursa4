import { Router } from "express";

import { prisma } from "../lib/prisma.js";

export const portfolioRouter = Router();

portfolioRouter.get("/:username", async (req, res, next) => {
  try {
    const username = String(req.params.username || "").toLowerCase();
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        profile: { select: { fio: true, fioEn: true, fioZh: true, bio: true, bioEn: true, bioZh: true, avatar: true } },
        skills: { select: { id: true, title: true, titleEn: true, titleZh: true, level: true }, orderBy: { createdAt: "desc" } },
        projects: {
          select: { id: true, name: true, nameEn: true, nameZh: true, description: true, descriptionEn: true, descriptionZh: true, link: true },
          orderBy: { createdAt: "desc" },
        },
        achievements: {
          select: { id: true, title: true, titleEn: true, titleZh: true, date: true, certificateUrl: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "NOT_FOUND" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

