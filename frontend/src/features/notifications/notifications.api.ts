const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
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

export async function getMyNotifications() {
  const res = await fetch(`${BASE_URL}/api/notifications`, {
    headers: getAuthHeaders(),
  });

  return parseJsonResponse(res);
}

export async function markNotificationAsRead(id: string) {
  const res = await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  return parseJsonResponse(res);
}

export async function markAllNotificationsAsRead() {
  const res = await fetch(`${BASE_URL}/api/notifications/read-all`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  return parseJsonResponse(res);
}