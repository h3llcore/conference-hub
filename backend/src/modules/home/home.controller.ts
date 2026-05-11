import type { Request, Response } from "express";
import { HomeContentType } from "@prisma/client";
import {
  createHomeContent,
  deleteHomeContent,
  getAllHomeContent,
  getHomeContentById,
  getHomeStats,
  getPublishedArticleById,
  getPublishedHomeContent,
  updateHomeContent,
  searchPublishedArticles,
} from "./home.service.js";

export async function getPublishedHomeContentHandler(
  req: Request,
  res: Response,
) {
  try {
    const data = await getPublishedHomeContent();
    return res.json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getHomeStatsHandler(req: Request, res: Response) {
  try {
    const stats = await getHomeStats();
    return res.json({ stats });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function searchPublishedArticlesHandler(
  req: Request,
  res: Response,
) {
  try {
    const { q, author } = req.query;

    const articles = await searchPublishedArticles({
      query: typeof q === "string" ? q : "",
      author: typeof author === "string" ? author : "",
    });

    return res.json({ articles });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getHomeContentByIdHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const item = await getHomeContentById(id);

    if (!item) {
      return res.status(404).json({ message: "Content not found" });
    }

    return res.json({ item });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getPublishedArticleByIdHandler(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;

    const article = await getPublishedArticleById(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    return res.json({ article });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getAllHomeContentHandler(req: Request, res: Response) {
  try {
    const items = await getAllHomeContent();
    return res.json({ items });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function createHomeContentHandler(req: Request, res: Response) {
  try {
    const user = (req as any).user as { sub: string };

    const {
      type,
      title,
      description,
      authorName,
      linkUrl,
      imageUrl,
      rating,
      date,
      isPublished,
    } = req.body;

    if (!Object.values(HomeContentType).includes(type)) {
      return res.status(400).json({ message: "Invalid content type" });
    }

    if (type === HomeContentType.ARTICLE) {
      return res.status(400).json({
        message: "Articles are published from accepted submissions only",
      });
    }

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const item = await createHomeContent({
      type,
      title,
      description,
      authorName,
      linkUrl,
      imageUrl,
      rating: rating ? Number(rating) : undefined,
      date,
      isPublished,
      createdById: user.sub,
    });

    return res.status(201).json({ item });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateHomeContentHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const item = await updateHomeContent(id, {
      ...req.body,
      rating: req.body.rating ? Number(req.body.rating) : undefined,
    });

    return res.json({ item });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteHomeContentHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await deleteHomeContent(id);

    return res.json({ message: "Content deleted" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}