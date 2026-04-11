// ROLL SHOW — GLOBAL SAFE API CLIENT (CORS-SAFE)

/*
  Rules:
  - All /api/* calls go DIRECTLY to the Worker (has CORS headers).
  - Non-/api requests can still try Pages first, then Worker.
*/

window.API_BASE_PAGES  = "https://roll-show.pages.dev";
window.API_BASE_WORKER = "https://rollshow.boardwalkclay1.workers.dev";

/* SAFE JSON PARSER */
async function safeJson(res) {
  const text = await res.text();
  const type = res.headers.get("content-type") || "";

  if (!type.toLowerCase().includes("application/json")) {
    return {
      success: false,
      status: res.status,
      data: null,
      user: undefined,
      error: { message: "Non-JSON response" }
    };
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      status: res.status,
      data: null,
      user: undefined,
      error: { message: "Invalid JSON" }
    };
  }
}

/* CORE REQUEST */
async function request(method, path, payload = null, extraHeaders = {}) {
  const headers = { ...extraHeaders };
  const options = { method, headers };

  if (payload && !(payload instanceof FormData) && !(payload instanceof Blob)) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(payload);
  } else if (payload instanceof FormData || payload instanceof Blob) {
    options.body = payload;
  }

  // 🔥 All /api/* → Worker ONLY (avoid CORS from Pages)
  if (path.startsWith("/api/")) {
    const res = await fetch(window.API_BASE_WORKER + path, options);
    const body = await safeJson(res);
    return {
      success: body.success ?? res.ok ?? false,
      status: res.status,
      data: body.data ?? null,
      user: body.user ?? undefined,
      error: body.error ?? (res.ok ? null : { message: "Request failed" })
    };
  }

  // Non-API: Pages-first, Worker-fallback
  let res;
  try {
    res = await fetch(window.API_BASE_PAGES + path, options);
  } catch {
    res = await fetch(window.API_BASE_WORKER + path, options);
    const body = await safeJson(res);
    return {
      success: body.success ?? res.ok ?? false,
      status: res.status,
      data: body.data ?? null,
      user: body.user ?? undefined,
      error: body.error ?? null
    };
  }

  if (!res.ok) {
    try {
      res = await fetch(window.API_BASE_WORKER + path, options);
    } catch {
      return {
        success: false,
        status: 0,
        data: null,
        user: undefined,
        error: { message: "Network error" }
      };
    }
  }

  const body = await safeJson(res);
  return {
    success: body.success ?? res.ok ?? false,
    status: res.status,
    data: body.data ?? null,
    user: body.user ?? undefined,
    error: body.error ?? (res.ok ? null : { message: "Request failed" })
  };
}

/* PUBLIC API */
if (!window.API) {
  window.API = {
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
    withUser(user) {
      if (!user) return {};
      return {
        "x-user-id": user.id,
        "x-user-role": user.role
      };
    }
  };
}
