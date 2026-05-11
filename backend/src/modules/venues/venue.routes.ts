import { Router } from "express";
import { createVenue, getVenueDetails, listVenues } from "./venue.controller.js";
import { requireAuth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.get("/", listVenues);

router.get("/:id", getVenueDetails);

router.post("/", requireAuth, requireRole(["COMMITTEE"]), createVenue);

export default router;