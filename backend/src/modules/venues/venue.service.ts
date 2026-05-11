import { prisma } from "../../config/prisma.js";
import { VenueType } from "@prisma/client";

type GetVenuesOptions = {
  type?: "JOURNAL" | "CONFERENCE";
  limit?: number;
  sort?: "newest" | "oldest";
};

export async function getVenues(options: GetVenuesOptions = {}) {
  const { type, limit, sort = "newest" } = options;

  return prisma.venue.findMany({
    where: type ? { type: type as VenueType } : undefined,
    orderBy: {
      createdAt: sort === "oldest" ? "asc" : "desc",
    },
    take: limit,
  });
}

export async function getVenueById(id: string) {
  const venue = await prisma.venue.findUnique({
    where: { id },
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

  if (!venue) return null;

  const [publishedIssues, publishedArticlesCount] = await Promise.all([
    prisma.publicationIssue.findMany({
      where: {
        venueId: id,
        status: "PUBLISHED",
      },
      orderBy: {
        publishedAt: "desc",
      },
      include: {
        submissions: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),

    prisma.submission.count({
      where: {
        status: "PUBLISHED",
        venueType: venue.type,
        venue: venue.title,
      },
    }),
  ]);

  const issuesCount = publishedIssues.length;

  const rating = Math.min(
    5,
    3.5 + publishedArticlesCount * 0.1 + issuesCount * 0.05,
  );

  return {
    ...venue,
    rating: Number(rating.toFixed(1)),
    stats: {
      publishedIssues: issuesCount,
      publishedArticles: publishedArticlesCount,
    },
    publishedIssues,
  };
}