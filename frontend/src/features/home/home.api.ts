import { http } from "../../api/http";

export type HomeContentType = "JOURNAL" | "ARTICLE" | "NEWS";

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

export type PublishedArticle = {
  id: string;
  title: string;
  abstract: string;
  keywords: string;
  venueType: "JOURNAL" | "CONFERENCE";
  venue: string;
  coAuthors?: string | null;
  notes?: string | null;
  fileName?: string | null;
  status: string;
  version: number;
  currentRound: number;
  createdAt: string;
  finalDecisionAt?: string | null;
  author?: {
    firstName: string;
    lastName: string;
    email: string;
    institution: string;
    country: string;
    academicDegree?: string | null;
    academicTitle?: string | null;
    orcid?: string | null;
    orcidVerified?: boolean;
    googleScholarUrl?: string | null;
  };
};

export async function apiGetHomeContent() {
  return http<{
    journals: HomeContent[];
    articles: HomeContent[];
    news: HomeContent[];
  }>("/api/home");
}

export async function apiGetHomeContentById(id: string) {
  return http<{ item: HomeContent }>(`/api/home/content/${id}`);
}

export async function apiGetPublishedArticleById(id: string) {
  return http<{ article: PublishedArticle }>(`/api/home/articles/${id}`);
}

export async function apiGetAdminHomeContent() {
  return http<{ items: HomeContent[] }>("/api/home/admin");
}

export async function apiCreateHomeContent(payload: CreateHomeContentPayload) {
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