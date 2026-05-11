import { VenueType, type Venue } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

type GetVenuesOptions = {
  type?: "JOURNAL" | "CONFERENCE";
  limit?: number;
  sort?: "newest" | "oldest";
};

type VenueWithMetrics = Venue & {
  rating: number;
  stats: {
    publishedIssues: number;
    publishedArticles: number;
  };
};

function calculateVenueRating(params: {
  publishedArticles: number;
  publishedIssues: number;
}) {
  const { publishedArticles, publishedIssues } = params;

  const rawRating = 3.5 + publishedArticles * 0.1 + publishedIssues * 0.05;

  return Number(Math.min(5, rawRating).toFixed(1));
}

async function attachVenueMetrics<T extends Venue>(
  venue: T,
): Promise<T & VenueWithMetrics> {
  const [publishedIssues, publishedArticles] = await Promise.all([
    prisma.publicationIssue.count({
      where: {
        venueId: venue.id,
        status: "PUBLISHED",
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

  return {
    ...venue,
    rating: calculateVenueRating({
      publishedArticles,
      publishedIssues,
    }),
    stats: {
      publishedIssues,
      publishedArticles,
    },
  };
}

export async function getVenues(options: GetVenuesOptions = {}) {
  const { type, limit, sort = "newest" } = options;

  const venues = await prisma.venue.findMany({
    where: type ? { type: type as VenueType } : undefined,
    orderBy: {
      createdAt: sort === "oldest" ? "asc" : "desc",
    },
    take: limit,
  });

  return Promise.all(venues.map((venue) => attachVenueMetrics(venue)));
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

  const [venueWithMetrics, publishedIssues] = await Promise.all([
    attachVenueMetrics(venue),

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
  ]);

  return {
    ...venueWithMetrics,
    publishedIssues,
  };
}