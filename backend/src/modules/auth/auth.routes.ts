import { Router } from "express";
import { register, login, me, getReviewers } from "./auth.controller.js";
import { requireAuth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);

router.get(
  "/reviewers",
  requireAuth,
  requireRole(["COMMITTEE"]),
  getReviewers,
);

export default router;