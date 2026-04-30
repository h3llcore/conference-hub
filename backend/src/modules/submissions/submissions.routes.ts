import { Router } from "express";
import path from "path";
import {
  createSubmissionHandler,
  getMySubmissionsHandler,
  getSubmissionByIdHandler,
  updateSubmissionHandler,
  getReviewerSubmissionsHandler,
  getCommitteeSubmissionsHandler,
  getReviewerSubmissionByIdHandler,
  updateSubmissionStatusHandler,
} from "./submissions.controller.js";
import { requireAuth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { upload } from "../../config/multer.js";

const router = Router();

router.post("/", requireAuth, upload.single("file"), createSubmissionHandler);

router.get("/me", requireAuth, getMySubmissionsHandler);

router.get(
  "/reviewer",
  requireAuth,
  requireRole(["REVIEWER"]),
  getReviewerSubmissionsHandler,
);

router.get(
  "/committee",
  requireAuth,
  requireRole(["COMMITTEE"]),
  getCommitteeSubmissionsHandler,
);

router.get(
  "/reviewer/:id",
  requireAuth,
  requireRole(["REVIEWER"]),
  getReviewerSubmissionByIdHandler,
);

router.get("/file/:fileName/download", requireAuth, (req, res) => {
  const { fileName } = req.params;

  const filePath = path.join(
    process.cwd(),
    "uploads",
    "submissions",
    fileName,
  );

  res.download(filePath, fileName, (err) => {
    if (err && !res.headersSent) {
      return res.status(404).json({ message: "File not found" });
    }
  });
});

router.patch("/:id", requireAuth, upload.single("file"), updateSubmissionHandler);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole(["REVIEWER", "COMMITTEE"]),
  updateSubmissionStatusHandler,
);

router.get("/:id", requireAuth, getSubmissionByIdHandler);

export default router;