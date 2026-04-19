const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function buildUrl(path: string) {
  return `${BASE_URL.replace(/\/$/, "")}/api/${path.replace(/^\//, "")}`;
}

type GetVenuesParams = {
  type?: "JOURNAL" | "CONFERENCE";
  limit?: number;
  sort?: "newest" | "oldest";
};

export async function getVenues(params: GetVenuesParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.type) searchParams.set("type", params.type);
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.sort) searchParams.set("sort", params.sort);

  const query = searchParams.toString();
  const url = query ? `${buildUrl("/venues")}?${query}` : buildUrl("/venues");

  const res = await fetch(url);
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