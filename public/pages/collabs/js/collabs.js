// ===============================
// COLLABS.JS — COLLAB CATEGORY
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  if (body.classList.contains("collab-offers-page")) initCollabOffers();
  if (body.classList.contains("collab-start-inperson-page")) initCollabStartInPerson();
  if (body.classList.contains("collab-start-stitch-page")) initCollabStartStitch();
  if (body.classList.contains("collab-session-page")) initCollabSession();
  if (body.classList.contains("collab-result-page")) initCollabResult();
});

// -------------------------------
// API
// -------------------------------
async function api(path, method = "GET", body = null) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`/api${path}`, opts);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// -------------------------------
// COLLAB OFFERS
// -------------------------------
async function initCollabOffers() {
  const list = document.getElementById("collab-list");
  const tabs = document.getElementById("collab-tabs");

  let direction = "incoming";

  tabs.onclick = (e) => {
    const tab = e.target.closest(".collab-tab");
    if (!tab) return;

    [...tabs.children].forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    direction = tab.dataset.tab;
    loadOffers();
  };

  async function loadOffers() {
    const offers = await api(`/collabs?direction=${direction}`);

    list.innerHTML = offers
      .map(
        (c) => `
        <article class="collab-card">
          <div class="collab-card-header">
            <span>${c.from} → ${c.to}</span>
            <span class="collab-card-meta">${c.status}</span>
          </div>
          <div style="font-size:0.8rem;">${c.message}</div>
          <div class="collab-card-meta">${c.details}</div>
          <div class="collab-actions-row">
            ${direction === "incoming"
              ? `<button class="btn-small" onclick="declineCollab('${c.id}')">Decline</button>
                 <button class="btn-small primary" onclick="acceptCollab('${c.id}')">Accept</button>`
              : `<button class="btn-small" onclick="viewCollab('${c.id}')">View</button>
                 <button class="btn-small" onclick="cancelCollab('${c.id}')">Cancel</button>`}
          </div>
        </article>`
      )
      .join("");
  }

  loadOffers();
}

async function acceptCollab(id) {
  await api(`/collabs/${id}/accept`, "POST");
  location.reload();
}

async function declineCollab(id) {
  await api(`/collabs/${id}/decline`, "POST");
  location.reload();
}

async function cancelCollab(id) {
  await api(`/collabs/${id}/cancel`, "POST");
  location.reload();
}

function viewCollab(id) {
  window.location = `/public/pages/collabs/collab-session.html?id=${id}`;
}

// -------------------------------
// START IN-PERSON
// -------------------------------
function initCollabStartInPerson() {
  const form = document.getElementById("collab-inperson-form");

  form.onsubmit = async (e) => {
    e.preventDefault();

    const payload = {
      target: form.target_skater.value,
      spot: form.spot.value,
      date: form.date.value,
      time: form.time.value,
      message: form.intent.value,
    };

    await api("/collabs/inperson", "POST", payload);
    window.location = "/public/pages/collabs/collab-offers.html";
  };
}

// -------------------------------
// START STITCH
// -------------------------------
function initCollabStartStitch() {
  const form = document.getElementById("collab-stitch-form");

  form.onsubmit = async (e) => {
    e.preventDefault();

    const payload = {
      target: form.target_skater.value,
      intent: form.intent.value,
      deadline: form.deadline.value,
    };

    await api("/collabs/stitch", "POST", payload);
    window.location = "/public/pages/collabs/collab-offers.html";
  };
}

// -------------------------------
// COLLAB SESSION
// -------------------------------
async function initCollabSession() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const chatBox = document.getElementById("session-chat");
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send");

  async function loadChat() {
    const msgs = await api(`/collabs/${id}/chat`);
    chatBox.innerHTML = msgs
      .map(
        (m) => `
        <div class="chat-bubble ${m.me ? "me" : ""}">
          ${m.text}
        </div>`
      )
      .join("");
  }

  sendBtn.onclick = async () => {
    if (!input.value.trim()) return;
    await api(`/collabs/${id}/chat`, "POST", { text: input.value });
    input.value = "";
    loadChat();
  };

  loadChat();
  setInterval(loadChat, 5000);
}

// -------------------------------
// COLLAB RESULT
// -------------------------------
async function initCollabResult() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const preview = document.getElementById("collab-video-preview");

  const data = await api(`/collabs/${id}/result`);

  preview.innerHTML = `<video src="${data.url}" controls style="width:100%; height:100%; border-radius:12px;"></video>`;

  document.getElementById("collab-post-feed").onclick = async () => {
    await api(`/collabs/${id}/post`, "POST");
    alert("Posted to feed!");
    window.location = "/public/pages/feed/feed.html";
  };
}
