import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middleware/auth.js";
import { translateText } from "../lib/translate.js";

export const translateRouter = Router();

translateRouter.use(requireAuth);

const schema = z.object({
  text: z.string().min(1).max(5000),
  target: z.enum(["ru", "en", "zh"]),
  source: z.enum(["ru", "en", "zh"]).optional(),
});

translateRouter.post("/", async (req, res, next) => {
  try {
    const input = schema.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: "VALIDATION_ERROR" });

    try {
      const translated = await translateText(input.data);
      res.json({ translated });
    } catch (e) {
      if (e?.code === "TRANSLATE_NOT_CONFIGURED" || String(e?.message) === "TRANSLATE_NOT_CONFIGURED") {
        return res.status(503).json({ error: "TRANSLATE_NOT_CONFIGURED" });
      }
      throw e;
    }
  } catch (err) {
    next(err);
  }
});

