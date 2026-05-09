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
  const [items, publishedSubmissions] = await Promise.all([
    prisma.homeContent.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    }),

    prisma.submission.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { finalDecisionAt: "desc" },
      take: 5,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            institution: true,
          },
        },
      },
    }),
  ]);

  return {
    journals: items.filter((item) => item.type === "JOURNAL"),

    articles: publishedSubmissions.map((item) => ({
      id: item.id,
      type: "ARTICLE",
      title: item.title,
      description: item.abstract,
      authorName: item.author
        ? `${item.author.firstName} ${item.author.lastName}`
        : "Анонім",
      linkUrl: `/articles/${item.id}`,
      imageUrl: null,
      rating: null,
      date: item.finalDecisionAt || item.createdAt,
      isPublished: true,
      createdAt: item.createdAt,
    })),

    news: items.filter((item) => item.type === "NEWS"),
  };
}

export async function getHomeContentById(id: string) {
  return prisma.homeContent.findFirst({
    where: {
      id,
      isPublished: true,
    },
    include: {
      createdBy: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
}

export async function getPublishedArticleById(id: string) {
  return prisma.submission.findFirst({
    where: {
      id,
      status: "PUBLISHED",
    },
    include: {
      author: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          institution: true,
          country: true,
          academicDegree: true,
          academicTitle: true,
          orcid: true,
          orcidVerified: true,
          googleScholarUrl: true,
        },
      },
    },
  });
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