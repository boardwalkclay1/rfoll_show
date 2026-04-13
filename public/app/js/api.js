// /app/js/api.js — ROLL SHOW GLOBAL SAFE API CLIENT (UMD / browser global)

(function (global) {
  const API_BASE_PAGES  = "https://roll-show.pages.dev";
  const API_BASE_WORKER = "https://rollshow.boardwalkclay1.workers.dev";

  /* SAFE JSON PARSER */
  async function safeJson(res) {
    const text = await res.text();
    const type = (res.headers.get("content-type") || "").toLowerCase();

    if (!type.includes("application/json")) {
      return {
        success: false,
        status: res.status,
        data: null,
        user: undefined,
        error: { message: "Non-JSON response", status: res.status }
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
        error: { message: "Invalid JSON", status: res.status }
      };
    }
  }

  /* CORE REQUEST */
  async function request(method, path, payload = null, extraHeaders = {}) {
    const headers = Object.assign({}, extraHeaders);
    const options = { method, headers, credentials: "same-origin" };

    if (payload && !(payload instanceof FormData) && !(payload instanceof Blob)) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(payload);
    } else if (payload instanceof FormData || payload instanceof Blob) {
      options.body = payload;
    }

    // All /api/* → Worker ONLY (avoid Pages CORS issues)
    if (path.startsWith("/api/")) {
      const res = await fetch(API_BASE_WORKER + path, options);
      const body = await safeJson(res);
      return {
        success: (body && typeof body.success !== "undefined") ? body.success : (res.ok || false),
        status: res.status,
        data: body && body.data !== undefined ? body.data : null,
        user: body && body.user !== undefined ? body.user : undefined,
        error: body && body.error ? body.error : (res.ok ? null : { message: "Request failed", status: res.status })
      };
    }

    // Non-API: Pages-first, Worker-fallback
    let res;
    try {
      res = await fetch(API_BASE_PAGES + path, options);
    } catch {
      // Pages unreachable — fallback to Worker
      try {
        res = await fetch(API_BASE_WORKER + path, options);
      } catch {
        return {
          success: false,
          status: 0,
          data: null,
          user: undefined,
          error: { message: "Network error" }
        };
      }
      const body = await safeJson(res);
      return {
        success: (body && typeof body.success !== "undefined") ? body.success : (res.ok || false),
        status: res.status,
        data: body && body.data !== undefined ? body.data : null,
        user: body && body.user !== undefined ? body.user : undefined,
        error: body && body.error ? body.error : (res.ok ? null : { message: "Request failed", status: res.status })
      };
    }

    // If Pages responded but with non-OK, try Worker
    if (!res.ok) {
      try {
        res = await fetch(API_BASE_WORKER + path, options);
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
      success: (body && typeof body.success !== "undefined") ? body.success : (res.ok || false),
      status: res.status,
      data: body && body.data !== undefined ? body.data : null,
      user: body && body.user !== undefined ? body.user : undefined,
      error: body && body.error ? body.error : (res.ok ? null : { message: "Request failed", status: res.status })
    };
  }

  /* PUBLIC API (global) */
  if (!global.API) {
    global.API = {
      get(path, headers) {
        return request("GET", path, null, headers || {});
      },
      post(path, payload, headers) {
        return request("POST", path, payload, headers || {});
      },
      put(path, payload, headers) {
        return request("PUT", path, payload, headers || {});
      },
      delete(path, headers) {
        return request("DELETE", path, null, headers || {});
      },
      withUser(user) {
        if (!user) return {};
        return {
          "x-user-id": user.id,
          "x-user-role": user.role
        };
      },
      // Expose base URLs for runtime tweaks
      _bases: {
        pages: API_BASE_PAGES,
        worker: API_BASE_WORKER
      }
    };
  }
})(window);
