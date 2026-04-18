import { Router } from "express";
import {
  createSubmissionHandler,
  getMySubmissionsHandler,
  getSubmissionByIdHandler,
  updateSubmissionHandler,
} from "./submissions.controller.js";
import { requireAuth } from "../../middlewares/auth.js";

const router = Router();

router.post("/", requireAuth, createSubmissionHandler);
router.get("/me", requireAuth, getMySubmissionsHandler);
router.get("/:id", requireAuth, getSubmissionByIdHandler);
router.patch("/:id", requireAuth, updateSubmissionHandler);

export default router;