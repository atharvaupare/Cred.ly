// Base URL for backend (Render)
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

let _token = null;

export function setToken(token) {
  _token = token;
}

function defaultHeaders(hasJson = true) {
  const headers = {};
  if (hasJson) headers["Content-Type"] = "application/json";
  if (_token) headers["Authorization"] = `Bearer ${_token}`;
  return headers;
}

async function handleResponse(res) {
  const text = await res.text().catch(() => "");
  let data = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  if (!res.ok) {
    const err = data?.detail || data?.message || res.statusText || "Request failed";
    const e = new Error(err);
    e.status = res.status;
    e.payload = data;
    throw e;
  }
  return data;
}

export async function post(path, body = {}, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: defaultHeaders(true),
    body: JSON.stringify(body),
    ...opts,
  });
  return handleResponse(res);
}

export async function get(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: defaultHeaders(false),
    ...opts,
  });
  return handleResponse(res);
}


// ------------------------------
// High-level API helpers
// ------------------------------

// LOGIN
export const auth = {
  login: (mobile_number, password) =>
    post("/api/auth/login", { mobile_number, password }),

  onboard: (mobile_number, income_monthly, password) =>
    post("/api/onboard", { mobile_number, income_monthly, password }),
};

// USER PROFILE (protected routes)
export const user = {
  profile: () => get("/api/user/profile"),
};

// SCENARIO SIMULATION
export const scenario = {
  run: (payload) => post("/api/scenario", payload),
};

// CREDIT SCORING (ML + GPT)
export const credit = {
  score: (features) => post("/api/credit/score", features),
};

export const advisor = {
  targetScore: (payload) => post("/api/advisor/target-score", payload),
};