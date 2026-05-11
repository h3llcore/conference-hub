import { Router } from "express";
import {
  createVenue,
  deleteVenue,
  getVenueDetails,
  listVenues,
  updateVenue,
} from "./venue.controller.js";
import { requireAuth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = Router();

router.get("/", listVenues);

router.get("/:id", getVenueDetails);

router.post("/", requireAuth, requireRole(["COMMITTEE"]), createVenue);

router.patch("/:id", requireAuth, requireRole(["COMMITTEE"]), updateVenue);

router.delete("/:id", requireAuth, requireRole(["COMMITTEE"]), deleteVenue);

export default router;