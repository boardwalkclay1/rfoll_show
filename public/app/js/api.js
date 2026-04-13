// /app/js/api.js — ROLL SHOW GLOBAL SAFE API CLIENT (UMD / browser global)
// Redesigned: stable defaults, configurable init, robust parsing, timeout support, clear normalized response

(function (global) {
  // Default base endpoints (can be overridden via API.init)
  let API_BASE_PAGES = "https://roll-show.pages.dev";
  let API_BASE_WORKER = "https://rollshow.boardwalkclay1.workers.dev";
  let DEFAULT_TIMEOUT_MS = 15000;

  /* Utility: safe parse response (JSON or text)
     Returns: { ok, status, body, contentType, error }
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
        contentType,
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
          contentType,
          error: parsed && parsed.error ? parsed.error : (res.ok ? null : { message: "Request failed", status })
        };
      } catch (err) {
        return {
          ok: res.ok,
          status,
          body: null,
          contentType,
          error: { message: "Invalid JSON", status }
        };
      }
    }

    // Non-JSON response: return raw text
    return {
      ok: res.ok,
      status,
      body: text,
      contentType,
      error: res.ok ? null : { message: "Non-JSON response", status }
    };
  }

  /* Fetch with timeout */
  function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    if (!timeoutMs || timeoutMs <= 0) return fetch(url, options);
    const controller = new AbortController();
    const signal = controller.signal;
    const opts = Object.assign({}, options, { signal });
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, opts).finally(() => clearTimeout(timer));
  }

  /* Normalize parsed response into public shape:
     { success, status, data, user, error }
  */
  function normalizeParsed(parsed) {
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
      // fallback: if body has top-level fields but not wrapped in data
      if (data === null && body !== null && (body.id || body.name || body.email)) {
        data = body;
      }
    } else {
      // text body -> expose as data
      data = body;
    }

    return { success, status, data, user, error };
  }

  /* Core request
     method: "GET"|"POST"|"PUT"|"DELETE"
     path: absolute path starting with "/"
     payload: object | FormData | Blob | null
     extraHeaders: object
     opts: { timeoutMs?: number, forceWorker?: boolean, forcePages?: boolean }
  */
  async function request(method, path, payload = null, extraHeaders = {}, opts = {}) {
    if (!path || typeof path !== "string" || !path.startsWith("/")) {
      throw new Error("API request path must start with '/'");
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

    // Helper to handle fetch + parse + normalize
    async function fetchAndNormalize(fullUrl) {
      try {
        const res = await fetchWithTimeout(fullUrl, options, timeoutMs);
        const parsed = await safeParseResponse(res);
        return normalizeParsed(parsed);
      } catch (err) {
        const isAbort = err && err.name === "AbortError";
        return {
          success: false,
          status: 0,
          data: null,
          user: undefined,
          error: { message: isAbort ? "Request timed out" : "Network error", detail: err?.message }
        };
      }
    }

    // If API route, prefer Worker to avoid Pages CORS issues
    if (path.startsWith("/api/") || opts.forceWorker) {
      return await fetchAndNormalize(API_BASE_WORKER + path);
    }

    // Non-API: try Pages first, fallback to Worker
    try {
      const pagesResult = await fetchAndNormalize(API_BASE_PAGES + path);
      // If Pages returned a non-success HTTP-level response (status >= 400) and not a parsed success,
      // attempt Worker fallback unless forcePages is set.
      if (!pagesResult.success && pagesResult.status >= 400 && !opts.forcePages) {
        const workerResult = await fetchAndNormalize(API_BASE_WORKER + path);
        // Prefer workerResult if it indicates success or has a different status
        if (workerResult.success || workerResult.status !== pagesResult.status) return workerResult;
      }
      return pagesResult;
    } catch {
      // If Pages fetch throws unexpectedly, fallback to Worker
      return await fetchAndNormalize(API_BASE_WORKER + path);
    }
  }

  /* Expose global API */
  if (!global.API) {
    global.API = {
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

      // Attach user metadata headers (not for auth)
      withUser(user) {
        if (!user) return {};
        return {
          "x-user-id": user.id,
          "x-user-role": user.role
        };
      },

      // Runtime configuration
      init({ pagesBase, workerBase, defaultTimeoutMs } = {}) {
        if (pagesBase && typeof pagesBase === "string") API_BASE_PAGES = pagesBase;
        if (workerBase && typeof workerBase === "string") API_BASE_WORKER = workerBase;
        if (typeof defaultTimeoutMs === "number" && defaultTimeoutMs > 0) {
          DEFAULT_TIMEOUT_MS = defaultTimeoutMs;
        }
      },

      // Expose current bases for debugging
      _bases: {
        get pages() { return API_BASE_PAGES; },
        get worker() { return API_BASE_WORKER; },
        get timeoutMs() { return DEFAULT_TIMEOUT_MS; }
      }
    };
  }
})(window);
