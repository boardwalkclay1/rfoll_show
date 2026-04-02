// js/api.js — FINAL UNIFIED API CLIENT

const API_BASE = "https://rollshow.boardwalkclay1.workers.dev";

/* ------------------------------------------------------------
   SAFE JSON PARSER
------------------------------------------------------------ */
async function safeJson(res) {
  const text = await res.text();
  const type = res.headers.get("content-type") || "";

  // Worker sometimes returns HTML on errors → catch it
  if (!type.includes("application/json")) {
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
      error: { message: "Invalid JSON from server" }
    };
  }
}

/* ------------------------------------------------------------
   INTERNAL REQUEST HANDLER
------------------------------------------------------------ */
async function request(method, path, payload = null, extraHeaders = {}) {
  const headers = { ...extraHeaders };
  const options = { method, headers };

  // JSON payload
  if (payload && !(payload instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(payload);
  }

  // FormData payload
  if (payload instanceof FormData) {
    options.body = payload;
  }

  let res;
  try {
    res = await fetch(API_BASE + path, options);
  } catch {
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

  // Attach user headers to any request
  withUser(user) {
    if (!user || !user.id || !user.role) return {};
    return {
      "x-user-id": user.id,
      "x-user-role": user.role
    };
  },

  /* ------------------------------------------------------------
     REAL-TIME POLLING
     Usage:
       const stop = API.poll("/api/notifications", {
         interval: 5000,
         headers: API.withUser(user),
         onData: (res) => { ... }
       });
       // later: stop();
  ------------------------------------------------------------ */
  poll(path, { interval = 5000, headers = {}, onData } = {}) {
    let stopped = false;

    async function tick() {
      if (stopped) return;
      const res = await request("GET", path, null, headers);
      if (onData) onData(res);
      setTimeout(tick, interval);
    }

    tick();

    return () => {
      stopped = true;
    };
  }
};

export default API;
