import type { Request, Response } from "express";
import { prisma } from "../../config/prisma.js";
import { getVenues } from "./venue.service.js";

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

export async function createVenue(req: Request, res: Response) {
  try {
    const { title, description, type, deadline } = req.body as {
      title?: string;
      description?: string;
      type?: "CONFERENCE" | "JOURNAL";
      deadline?: string;
    };

    if (!title || !description || !type || !deadline) {
      return res
        .status(400)
        .json({ message: "title, description, type, deadline are required" });
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
        createdBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json({ venue });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}