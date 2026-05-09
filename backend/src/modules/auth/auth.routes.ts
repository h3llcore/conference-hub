import { Router } from "express";
import {
  getOrcidConnectUrl,
  getOrcidLoginUrl,
  getReviewers,
  login,
  me,
  orcidCallback,
  register,
  updateProfile,
} from "./auth.controller.js";
import { requireAuth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.patch("/profile", requireAuth, updateProfile);

router.get("/orcid/connect", requireAuth, getOrcidConnectUrl);
router.get("/orcid/login", getOrcidLoginUrl);
router.get("/orcid/callback", orcidCallback);

router.get(
  "/reviewers",
  requireAuth,
  requireRole(["COMMITTEE"]),
  getReviewers,
);

export default router;