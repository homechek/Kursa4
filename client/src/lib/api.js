const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export function getApiBaseUrl() {
  return API_URL;
}

function getToken() {
  return localStorage.getItem("pp_token") || "";
}

export function setToken(token) {
  if (!token) localStorage.removeItem("pp_token");
  else localStorage.setItem("pp_token", token);
}

export async function api(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const err = new Error(data?.error || "REQUEST_FAILED");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function translate(text, target, source) {
  const res = await api("/api/translate", {
    method: "POST",
    auth: true,
    body: { text, target, source },
  });
  return res.translated || "";
}

