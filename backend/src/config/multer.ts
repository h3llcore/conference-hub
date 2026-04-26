import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads", "submissions");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function fixFileNameEncoding(fileName: string) {
  return Buffer.from(fileName, "latin1").toString("utf8");
}

function makeSafeFileName(fileName: string) {
  return fileName.replace(/[<>:"/\\|?*]+/g, "_");
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const originalName = fixFileNameEncoding(file.originalname);
    const safeName = makeSafeFileName(originalName);
    const uniqueName = `${Date.now()}_${safeName}`;

    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only PDF and DOCX files are allowed"));
    }

    cb(null, true);
  },
});