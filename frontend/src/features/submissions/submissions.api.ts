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

export async function createSubmission(payload: any) {
  const res = await fetch(buildUrl("/submissions"), {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(res);
}

export async function getMySubmissions() {
  const res = await fetch(buildUrl("/submissions/me"), {
    headers: getAuthHeaders(),
  });

  return parseJsonResponse(res);
}

export async function getSubmissionById(id: string) {
  const res = await fetch(buildUrl(`/submissions/${id}`), {
    headers: getAuthHeaders(),
  });

  return parseJsonResponse(res);
}

export async function updateSubmission(id: string, payload: any) {
  const res = await fetch(buildUrl(`/submissions/${id}`), {
    method: "PATCH",
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(res);
}

export async function getCommitteeSubmissions() {
  const res = await fetch(buildUrl("/submissions/committee"), {
    headers: getAuthHeaders(),
  });

  return parseJsonResponse(res);
}

export async function getReviewerSubmissions() {
  const res = await fetch(buildUrl("/submissions/reviewer"), {
    headers: getAuthHeaders(),
  });

  return parseJsonResponse(res);
}

export async function getReviewerSubmissionById(id: string) {
  const res = await fetch(buildUrl(`/submissions/reviewer/${id}`), {
    headers: getAuthHeaders(),
  });

  return parseJsonResponse(res);
}

export async function updateReviewerSubmissionStatus(
  id: string,
  status:
    | "UNDER_REVIEW"
    | "ACCEPTED"
    | "REJECTED"
    | "REVISION_REQUIRED"
    | "RESUBMITTED"
    | "PUBLISHED"
) {
  const res = await fetch(buildUrl(`/submissions/${id}/status`), {
    method: "PATCH",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ status }),
  });

  return parseJsonResponse(res);
}
