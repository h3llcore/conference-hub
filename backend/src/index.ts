import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./config/prisma.js";
import authRoutes from "./modules/auth/auth.routes.js";
import venueRoutes from "./modules/venues/venue.routes.js";
import submissionsRoutes from "./modules/submissions/submissions.routes.js";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/submissions", submissionsRoutes);

app.get("/api/health", async (req, res) => {
  try {
    // простий запит до БД, щоб перевірити з'єднання
    const usersCount = await prisma.user.count();
    res.json({ ok: true, message: "API is running", usersCount });
  } catch (e) {
    res.status(500).json({ ok: false, message: "DB error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API: http://localhost:${PORT}`));
