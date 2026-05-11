const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function buildUrl(path: string) {
  return `${BASE_URL.replace(/\/$/, "")}/api/${path.replace(/^\//, "")}`;
}

type GetVenuesParams = {
  type?: "JOURNAL" | "CONFERENCE";
  limit?: number;
  sort?: "newest" | "oldest";
};

export type Venue = {
  id: string;
  title: string;
  description: string;
  type: "JOURNAL" | "CONFERENCE";
  deadline: string;
  createdAt: string;
};

export type VenueDetails = Venue & {
  rating: number;
  stats: {
    publishedIssues: number;
    publishedArticles: number;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  publishedIssues: {
    id: string;
    title: string;
    description?: string | null;
    year?: number | null;
    volume?: number | null;
    issueNumber?: number | null;
    publishedAt?: string | null;
    submissions: {
      id: string;
      title: string;
    }[];
  }[];
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

    return data as { venues: Venue[] };
  } catch {
    throw new Error("Сервер повернув некоректну відповідь");
  }
}

export async function getVenueById(id: string) {
  const res = await fetch(buildUrl(`/venues/${id}`));
  const text = await res.text();

  try {
    const data = JSON.parse(text);

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch venue");
    }

    return data as { venue: VenueDetails };
  } catch {
    throw new Error("Сервер повернув некоректну відповідь");
  }
}