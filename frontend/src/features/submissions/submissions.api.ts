const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function buildUrl(path: string) {
  return `${BASE_URL.replace(/\/$/, "")}/api/${path.replace(/^\//, "")}`;
}

export async function createSubmission(payload: any) {
  const token = localStorage.getItem("token");

  const res = await fetch(buildUrl("/submissions"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  try {
    const data = JSON.parse(text);

    if (!res.ok) {
      throw new Error(data.message || "Failed to create submission");
    }

    return data;
  } catch {
    throw new Error("Сервер повернув некоректну відповідь");
  }
}

export async function getMySubmissions() {
  const token = localStorage.getItem("token");

  const res = await fetch(buildUrl("/submissions/me"), {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const text = await res.text();

  try {
    const data = JSON.parse(text);

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch submissions");
    }

    return data;
  } catch {
    throw new Error("Сервер повернув некоректну відповідь");
  }
}
