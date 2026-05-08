import { prisma } from "../../config/prisma.js";
import {
  ConferenceProgramStatus,
  NotificationType,
  SubmissionStatus,
  VenueType,
} from "@prisma/client";
import { createNotification } from "../notifications/notifications.service.js";

type CreateProgramInput = {
  venueId: string;
  title: string;
  description?: string;
  meetingUrl?: string;
  startDate: string;
  endDate?: string;
};

type CreateSectionInput = {
  title: string;
  description?: string;
  order?: number;
  startTime?: string;
  endTime?: string;
};

type AddItemInput = {
  sectionId: string;
  submissionId?: string;
  title: string;
  speakerName: string;
  speakerEmail?: string;
  startTime?: string;
  endTime?: string;
  order?: number;
};

export async function createConferenceProgram(
  committeeUserId: string,
  input: CreateProgramInput,
) {
  const venue = await prisma.venue.findUnique({
    where: { id: input.venueId },
  });

  if (!venue) {
    const error = new Error("Conference not found");
    (error as any).status = 404;
    throw error;
  }

  if (venue.type !== VenueType.CONFERENCE) {
    const error = new Error("Program can be created only for conferences");
    (error as any).status = 400;
    throw error;
  }

  return prisma.conferenceProgram.create({
    data: {
      venueId: input.venueId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      meetingUrl: input.meetingUrl?.trim() || null,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      createdById: committeeUserId,
    },
    include: {
      venue: true,
      sections: {
        include: {
          items: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getConferencePrograms() {
  return prisma.conferenceProgram.findMany({
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
      sections: {
        include: {
          items: {
            include: {
              submission: {
                select: {
                  id: true,
                  title: true,
                  author: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getConferenceProgramById(programId: string) {
  return prisma.conferenceProgram.findUnique({
    where: { id: programId },
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
      sections: {
        include: {
          items: {
            include: {
              submission: {
                select: {
                  id: true,
                  title: true,
                  keywords: true,
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
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      invitations: {
        orderBy: { sentAt: "desc" },
      },
    },
  });
}

export async function getAcceptedConferenceSubmissions(venueTitle?: string) {
  return prisma.submission.findMany({
    where: {
      venueType: VenueType.CONFERENCE,
      status: SubmissionStatus.ACCEPTED,
      ...(venueTitle ? { venue: venueTitle } : {}),
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
          country: true,
        },
      },
    },
  });
}

export async function createProgramSection(
  programId: string,
  input: CreateSectionInput,
) {
  const program = await prisma.conferenceProgram.findUnique({
    where: { id: programId },
  });

  if (!program) {
    const error = new Error("Program not found");
    (error as any).status = 404;
    throw error;
  }

  return prisma.conferenceProgramSection.create({
    data: {
      programId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      order: input.order || 1,
      startTime: input.startTime ? new Date(input.startTime) : null,
      endTime: input.endTime ? new Date(input.endTime) : null,
    },
    include: {
      items: true,
    },
  });
}

export async function addProgramItem(input: AddItemInput) {
  const section = await prisma.conferenceProgramSection.findUnique({
    where: { id: input.sectionId },
    include: {
      program: true,
    },
  });

  if (!section) {
    const error = new Error("Program section not found");
    (error as any).status = 404;
    throw error;
  }

  if (input.submissionId) {
    const submission = await prisma.submission.findUnique({
      where: { id: input.submissionId },
    });

    if (!submission) {
      const error = new Error("Submission not found");
      (error as any).status = 404;
      throw error;
    }

    if (submission.status !== SubmissionStatus.ACCEPTED) {
      const error = new Error("Only accepted submissions can be added to program");
      (error as any).status = 400;
      throw error;
    }
  }

  return prisma.conferenceProgramItem.create({
    data: {
      sectionId: input.sectionId,
      submissionId: input.submissionId || null,
      title: input.title.trim(),
      speakerName: input.speakerName.trim(),
      speakerEmail: input.speakerEmail?.trim() || null,
      startTime: input.startTime ? new Date(input.startTime) : null,
      endTime: input.endTime ? new Date(input.endTime) : null,
      order: input.order || 1,
    },
    include: {
      submission: {
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

export async function publishConferenceProgram(programId: string) {
  const program = await prisma.conferenceProgram.update({
    where: { id: programId },
    data: {
      status: ConferenceProgramStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    include: {
      venue: true,
      sections: {
        include: {
          items: {
            include: {
              submission: {
                include: {
                  author: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const authorIds = new Set<string>();

  for (const section of program.sections) {
    for (const item of section.items) {
      if (item.submission?.authorId) {
        authorIds.add(item.submission.authorId);
      }
    }
  }

  await Promise.all(
    [...authorIds].map((userId) =>
      createNotification({
        userId,
        title: "Опубліковано програму конференції",
        message: `Опубліковано програму конференції "${program.venue.title}".`,
        type: NotificationType.CONFERENCE_PROGRAM_CREATED,
        link: `/programs/${program.id}`,
      }),
    ),
  );

  return program;
}

export async function sendConferenceInvitations(programId: string) {
  const program = await prisma.conferenceProgram.findUnique({
    where: { id: programId },
    include: {
      venue: true,
      sections: {
        include: {
          items: {
            include: {
              submission: {
                include: {
                  author: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!program) {
    const error = new Error("Program not found");
    (error as any).status = 404;
    throw error;
  }

  const recipients = new Map<
    string,
    { email: string; fullName: string; userId?: string }
  >();

  for (const section of program.sections) {
    for (const item of section.items) {
      if (item.submission?.author) {
        const author = item.submission.author;
        recipients.set(author.email, {
          email: author.email,
          fullName: `${author.firstName} ${author.lastName}`,
          userId: author.id,
        });
      } else if (item.speakerEmail) {
        recipients.set(item.speakerEmail, {
          email: item.speakerEmail,
          fullName: item.speakerName,
        });
      }
    }
  }

  const invitations = await prisma.$transaction(
    [...recipients.values()].map((recipient) =>
      prisma.conferenceInvitation.create({
        data: {
          programId,
          email: recipient.email,
          fullName: recipient.fullName,
          userId: recipient.userId || null,
        },
      }),
    ),
  );

  await Promise.all(
    [...recipients.values()]
      .filter((recipient) => recipient.userId)
      .map((recipient) =>
        createNotification({
          userId: recipient.userId!,
          title: "Запрошення на конференцію",
          message: `Вас запрошено до участі в конференції "${program.venue.title}".`,
          type: NotificationType.CONFERENCE_INVITATION_SENT,
          link: `/programs/${program.id}`,
        }),
      ),
  );

  return invitations;
}