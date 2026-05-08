import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import {
  addProgramItemHandler,
  createConferenceProgramHandler,
  createProgramSectionHandler,
  getAcceptedConferenceSubmissionsHandler,
  getConferenceProgramByIdHandler,
  getConferenceProgramsHandler,
  publishConferenceProgramHandler,
  sendConferenceInvitationsHandler,
} from "./programs.controller.js";

const router = Router();

router.get("/", getConferenceProgramsHandler);

router.get("/accepted-submissions", requireAuth, getAcceptedConferenceSubmissionsHandler);

router.get("/:id", getConferenceProgramByIdHandler);

router.post(
  "/",
  requireAuth,
  requireRole(["COMMITTEE"]),
  createConferenceProgramHandler,
);

router.post(
  "/:id/sections",
  requireAuth,
  requireRole(["COMMITTEE"]),
  createProgramSectionHandler,
);

router.post(
  "/items",
  requireAuth,
  requireRole(["COMMITTEE"]),
  addProgramItemHandler,
);

router.patch(
  "/:id/publish",
  requireAuth,
  requireRole(["COMMITTEE"]),
  publishConferenceProgramHandler,
);

router.post(
  "/:id/invitations",
  requireAuth,
  requireRole(["COMMITTEE"]),
  sendConferenceInvitationsHandler,
);

export default router;