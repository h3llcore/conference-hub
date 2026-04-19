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