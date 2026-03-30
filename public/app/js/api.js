// api.js — FULL REBUILD

// Your Worker backend domain
const API_BASE = "https://rollshow.boardwalkclay1.workers.dev";

const API = {
  async post(path, body) {
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Request failed: ${res.status}`);
    }

    return res.json().catch(() => ({}));
  },

  async get(path) {
    const res = await fetch(API_BASE + path);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `GET failed: ${res.status}`);
    }

    return res.json().catch(() => ({}));
  },

  async getText(path) {
    const res = await fetch(API_BASE + path);

    if (!res.ok) throw new Error(`GET failed: ${res.status}`);

    return res.text();
  }
};

export default API;
