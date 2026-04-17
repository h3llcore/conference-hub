import { prisma } from "../../config/prisma.js";
import { SubmissionStatus, VenueType } from "@prisma/client";

export async function createSubmission(
  userId: string,
  data: any,
  status: SubmissionStatus = SubmissionStatus.SUBMITTED,
) {
  return prisma.submission.create({
    data: {
      title: data.title,
      abstract: data.abstract,
      keywords: data.keywords,
      venueType: data.venueType as VenueType,
      venue: data.venue,
      coAuthors: data.coAuthors || null,
      notes: data.notes || null,
      fileName: data.fileName || null,
      status,
      authorId: userId,
    },
  });
}

export async function getMySubmissions(userId: string) {
  return prisma.submission.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
  });
}
