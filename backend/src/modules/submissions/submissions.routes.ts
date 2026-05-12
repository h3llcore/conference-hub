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
  publishSubmissionHandler,
} from "./submissions.controller.js";
import { requireAuth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { upload } from "../../config/multer.js";

const router = Router();

function safeDecodeFileName(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getSubmissionFilePath(fileName: string) {
  const decodedFileName = safeDecodeFileName(fileName);

  // Захист від ../ та випадкових шляхів
  const onlyFileName = path.basename(decodedFileName);

  return {
    fileName: onlyFileName,
    filePath: path.join(process.cwd(), "uploads", "submissions", onlyFileName),
  };
}

function setPdfHeaders(
  res: any,
  fileName: string,
  disposition: "inline" | "attachment",
) {
  const encodedFileName = encodeURIComponent(fileName);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `${disposition}; filename="file.pdf"; filename*=UTF-8''${encodedFileName}`,
  );
}

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

/*
  Ці маршрути зроблені відкритими, щоб файл відкривався в новій вкладці браузера.
  Інакше браузер не передає Authorization header і виникає "missing token".
*/

router.get("/file/:fileName/download", (req, res) => {
  const { fileName, filePath } = getSubmissionFilePath(req.params.fileName);

  setPdfHeaders(res, fileName, "attachment");

  return res.sendFile(filePath, (err) => {
    if (err && !res.headersSent) {
      return res.status(404).json({
        message: "File not found",
      });
    }
  });
});

router.get("/file/:fileName/view", (req, res) => {
  const { fileName, filePath } = getSubmissionFilePath(req.params.fileName);

  setPdfHeaders(res, fileName, "inline");

  return res.sendFile(filePath, (err) => {
    if (err && !res.headersSent) {
      return res.status(404).json({
        message: "File not found",
      });
    }
  });
});

router.get("/public-file/:fileName/view", (req, res) => {
  const { fileName, filePath } = getSubmissionFilePath(req.params.fileName);

  setPdfHeaders(res, fileName, "inline");

  return res.sendFile(filePath, (err) => {
    if (err && !res.headersSent) {
      return res.status(404).json({
        message: "File not found",
      });
    }
  });
});

router.get("/public-file/:fileName/download", (req, res) => {
  const { fileName, filePath } = getSubmissionFilePath(req.params.fileName);

  setPdfHeaders(res, fileName, "attachment");

  return res.sendFile(filePath, (err) => {
    if (err && !res.headersSent) {
      return res.status(404).json({
        message: "File not found",
      });
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

router.patch(
  "/:id/publish",
  requireAuth,
  requireRole(["COMMITTEE"]),
  publishSubmissionHandler,
);

router.get("/:id", requireAuth, getSubmissionByIdHandler);

export default router;