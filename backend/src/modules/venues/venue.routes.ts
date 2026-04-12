import { Router } from "express";
import { listVenues, createVenue } from "./venue.controller.js";
import { requireAuth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.get("/", listVenues);

router.post("/", requireAuth, requireRole(["COMMITTEE"]), createVenue);

export default router;
