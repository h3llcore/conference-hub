const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function buildUrl(path: string) {
  return `${BASE_URL.replace(/\/$/, "")}/api/${path.replace(/^\//, "")}`;
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
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

export async function getReviewers() {
  const res = await fetch(buildUrl("/auth/reviewers"), {
    headers: getAuthHeaders(),
  });

  return parseJsonResponse(res);
}