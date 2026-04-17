import { Router } from "express";
import {
  createSubmissionHandler,
  getMySubmissionsHandler,
} from "./submissions.controller.js";
import { requireAuth } from "../../middlewares/auth.js";

const router = Router();

router.post("/", requireAuth, createSubmissionHandler);
router.get("/me", requireAuth, getMySubmissionsHandler);

export default router;