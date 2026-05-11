import type { Request, Response } from "express";
import { prisma } from "../../config/prisma.js";
import { getVenueById, getVenues } from "./venue.service.js";

export async function listVenues(req: Request, res: Response) {
  try {
    const { type, limit, sort } = req.query as {
      type?: "JOURNAL" | "CONFERENCE";
      limit?: string;
      sort?: "newest" | "oldest";
    };

    const venues = await getVenues({
      type,
      limit: limit ? Number(limit) : undefined,
      sort,
    });

    return res.json({ venues });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getVenueDetails(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const venue = await getVenueById(id);

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    return res.json({ venue });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function createVenue(req: Request, res: Response) {
  try {
    const { title, description, type, deadline } = req.body as {
      title?: string;
      description?: string;
      type?: "CONFERENCE" | "JOURNAL";
      deadline?: string;
    };

    if (!title || !description || !type || !deadline) {
      return res.status(400).json({
        message: "title, description, type, deadline are required",
      });
    }

    if (type !== "JOURNAL" && type !== "CONFERENCE") {
      return res.status(400).json({
        message: "Invalid venue type",
      });
    }

    const payload = (req as any).user as { sub: string };

    if (!payload?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const venue = await prisma.venue.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        type,
        deadline: new Date(deadline),
        createdById: payload.sub,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        deadline: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ venue });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateVenue(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { title, description, deadline } = req.body as {
      title?: string;
      description?: string;
      deadline?: string;
    };

    if (!title || !description || !deadline) {
      return res.status(400).json({
        message: "title, description and deadline are required",
      });
    }

    const venue = await prisma.venue.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description.trim(),
        deadline: new Date(deadline),
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        deadline: true,
        createdAt: true,
      },
    });

    return res.json({ venue });
  } catch (e: any) {
    console.error(e);

    if (e.code === "P2025") {
      return res.status(404).json({ message: "Venue not found" });
    }

    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteVenue(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.venue.delete({
      where: { id },
    });

    return res.json({ message: "Venue deleted" });
  } catch (e: any) {
    console.error(e);

    if (e.code === "P2025") {
      return res.status(404).json({ message: "Venue not found" });
    }

    return res.status(500).json({ message: "Server error" });
  }
}