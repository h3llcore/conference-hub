import { prisma } from "../../config/prisma.js";
import {
  AssignmentStatus,
  ReviewDecision,
  ReviewScore,
} from "@prisma/client";

type ReviewPayload = {
  submissionId: string;
  titleScore: ReviewScore;
  relevanceScore: ReviewScore;
  abstractScore: ReviewScore;
  structureScore: ReviewScore;
  methodologyScore: ReviewScore;
  formattingScore: ReviewScore;
  referencesScore: ReviewScore;
  overallScore: ReviewScore;
  comments?: string;
  recommendations?: string;
  conclusion?: string;
  decision: ReviewDecision;
};

export async function createOrUpdateReview(
  reviewerId: string,
  payload: ReviewPayload,
) {
  const submission = await prisma.submission.findUnique({
    where: { id: payload.submissionId },
    select: {
      id: true,
      currentRound: true,
    },
  });

  if (!submission) {
    const error = new Error("Submission not found");
    (error as any).status = 404;
    throw error;
  }

  const assignment = await prisma.submissionReviewer.findUnique({
    where: {
      submissionId_reviewerId_round: {
        submissionId: payload.submissionId,
        reviewerId,
        round: submission.currentRound,
      },
    },
  });

  if (!assignment) {
    const error = new Error("Reviewer is not assigned to this submission");
    (error as any).status = 403;
    throw error;
  }

  const review = await prisma.review.upsert({
    where: {
      submissionId_reviewerId_round: {
        submissionId: payload.submissionId,
        reviewerId,
        round: submission.currentRound,
      },
    },
    update: {
      titleScore: payload.titleScore,
      relevanceScore: payload.relevanceScore,
      abstractScore: payload.abstractScore,
      structureScore: payload.structureScore,
      methodologyScore: payload.methodologyScore,
      formattingScore: payload.formattingScore,
      referencesScore: payload.referencesScore,
      overallScore: payload.overallScore,
      comments: payload.comments || null,
      recommendations: payload.recommendations || null,
      conclusion: payload.conclusion || null,
      decision: payload.decision,
    },
    create: {
      submissionId: payload.submissionId,
      reviewerId,
      round: submission.currentRound,
      titleScore: payload.titleScore,
      relevanceScore: payload.relevanceScore,
      abstractScore: payload.abstractScore,
      structureScore: payload.structureScore,
      methodologyScore: payload.methodologyScore,
      formattingScore: payload.formattingScore,
      referencesScore: payload.referencesScore,
      overallScore: payload.overallScore,
      comments: payload.comments || null,
      recommendations: payload.recommendations || null,
      conclusion: payload.conclusion || null,
      decision: payload.decision,
    },
    include: {
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  await prisma.submissionReviewer.update({
    where: {
      submissionId_reviewerId_round: {
        submissionId: payload.submissionId,
        reviewerId,
        round: submission.currentRound,
      },
    },
    data: {
      status: AssignmentStatus.COMPLETED,
    },
  });

  return review;
}

export async function getSubmissionReviewsForCommittee(submissionId: string) {
  return prisma.review.findMany({
    where: { submissionId },
    include: {
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          institution: true,
          country: true,
        },
      },
    },
    orderBy: [{ round: "desc" }, { createdAt: "desc" }],
  });
}

export async function getSubmissionReviewsForAuthor(submissionId: string) {
  return prisma.review.findMany({
    where: { submissionId },
    select: {
      id: true,
      round: true,
      titleScore: true,
      relevanceScore: true,
      abstractScore: true,
      structureScore: true,
      methodologyScore: true,
      formattingScore: true,
      referencesScore: true,
      overallScore: true,
      comments: true,
      recommendations: true,
      conclusion: true,
      decision: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [{ round: "desc" }, { createdAt: "desc" }],
  });
}

export async function getMyReviewBySubmission(
  submissionId: string,
  reviewerId: string,
) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      currentRound: true,
    },
  });

  if (!submission) {
    return null;
  }

  return prisma.review.findUnique({
    where: {
      submissionId_reviewerId_round: {
        submissionId,
        reviewerId,
        round: submission.currentRound,
      },
    },
  });
}