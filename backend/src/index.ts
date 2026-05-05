import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./config/prisma.js";
import authRoutes from "./modules/auth/auth.routes.js";
import venueRoutes from "./modules/venues/venue.routes.js";
import submissionsRoutes from "./modules/submissions/submissions.routes.js";
import assignmentsRoutes from "./modules/assignments/assignments.routes.js";
import reviewsRoutes from "./modules/reviews/reviews.routes.js";
import notificationsRoutes from "./modules/notifications/notifications.routes.js";
import path from "path";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/submissions", submissionsRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/notifications", notificationsRoutes);

app.get("/api/health", async (req, res) => {
  try {
    const usersCount = await prisma.user.count();
    res.json({ ok: true, message: "API is running", usersCount });
  } catch (e) {
    res.status(500).json({ ok: false, message: "DB error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API: http://localhost:${PORT}`));
