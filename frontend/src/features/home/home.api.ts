import { http } from "../../api/http";

export type HomeContentType =
  | "JOURNAL"
  | "ARTICLE"
  | "NEWS";

export type HomeContent = {
  id: string;
  type: HomeContentType;
  title: string;
  description: string;
  authorName?: string | null;
  linkUrl?: string | null;
  imageUrl?: string | null;
  rating?: number | null;
  date?: string | null;
  isPublished: boolean;
  createdAt: string;
};

export type CreateHomeContentPayload = {
  type: HomeContentType;
  title: string;
  description: string;
  authorName?: string;
  linkUrl?: string;
  imageUrl?: string;
  rating?: number;
  date?: string;
  isPublished?: boolean;
};

export async function apiGetHomeContent() {
  return http<{
    journals: HomeContent[];
    articles: HomeContent[];
    news: HomeContent[];
  }>("/api/home");
}

export async function apiGetAdminHomeContent() {
  return http<{ items: HomeContent[] }>("/api/home/admin");
}

export async function apiCreateHomeContent(
  payload: CreateHomeContentPayload,
) {
  return http<{ item: HomeContent }>("/api/home/admin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiDeleteHomeContent(id: string) {
  return http<{ message: string }>(`/api/home/admin/${id}`, {
    method: "DELETE",
  });
}