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

function isFormDataPayload(payload: unknown): payload is FormData {
  return typeof FormData !== "undefined" && payload instanceof FormData;
}

async function parseJsonResponse(res: Response) {
  const text = await res.text();

  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Сервер повернув некоректну відповідь");
  }

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export async function createSubmission(payload: FormData | any) {
  const isFormData = isFormDataPayload(payload);

  const res = await fetch(buildUrl("/submissions"), {
    method: "POST",
    headers: getAuthHeaders(!isFormData),
    body: isFormData ? payload : JSON.stringify(payload),
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

export async function updateSubmission(id: string, payload: FormData | any) {
  const isFormData = isFormDataPayload(payload);

  const res = await fetch(buildUrl(`/submissions/${id}`), {
    method: "PATCH",
    headers: getAuthHeaders(!isFormData),
    body: isFormData ? payload : JSON.stringify(payload),
  });

  return parseJsonResponse(res);
}

export async function getCommitteeSubmissions() {
  const res = await fetch(buildUrl("/submissions/committee"), {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  return parseJsonResponse(res);
}

export async function getReviewerSubmissions() {
  const res = await fetch(buildUrl("/submissions/reviewer"), {
    headers: getAuthHeaders(),
    cache: "no-store",
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
  status: string,
) {
  const res = await fetch(buildUrl(`/submissions/${id}/status`), {
    method: "PATCH",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ status }),
  });

  return parseJsonResponse(res);
}

export async function downloadSubmissionFile(fileName: string) {
  const res = await fetch(
    buildUrl(`/submissions/file/${encodeURIComponent(fileName)}/download`),
    {
      headers: getAuthHeaders(),
    },
  );

  if (!res.ok) {
    throw new Error("Не вдалося завантажити файл");
  }

  return res.blob();
}

export async function publishSubmission(id: string) {
  const res = await fetch(buildUrl(`/submissions/${id}/publish`), {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  return parseJsonResponse(res);
}