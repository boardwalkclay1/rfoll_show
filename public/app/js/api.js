// api.js
const API = {
  async post(path, body) {
    const res = await fetch(path, {
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

  async getText(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`GET failed: ${res.status}`);
    return res.text();
  }
};

export default API;
