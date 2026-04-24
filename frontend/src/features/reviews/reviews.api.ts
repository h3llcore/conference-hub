const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function buildUrl(path: string) {
  return `${BASE_URL.replace(/\/$/, "")}/api/${path.replace(/^\//, "")}`;
}

function getAuthHeaders(includeJson = false) {
  const token = localStorage.getItem("token");

  return {
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJsonResponse(res: Response) {
  const text = await res.text();

  try {
    const data = JSON.parse(text);

    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch {
    throw new Error("Сервер повернув некоректну відповідь");
  }
}

export type ReviewScore =
  | "GOOD"
  | "SATISFACTORY"
  | "NEEDS_IMPROVEMENT"
  | "UNSATISFACTORY";

export type ReviewDecision =
  | "ACCEPT"
  | "ACCEPT_WITH_REVISIONS"
  | "REJECT";

export type ReviewPayload = {
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

export async function createOrUpdateReview(payload: ReviewPayload) {
  const res = await fetch(buildUrl("/reviews"), {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(res);
}

export async function getCommitteeSubmissionReviews(submissionId: string) {
  const res = await fetch(
    buildUrl(`/reviews/submission/${submissionId}/committee`),
    {
      headers: getAuthHeaders(),
    },
  );

  return parseJsonResponse(res);
}

export async function getAuthorSubmissionReviews(submissionId: string) {
  const res = await fetch(
    buildUrl(`/reviews/submission/${submissionId}/author`),
    {
      headers: getAuthHeaders(),
    },
  );

  return parseJsonResponse(res);
}

export async function getMyReviewBySubmission(submissionId: string) {
  const res = await fetch(
    buildUrl(`/reviews/submission/${submissionId}/my`),
    {
      headers: getAuthHeaders(),
    },
  );

  return parseJsonResponse(res);
}