export type ConferenceProgramStatus = "DRAFT" | "PUBLISHED";

export type ProgramVenue = {
  id: string;
  title: string;
  description: string;
  type: "CONFERENCE" | "JOURNAL";
  deadline: string;
};

export type ProgramAuthor = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  institution?: string;
  country?: string;
};

export type ProgramSubmission = {
  id: string;
  title: string;
  abstract?: string;
  keywords?: string;
  author?: ProgramAuthor;
};

export type ConferenceProgramItem = {
  id: string;
  title: string;
  speakerName: string;
  speakerEmail?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  order: number;
  submission?: ProgramSubmission | null;
};

export type ConferenceProgramSection = {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  startTime?: string | null;
  endTime?: string | null;
  items: ConferenceProgramItem[];
};

export type ConferenceInvitation = {
  id: string;
  email: string;
  fullName: string;
  sentAt: string;
};

export type ConferenceProgram = {
  id: string;
  title: string;
  description?: string | null;
  meetingUrl?: string | null;
  startDate: string;
  endDate?: string | null;
  status: ConferenceProgramStatus;
  createdAt: string;
  publishedAt?: string | null;
  venue: ProgramVenue;
  sections: ConferenceProgramSection[];
  invitations?: ConferenceInvitation[];
};

export type AcceptedConferenceSubmission = {
  id: string;
  title: string;
  abstract: string;
  keywords: string;
  venue: string;
  author: ProgramAuthor;
};