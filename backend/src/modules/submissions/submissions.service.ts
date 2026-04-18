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

export async function getSubmissionById(submissionId: string, userId: string) {
  return prisma.submission.findFirst({
    where: {
      id: submissionId,
      authorId: userId,
    },
  });
}

export async function updateSubmission(
  submissionId: string,
  userId: string,
  data: any,
) {
  const existing = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      authorId: userId,
    },
  });

  if (!existing) {
    return null;
  }

  const status =
    data?.status === "DRAFT"
      ? SubmissionStatus.DRAFT
      : SubmissionStatus.SUBMITTED;

  return prisma.submission.update({
    where: { id: submissionId },
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
    },
  });
}