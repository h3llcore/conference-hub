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

export async function getConferencePrograms() {
  const res = await fetch(buildUrl("/programs"), {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  return parseJsonResponse(res);
}

export async function getConferenceProgramById(id: string) {
  const res = await fetch(buildUrl(`/programs/${id}`), {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  return parseJsonResponse(res);
}

export async function getAcceptedConferenceSubmissions(
  venue?: string,
) {
  const query = venue
    ? `?venue=${encodeURIComponent(venue)}`
    : "";

  const res = await fetch(
    buildUrl(`/programs/accepted-submissions${query}`),
    {
      headers: getAuthHeaders(),
      cache: "no-store",
    },
  );

  return parseJsonResponse(res);
}

export async function createConferenceProgram(payload: {
  venueId: string;
  title: string;
  description?: string;
  meetingUrl?: string;
  startDate: string;
  endDate?: string;
}) {
  const res = await fetch(buildUrl("/programs"), {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(res);
}

export async function createProgramSection(
  programId: string,
  payload: {
    title: string;
    description?: string;
    order?: number;
    startTime?: string;
    endTime?: string;
  },
) {
  const res = await fetch(
    buildUrl(`/programs/${programId}/sections`),
    {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    },
  );

  return parseJsonResponse(res);
}

export async function addProgramItem(payload: {
  sectionId: string;
  submissionId?: string;
  title: string;
  speakerName: string;
  speakerEmail?: string;
  startTime?: string;
  endTime?: string;
  order?: number;
}) {
  const res = await fetch(buildUrl("/programs/items"), {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(res);
}

export async function publishConferenceProgram(programId: string) {
  const res = await fetch(
    buildUrl(`/programs/${programId}/publish`),
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    },
  );

  return parseJsonResponse(res);
}

export async function sendConferenceInvitations(
  programId: string,
) {
  const res = await fetch(
    buildUrl(`/programs/${programId}/invitations`),
    {
      method: "POST",
      headers: getAuthHeaders(),
    },
  );

  return parseJsonResponse(res);
}

export async function finishConferenceProgram(programId: string) {
  const res = await fetch(buildUrl(`/programs/${programId}/finish`), {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  return parseJsonResponse(res);
}

export async function archiveConferenceProgram(programId: string) {
  const res = await fetch(buildUrl(`/programs/${programId}/archive`), {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  return parseJsonResponse(res);
}