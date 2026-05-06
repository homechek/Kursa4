import { verifyJwt } from "../lib/jwt.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  try {
    const payload = verifyJwt(token);
    if (!payload?.sub) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }
    req.userId = String(payload.sub);
    next();
  } catch {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
}

