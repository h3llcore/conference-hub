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

export async function assignReviewers(payload: {
  submissionId: string;
  reviewerIds: string[];
}) {
  const res = await fetch(buildUrl("/assignments"), {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(res);
}

export async function getAssignmentsBySubmission(submissionId: string) {
  const res = await fetch(buildUrl(`/assignments/submission/${submissionId}`), {
    headers: getAuthHeaders(),
  });

  return parseJsonResponse(res);
}

export async function getMyReviewerAssignments() {
  const res = await fetch(buildUrl("/assignments/my"), {
    headers: getAuthHeaders(),
  });

  return parseJsonResponse(res);
}

export async function takeAssignmentIntoWork(assignmentId: string) {
  const res = await fetch(buildUrl(`/assignments/${assignmentId}/take`), {
    method: "PATCH",
    headers: getAuthHeaders(true),
  });

  return parseJsonResponse(res);
}