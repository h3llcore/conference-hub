import {
  PublicationIssueStatus,
  PublicationIssueType,
  SubmissionStatus,
} from "@prisma/client";
import { prisma } from "../../config/prisma.js";

type CreatePublicationIssueDto = {
  title: string;
  description?: string;
  type: PublicationIssueType;
  venueId: string;
  volume?: number;
  issueNumber?: number;
  year?: number;
  publishedAt?: string;
  createdById: string;
};

type UpdatePublicationIssueDto = Partial<
  Omit<CreatePublicationIssueDto, "createdById">
> & {
  status?: PublicationIssueStatus;
};

export async function getPublicationIssues() {
  return prisma.publicationIssue.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      venue: true,
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      submissions: {
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              institution: true,
            },
          },
        },
      },
    },
  });
}

export async function getPublicationIssueById(id: string) {
  return prisma.publicationIssue.findUnique({
    where: { id },
    include: {
      venue: true,
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      submissions: {
        orderBy: { finalDecisionAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              institution: true,
              country: true,
              orcid: true,
              orcidVerified: true,
              googleScholarUrl: true,
            },
          },
        },
      },
    },
  });
}

export async function createPublicationIssue(data: CreatePublicationIssueDto) {
  return prisma.publicationIssue.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      type: data.type,
      venueId: data.venueId,
      volume: data.volume ?? null,
      issueNumber: data.issueNumber ?? null,
      year: data.year ?? null,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      createdById: data.createdById,
    },
    include: {
      venue: true,
      submissions: true,
    },
  });
}

export async function updatePublicationIssue(
  id: string,
  data: UpdatePublicationIssueDto,
) {
  return prisma.publicationIssue.update({
    where: { id },
    data: {
      title: data.title?.trim(),
      description:
        data.description === undefined ? undefined : data.description?.trim() || null,
      type: data.type,
      venueId: data.venueId,
      volume: data.volume ?? undefined,
      issueNumber: data.issueNumber ?? undefined,
      year: data.year ?? undefined,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
      status: data.status,
    },
    include: {
      venue: true,
      submissions: true,
    },
  });
}

export async function deletePublicationIssue(id: string) {
  return prisma.publicationIssue.delete({
    where: { id },
  });
}

export async function addSubmissionToIssue(issueId: string, submissionId: string) {
  const issue = await prisma.publicationIssue.findUnique({
    where: { id: issueId },
  });

  if (!issue) {
    const error = new Error("Publication issue not found");
    (error as any).status = 404;
    throw error;
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    const error = new Error("Submission not found");
    (error as any).status = 404;
    throw error;
  }

  if (submission.status !== SubmissionStatus.PUBLISHED) {
    const error = new Error("Only published submissions can be added to issue");
    (error as any).status = 400;
    throw error;
  }

  return prisma.submission.update({
    where: { id: submissionId },
    data: {
      publicationIssueId: issueId,
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          institution: true,
        },
      },
      publicationIssue: true,
    },
  });
}

export async function removeSubmissionFromIssue(submissionId: string) {
  return prisma.submission.update({
    where: { id: submissionId },
    data: {
      publicationIssueId: null,
    },
  });
}

export async function publishPublicationIssue(id: string) {
  return prisma.publicationIssue.update({
    where: { id },
    data: {
      status: PublicationIssueStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    include: {
      venue: true,
      submissions: true,
    },
  });
}

export async function getPublishedSubmissionsWithoutIssue() {
  return prisma.submission.findMany({
    where: {
      status: SubmissionStatus.PUBLISHED,
      publicationIssueId: null,
    },
    orderBy: { finalDecisionAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          institution: true,
        },
      },
    },
  });
}