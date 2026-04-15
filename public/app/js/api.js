// /app/js/api.js — CLEAN GENERIC CLIENT (NO LOGIN LOGIC)
// ------------------------------------------------------

(function (global) {
  let API_BASE = "https://rollshow.boardwalkclay1.workers.dev";
  let DEFAULT_TIMEOUT_MS = 15000;

  /* -------------------------------------------------------
   * XHR WRAPPER
   * ----------------------------------------------------- */
  function xhrRequest(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(options.method || "GET", url, true);

      if (options.headers) {
        for (const [k, v] of Object.entries(options.headers)) {
          xhr.setRequestHeader(k, v);
        }
      }

      xhr.timeout = timeoutMs;

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          resolve(
            new Response(xhr.responseText, {
              status: xhr.status,
              statusText: xhr.statusText
            })
          );
        }
      };

      xhr.onerror = () => reject(new Error("Network error"));
      xhr.ontimeout = () =>
        reject(new DOMException("Request timed out", "AbortError"));

      xhr.send(options.body || null);
    });
  }

  /* -------------------------------------------------------
   * SAFE PARSE
   * ----------------------------------------------------- */
  async function safeParse(res) {
    const status = res.status;
    const text = await res.text();
    const contentType = (res.headers.get("content-type") || "").toLowerCase();

    if (!text) {
      return { ok: res.ok, status, body: null, error: null };
    }

    if (contentType.includes("application/json")) {
      try {
        return { ok: res.ok, status, body: JSON.parse(text), error: null };
      } catch {
        return { ok: res.ok, status, body: null, error: "Invalid JSON" };
      }
    }

    return { ok: res.ok, status, body: text, error: null };
  }

  /* -------------------------------------------------------
   * NORMALIZE
   * ----------------------------------------------------- */
  function normalize(parsed) {
    return {
      success: parsed.ok,
      status: parsed.status,
      data: parsed.body,
      error: parsed.error
    };
  }

  /* -------------------------------------------------------
   * CORE REQUEST
   * ----------------------------------------------------- */
  async function request(method, path, payload = null, headers = {}, opts = {}) {
    if (!path.startsWith("/")) {
      throw new Error("API path must start with '/'");
    }

    const fullUrl = API_BASE + path;

    const options = {
      method,
      headers: { ...headers }
    };

    if (payload instanceof FormData) {
      // Let browser set Content-Type
      delete options.headers["Content-Type"];
      options.body = payload;
    } else if (payload !== null && payload !== undefined) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(payload);
    }

    const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;

    try {
      const res = await xhrRequest(fullUrl, options, timeoutMs);
      const parsed = await safeParse(res);
      return normalize(parsed);
    } catch (err) {
      return {
        success: false,
        status: 0,
        data: null,
        error: err?.message || "Network error"
      };
    }
  }

  /* -------------------------------------------------------
   * PUBLIC API
   * ----------------------------------------------------- */
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

      init({ base, timeoutMs } = {}) {
        if (base) API_BASE = base;
        if (timeoutMs > 0) DEFAULT_TIMEOUT_MS = timeoutMs;
      },

      _config: {
        get base() { return API_BASE; },
        get timeout() { return DEFAULT_TIMEOUT_MS; }
      }
    };
  }
})(window);
