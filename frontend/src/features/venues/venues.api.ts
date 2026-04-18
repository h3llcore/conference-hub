const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function buildUrl(path: string) {
  return `${BASE_URL.replace(/\/$/, "")}/api/${path.replace(/^\//, "")}`;
}

export async function getVenues() {
  const res = await fetch(buildUrl("/venues"));
  const text = await res.text();

  try {
    const data = JSON.parse(text);

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch venues");
    }

    return data;
  } catch {
    throw new Error("Сервер повернув некоректну відповідь");
  }
}