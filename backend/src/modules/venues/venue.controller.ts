import type { Request, Response } from "express";
import { prisma } from "../../config/prisma.js";

export async function listVenues(req: Request, res: Response) {
  const venues = await prisma.venue.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      deadline: true,
      createdAt: true,
      createdBy: { select: { id: true, email: true, role: true } }
    }
  });

  res.json({ venues });
}

export async function createVenue(req: Request, res: Response) {
  const { title, description, type, deadline } = req.body as {
    title?: string;
    description?: string;
    type?: "CONFERENCE" | "JOURNAL";
    deadline?: string;
  };

  if (!title || !description || !type || !deadline) {
    return res.status(400).json({ message: "title, description, type, deadline are required" });
  }

  const payload = (req as any).user as { sub: string };

  const venue = await prisma.venue.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      type,
      deadline: new Date(deadline),
      createdById: payload.sub
    },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      deadline: true,
      createdAt: true
    }
  });

  res.status(201).json({ venue });
}
