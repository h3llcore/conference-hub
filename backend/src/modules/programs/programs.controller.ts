import type { Request, Response } from "express";
import {
  addProgramItem,
  createConferenceProgram,
  createProgramSection,
  getAcceptedConferenceSubmissions,
  getConferenceProgramById,
  getConferencePrograms,
  publishConferenceProgram,
  sendConferenceInvitations,
  archiveConferenceProgram,
  finishConferenceProgram,
} from "./programs.service.js";

export async function createConferenceProgramHandler(
  req: Request,
  res: Response,
) {
  try {
    const userId = (req as any).user?.sub;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { venueId, title, description, meetingUrl, startDate, endDate } =
      req.body;

    if (!venueId || !title || !startDate) {
      return res
        .status(400)
        .json({ message: "venueId, title and startDate are required" });
    }

    const program = await createConferenceProgram(userId, {
      venueId,
      title,
      description,
      meetingUrl,
      startDate,
      endDate,
    });

    return res.status(201).json({ program });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function getConferenceProgramsHandler(
  _req: Request,
  res: Response,
) {
  try {
    const programs = await getConferencePrograms();
    return res.json({ programs });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getConferenceProgramByIdHandler(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;

    const program = await getConferenceProgramById(id);

    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    return res.json({ program });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function getAcceptedConferenceSubmissionsHandler(
  req: Request,
  res: Response,
) {
  try {
    const venueTitle =
      typeof req.query.venue === "string" ? req.query.venue : undefined;

    const submissions = await getAcceptedConferenceSubmissions(venueTitle);

    return res.json({ submissions });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function createProgramSectionHandler(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;
    const { title, description, order, startTime, endTime } = req.body;

    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }

    const section = await createProgramSection(id, {
      title,
      description,
      order,
      startTime,
      endTime,
    });

    return res.status(201).json({ section });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function addProgramItemHandler(req: Request, res: Response) {
  try {
    const {
      sectionId,
      submissionId,
      title,
      speakerName,
      speakerEmail,
      startTime,
      endTime,
      order,
    } = req.body;

    if (!sectionId || !title || !speakerName) {
      return res.status(400).json({
        message: "sectionId, title and speakerName are required",
      });
    }

    const item = await addProgramItem({
      sectionId,
      submissionId,
      title,
      speakerName,
      speakerEmail,
      startTime,
      endTime,
      order,
    });

    return res.status(201).json({ item });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function publishConferenceProgramHandler(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;

    const program = await publishConferenceProgram(id);

    return res.json({ program });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function sendConferenceInvitationsHandler(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;

    const invitations = await sendConferenceInvitations(id);

    return res.json({ invitations });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function finishConferenceProgramHandler(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;

    const program = await finishConferenceProgram(id);

    return res.json({ program });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}

export async function archiveConferenceProgramHandler(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;

    const program = await archiveConferenceProgram(id);

    return res.json({ program });
  } catch (e: any) {
    console.error(e);
    return res.status(e.status || 500).json({
      message: e.message || "Server error",
    });
  }
}