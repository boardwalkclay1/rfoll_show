// /app/js/api.js — ROLL SHOW GLOBAL SAFE API CLIENT (UMD / browser global)
// Updated: clearer responses, configurable bases, optional timeout, robust JSON/text handling

(function (global) {
  // Default bases (can be overridden via API.init)
  let API_BASE_PAGES  = "https://roll-show.pages.dev";
  let API_BASE_WORKER = "https://rollshow.boardwalkclay1.workers.dev";

  const DEFAULT_TIMEOUT_MS = 15000; // optional request timeout

  /* SAFE JSON/TEXT PARSER
     Returns a normalized object:
     { ok: boolean, status: number, body: any, error: { message, status } | null }
  */
  async function safeParseResponse(res) {
    const status = res.status;
    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const text = await res.text();

    if (!text) {
      return {
        ok: res.ok,
        status,
        body: null,
        error: res.ok ? null : { message: "Empty response", status }
      };
    }

    if (contentType.includes("application/json")) {
      try {
        const parsed = JSON.parse(text);
        return {
          ok: res.ok,
          status,
          body: parsed,
          error: parsed && parsed.error ? parsed.error : (res.ok ? null : { message: "Request failed", status })
        };
      } catch (e) {
        return {
          ok: res.ok,
          status,
          body: null,
          error: { message: "Invalid JSON", status }
        };
      }
    }

    // Non-JSON: return text as body
    return {
      ok: res.ok,
      status,
      body: text,
      error: res.ok ? null : { message: "Non-JSON response", status }
    };
  }

  /* Fetch with timeout helper */
  function fetchWithTimeout(resource, options = {}, timeout = DEFAULT_TIMEOUT_MS) {
    if (!timeout || timeout <= 0) {
      return fetch(resource, options);
    }
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const opts = Object.assign({}, options, { signal: controller.signal });
    return fetch(resource, opts).finally(() => clearTimeout(id));
  }

  /* CORE REQUEST
     - method: "GET"|"POST"|"PUT"|"DELETE"
     - path: absolute path starting with "/"
     - payload: object | FormData | Blob | null
     - extraHeaders: object
     - opts: { timeoutMs?: number, forceWorker?: boolean, forcePages?: boolean }
  */
  async function request(method, path, payload = null, extraHeaders = {}, opts = {}) {
    if (!path || typeof path !== "string" || !path.startsWith("/")) {
      throw new Error("API request path must be an absolute path starting with '/'");
    }

    const headers = Object.assign({}, extraHeaders);
    const options = {
      method,
      headers,
      credentials: "same-origin"
    };

    if (payload && !(payload instanceof FormData) && !(payload instanceof Blob)) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(payload);
    } else if (payload instanceof FormData || payload instanceof Blob) {
      options.body = payload;
    }

    const timeoutMs = typeof opts.timeoutMs === "number" ? opts.timeoutMs : DEFAULT_TIMEOUT_MS;

    // Helper to normalize parsed response into the public shape
    function normalize(parsed) {
      // parsed.body may be an object with { success, data, user, error } already
      const body = parsed.body;
      const status = parsed.status || 0;
      let success = parsed.ok || false;
      let data = null;
      let user = undefined;
      let error = parsed.error || null;

      if (body && typeof body === "object") {
        if (typeof body.success !== "undefined") success = !!body.success;
        if (body.data !== undefined) data = body.data;
        if (body.user !== undefined) user = body.user;
        if (body.error) error = body.error;
      } else {
        // non-object body (text) -> expose as data
        data = body;
      }

      return {
        success,
        status,
        data,
        user,
        error
      };
    }

    // If path is an API route, always go to Worker to avoid Pages CORS issues
    if (path.startsWith("/api/") || opts.forceWorker) {
      try {
        const res = await fetchWithTimeout(API_BASE_WORKER + path, options, timeoutMs);
        const parsed = await safeParseResponse(res);
        return normalize(parsed);
      } catch (err) {
        return { success: false, status: 0, data: null, user: undefined, error: { message: err.name === "AbortError" ? "Request timed out" : "Network error", detail: err.message } };
      }
    }

    // Non-API: try Pages first, fallback to Worker
    let res;
    try {
      res = await fetchWithTimeout(API_BASE_PAGES + path, options, timeoutMs);
    } catch (errPages) {
      // Pages unreachable — fallback to Worker
      try {
        res = await fetchWithTimeout(API_BASE_WORKER + path, options, timeoutMs);
      } catch (errWorker) {
        return { success: false, status: 0, data: null, user: undefined, error: { message: "Network error" } };
      }
      const parsed = await safeParseResponse(res);
      return normalize(parsed);
    }

    // If Pages responded but not OK, optionally try Worker
    if (!res.ok) {
      try {
        const resWorker = await fetchWithTimeout(API_BASE_WORKER + path, options, timeoutMs);
        const parsedWorker = await safeParseResponse(resWorker);
        return normalize(parsedWorker);
      } catch {
        const parsed = await safeParseResponse(res);
        return normalize(parsed);
      }
    }

    const parsed = await safeParseResponse(res);
    return normalize(parsed);
  }

  /* PUBLIC API (global) */
  if (!global.API) {
    global.API = {
      // Basic methods
      get(path, headers = {}, opts = {}) {
        return request("GET", path, null, headers, opts);
      },
      post(path, payload = null, headers = {}, opts = {}) {
        return request("POST", path, payload, headers, opts);
      },
      put(path, payload = null, headers = {}, opts = {}) {
        return request("PUT", path, payload, headers, opts);
      },
      delete(path, headers = {}, opts = {}) {
        return request("DELETE", path, null, headers, opts);
      },

      // Convenience: attach user headers (not used for auth, only metadata)
      withUser(user) {
        if (!user) return {};
        return {
          "x-user-id": user.id,
          "x-user-role": user.role
        };
      },

      // Allow runtime configuration of base URLs and timeout
      init({ pagesBase, workerBase, defaultTimeoutMs } = {}) {
        if (pagesBase && typeof pagesBase === "string") API_BASE_PAGES = pagesBase;
        if (workerBase && typeof workerBase === "string") API_BASE_WORKER = workerBase;
        if (typeof defaultTimeoutMs === "number") {
          // update default timeout constant by shadowing variable
          // (not strictly immutable; used by fetchWithTimeout)
          // eslint-disable-next-line no-unused-vars
          DEFAULT_TIMEOUT_MS = defaultTimeoutMs;
        }
      },

      // Expose bases for debugging/runtime tweaks
      _bases: {
        get pages() { return API_BASE_PAGES; },
        get worker() { return API_BASE_WORKER; }
      }
    };
  }
})(window);
