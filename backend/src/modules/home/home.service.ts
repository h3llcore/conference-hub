import { HomeContentType } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

type CreateHomeContentDto = {
  type: HomeContentType;
  title: string;
  description: string;
  authorName?: string;
  linkUrl?: string;
  imageUrl?: string;
  rating?: number;
  date?: string;
  isPublished?: boolean;
  createdById: string;
};

export async function getPublishedHomeContent() {
  const items = await prisma.homeContent.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return {
    journals: items.filter((item) => item.type === "JOURNAL"),
    articles: items.filter((item) => item.type === "ARTICLE"),
    news: items.filter((item) => item.type === "NEWS"),
  };
}

export async function getAllHomeContent() {
  return prisma.homeContent.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
}

export async function createHomeContent(data: CreateHomeContentDto) {
  return prisma.homeContent.create({
    data: {
      type: data.type,
      title: data.title.trim(),
      description: data.description.trim(),
      authorName: data.authorName?.trim() || null,
      linkUrl: data.linkUrl?.trim() || null,
      imageUrl: data.imageUrl?.trim() || null,
      rating: data.rating ?? null,
      date: data.date ? new Date(data.date) : null,
      isPublished: data.isPublished ?? true,
      createdById: data.createdById,
    },
  });
}

export async function updateHomeContent(
  id: string,
  data: Partial<CreateHomeContentDto>,
) {
  return prisma.homeContent.update({
    where: { id },
    data: {
      type: data.type,
      title: data.title?.trim(),
      description: data.description?.trim(),
      authorName: data.authorName?.trim() || null,
      linkUrl: data.linkUrl?.trim() || null,
      imageUrl: data.imageUrl?.trim() || null,
      rating: data.rating ?? null,
      date: data.date ? new Date(data.date) : null,
      isPublished: data.isPublished,
    },
  });
}

export async function deleteHomeContent(id: string) {
  return prisma.homeContent.delete({
    where: { id },
  });
}