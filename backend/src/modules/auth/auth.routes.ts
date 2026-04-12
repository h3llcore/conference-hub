import { Router } from "express";
import { login, register } from "./auth.controller.js";
import { requireAuth } from "../../middlewares/auth.js";
import { prisma } from "../../config/prisma.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", requireAuth, async (req, res) => {
  const payload = (req as any).user as { sub: string };

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, createdAt: true }
  });

  if (!user) return res.status(404).json({ message: "user not found" });

  res.json({ user });
});


export default router;
