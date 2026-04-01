// api.js — FINAL UNIFIED API CLIENT

const API_BASE = "https://rollshow.boardwalkclay1.workers.dev";

/* ------------------------------------------------------------
   SAFE JSON PARSER
------------------------------------------------------------ */
async function safeJson(res) {
  const text = await res.text();

  // If Worker returns HTML (fallback error page)
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return {
      success: false,
      status: res.status,
      data: null,
      error: { message: "Server returned non‑JSON response" }
    };
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      status: res.status,
      data: null,
      error: { message: "Invalid JSON" }
    };
  }
}

/* ------------------------------------------------------------
   INTERNAL REQUEST HANDLER
------------------------------------------------------------ */
async function request(method, path, payload, extraHeaders = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders
  };

  const options = { method, headers };

  if (payload && !(payload instanceof FormData)) {
    options.body = JSON.stringify(payload);
  }

  // FormData upload (branding, tracks, images)
  if (payload instanceof FormData) {
    delete headers["Content-Type"];
    options.body = payload;
  }

  let res;
  try {
    res = await fetch(API_BASE + path, options);
  } catch (err) {
    return {
      success: false,
      status: 0,
      data: null,
      error: { message: "Network error" }
    };
  }

  const body = await safeJson(res);

  return {
    success: body.success ?? res.ok,
    status: body.status ?? res.status,
    data: body.data ?? null,
    error: body.error ?? (res.ok ? null : { message: "Request failed" })
  };
}

/* ------------------------------------------------------------
   PUBLIC API
------------------------------------------------------------ */
const API = {
  get(path, headers = {}) {
    return request("GET", path, null, headers);
  },

  post(path, payload, headers = {}) {
    return request("POST", path, payload, headers);
  },

  put(path, payload, headers = {}) {
    return request("PUT", path, payload, headers);
  },

  delete(path, headers = {}) {
    return request("DELETE", path, null, headers);
  },

  upload(path, formData, headers = {}) {
    return request("POST", path, formData, headers);
  },

  withUser(user) {
    if (!user) return {};

    return {
      "x-user-id": user.id,
      "x-user-role": user.role
    };
  }
};

export default API;
