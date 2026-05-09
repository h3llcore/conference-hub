import { prisma } from "../../config/prisma.js";
import {
  AssignmentStatus,
  NotificationType,
  SubmissionStatus,
  VenueType,
} from "@prisma/client";
import { createNotification } from "../notifications/notifications.service.js";

async function notifyCommitteeAboutSubmission(submissionId: string, title: string) {
  const committeeUsers = await prisma.user.findMany({
    where: { role: "COMMITTEE" },
    select: { id: true },
  });

  await Promise.all(
    committeeUsers.map((user) =>
      createNotification({
        userId: user.id,
        title: "Нове подання",
        message: `Автор подав роботу "${title}".`,
        type: NotificationType.SUBMISSION_CREATED,
        link: `/committee?submission=${submissionId}`,
      }),
    ),
  );
}

export async function createSubmission(
  userId: string,
  data: any,
  status: SubmissionStatus = SubmissionStatus.SUBMITTED,
) {
  const submission = await prisma.submission.create({
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

  if (status === SubmissionStatus.SUBMITTED) {
    await notifyCommitteeAboutSubmission(submission.id, submission.title);
  }

  return submission;
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

  let nextStatus: SubmissionStatus = SubmissionStatus.SUBMITTED;
  let nextVersion = existing.version;
  let nextRound = existing.currentRound;

  if (data?.status === "DRAFT") {
    nextStatus = SubmissionStatus.DRAFT;
  } else if (
    existing.status === SubmissionStatus.REVISION_REQUIRED &&
    (data?.status === "RESUBMITTED" || data?.status === "SUBMITTED")
  ) {
    nextStatus = SubmissionStatus.RESUBMITTED;
    nextVersion = existing.version + 1;
    nextRound = existing.currentRound + 1;
  } else {
    nextStatus = SubmissionStatus.SUBMITTED;
  }

  const submission = await prisma.submission.update({
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
      status: nextStatus,
      version: nextVersion,
      currentRound: nextRound,
    },
  });

  if (
    nextStatus === SubmissionStatus.SUBMITTED ||
    nextStatus === SubmissionStatus.RESUBMITTED
  ) {
    await notifyCommitteeAboutSubmission(submission.id, submission.title);
  }

  return submission;
}

export async function getReviewerSubmissions() {
  return prisma.submission.findMany({
    where: {
      status: {
        in: [
          SubmissionStatus.SUBMITTED,
          SubmissionStatus.UNDER_REVIEW,
          SubmissionStatus.ACCEPTED,
          SubmissionStatus.REJECTED,
          SubmissionStatus.REVISION_REQUIRED,
          SubmissionStatus.RESUBMITTED,
        ],
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      abstract: true,
      keywords: true,
      venueType: true,
      venue: true,
      coAuthors: true,
      notes: true,
      fileName: true,
      status: true,
      version: true,
      currentRound: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getCommitteeSubmissions() {
  return prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
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
  });
}

export async function getReviewerSubmissionById(submissionId: string) {
  return prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      title: true,
      abstract: true,
      keywords: true,
      venueType: true,
      venue: true,
      coAuthors: true,
      notes: true,
      fileName: true,
      status: true,
      version: true,
      currentRound: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function assertLatestRoundIsCompleted(submissionId: string) {
  const assignments = await prisma.submissionReviewer.findMany({
    where: { submissionId },
    select: {
      id: true,
      round: true,
      status: true,
    },
    orderBy: { round: "desc" },
  });

  if (assignments.length === 0) {
    const error = new Error(
      "Cannot make a final decision before assigning reviewers",
    );
    (error as any).status = 409;
    throw error;
  }

  const latestRound = Math.max(...assignments.map((item) => item.round));

  const latestRoundAssignments = assignments.filter(
    (item) => item.round === latestRound,
  );

  const hasIncompleteReview = latestRoundAssignments.some(
    (assignment) => assignment.status !== AssignmentStatus.COMPLETED,
  );

  if (hasIncompleteReview) {
    const error = new Error(
      "Cannot make a final decision until all reviewers complete the latest round",
    );
    (error as any).status = 409;
    throw error;
  }
}

function getStatusNotificationText(status: SubmissionStatus) {
  if (status === SubmissionStatus.REVISION_REQUIRED) {
    return {
      title: "Потрібне доопрацювання",
      message: "Вашу роботу повернуто на доопрацювання.",
    };
  }

  if (status === SubmissionStatus.ACCEPTED) {
    return {
      title: "Роботу прийнято",
      message: "Вашу роботу прийнято до публікації.",
    };
  }

  if (status === SubmissionStatus.REJECTED) {
    return {
      title: "Роботу відхилено",
      message: "Вашу роботу відхилено за результатами розгляду.",
    };
  }

  if (status === SubmissionStatus.PUBLISHED) {
    return {
      title: "Роботу опубліковано",
      message: "Вашу роботу опубліковано.",
    };
  }

  return {
    title: "Статус подання змінено",
    message: `Статус вашої роботи змінено на ${status}.`,
  };
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: SubmissionStatus,
) {
  const existing = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      author: {
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
  });

  if (!existing) {
    return null;
  }

  if (
    status === SubmissionStatus.REVISION_REQUIRED ||
    status === SubmissionStatus.ACCEPTED ||
    status === SubmissionStatus.REJECTED ||
    status === SubmissionStatus.PUBLISHED
  ) {
    await assertLatestRoundIsCompleted(submissionId);
  }

  const submission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status,
      finalDecisionAt:
        status === SubmissionStatus.ACCEPTED ||
        status === SubmissionStatus.REJECTED
          ? new Date()
          : existing.finalDecisionAt,
      publishedAt:
        status === SubmissionStatus.PUBLISHED
          ? new Date()
          : existing.publishedAt,
    },
    include: {
      author: {
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
  });

  if (
    status === SubmissionStatus.REVISION_REQUIRED ||
    status === SubmissionStatus.ACCEPTED ||
    status === SubmissionStatus.REJECTED ||
    status === SubmissionStatus.PUBLISHED
  ) {
    const notificationText = getStatusNotificationText(status);

    await createNotification({
      userId: submission.authorId,
      title: notificationText.title,
      message: `${notificationText.message} Назва: "${submission.title}".`,
      type: NotificationType.SUBMISSION_STATUS_CHANGED,
      link: `/author/submission/${submission.id}`,
    });
  }

  return submission;
}

export async function publishSubmission(submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { author: true },
  });

  if (!submission) {
    const error = new Error("Submission not found");
    (error as any).status = 404;
    throw error;
  }

  if (submission.status !== SubmissionStatus.ACCEPTED) {
    const error = new Error("Only accepted submissions can be published");
    (error as any).status = 400;
    throw error;
  }

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: SubmissionStatus.PUBLISHED,
      finalDecisionAt: new Date(),
    },
    include: {
      author: {
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
  });

  await createNotification({
    userId: submission.authorId,
    title: "Статтю опубліковано",
    message: `Вашу статтю "${submission.title}" опубліковано на платформі.`,
    type: NotificationType.SUBMISSION_STATUS_CHANGED,
    link: `/author/submission/${submission.id}`,
  });

  return updated;
}
