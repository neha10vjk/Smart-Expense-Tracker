import { Capacitor } from "@capacitor/core";

function getDefaultApiBaseUrl() {
  if (Capacitor.getPlatform() === "android") {
    return "http://10.0.2.2:4000";
  }

  return "http://localhost:4000";
}

const API_BASE_URL = import.meta.env.VITE_API_URL || getDefaultApiBaseUrl();
const NORMALIZED_API_BASE_URL = API_BASE_URL.replace(/\/+$/, "");

async function apiRequest(path, options = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${NORMALIZED_API_BASE_URL}${normalizedPath}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export function loginProfile(email) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function createProfile(payload) {
  return apiRequest("/api/profiles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchProfile(profileId) {
  return apiRequest(`/api/profile/${profileId}`);
}

export function updateProfile(profileId, payload) {
  return apiRequest(`/api/profile/${profileId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function fetchDashboardSummary(profileId) {
  return apiRequest(`/api/dashboard/summary?profileId=${profileId}`);
}

export function fetchExpenses(profileId, limit = 20) {
  return apiRequest(`/api/expenses?profileId=${profileId}&limit=${limit}`);
}

export function createExpense(payload) {
  return apiRequest("/api/expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchAnalyticsSummary(profileId) {
  return apiRequest(`/api/analytics/summary?profileId=${profileId}`);
}
