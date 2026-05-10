import { http } from "../../api/http";

export type PublicationIssueType = "JOURNAL" | "CONFERENCE";
export type PublicationIssueStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type IssueSubmission = {
  id: string;
  title: string;
  abstract: string;
  keywords: string;
  venueType: "JOURNAL" | "CONFERENCE";
  venue: string;
  fileName?: string | null;
  finalDecisionAt?: string | null;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    institution: string;
  };
};

export type PublicationIssue = {
  id: string;
  title: string;
  description?: string | null;
  type: PublicationIssueType;
  status: PublicationIssueStatus;
  volume?: number | null;
  issueNumber?: number | null;
  year?: number | null;
  publishedAt?: string | null;
  createdAt: string;
  venue?: {
    id: string;
    title: string;
    type: "JOURNAL" | "CONFERENCE";
  };
  submissions: IssueSubmission[];
};

export type CreatePublicationIssuePayload = {
  title: string;
  description?: string;
  type: PublicationIssueType;
  venueId: string;
  volume?: number;
  issueNumber?: number;
  year?: number;
  publishedAt?: string;
};

export async function getPublicationIssues() {
  return http<{ issues: PublicationIssue[] }>("/api/publication-issues");
}

export async function getPublicationIssueById(id: string) {
  return http<{ issue: PublicationIssue }>(`/api/publication-issues/${id}`);
}

export async function createPublicationIssue(
  payload: CreatePublicationIssuePayload,
) {
  return http<{ issue: PublicationIssue }>("/api/publication-issues", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAvailableIssueSubmissions() {
  return http<{ submissions: IssueSubmission[] }>(
    "/api/publication-issues/available-submissions",
  );
}

export async function addSubmissionToIssue(issueId: string, submissionId: string) {
  return http<{ submission: IssueSubmission }>(
    `/api/publication-issues/${issueId}/submissions`,
    {
      method: "POST",
      body: JSON.stringify({ submissionId }),
    },
  );
}

export async function removeSubmissionFromIssue(submissionId: string) {
  return http<{ submission: IssueSubmission }>(
    `/api/publication-issues/submissions/${submissionId}`,
    {
      method: "DELETE",
    },
  );
}

export async function publishPublicationIssue(issueId: string) {
  return http<{ issue: PublicationIssue }>(
    `/api/publication-issues/${issueId}/publish`,
    {
      method: "PATCH",
    },
  );
}

export async function deletePublicationIssue(issueId: string) {
  return http<{ message: string }>(`/api/publication-issues/${issueId}`, {
    method: "DELETE",
  });
}