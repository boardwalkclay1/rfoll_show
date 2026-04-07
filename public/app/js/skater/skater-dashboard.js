import API from "/js/api.js";

/* ============================================================
   STATE
============================================================ */
const skaterState = {
  user: null,
  skater: null,
  analyticsChips: [],
  actions: [],
  shows: [],
  contracts: [],
  badges: [],
  earnings: 0,
  secondaryTalent: null,
};

/* ============================================================
   DOM HELPERS
============================================================ */
const $ = (id) => document.getElementById(id);

/* ============================================================
   API WRAPPER
============================================================ */
async function apiGet(path, user) {
  return API.get(path, user);
}

/* ============================================================
   LOADER
============================================================ */
function hideSkaterLoader() {
  const loader = $("skater-loading");
  if (loader) loader.classList.add("rs-hidden");
}

/* ============================================================
   INIT
============================================================ */
async function initSkaterDashboard() {
  try {
    const userRaw = localStorage.getItem("user");
    if (!userRaw) {
      window.location.href = "/login.html";
      return;
    }

    skaterState.user = JSON.parse(userRaw);

    await loadSkaterDashboard(skaterState.user);

    renderSkaterHero();
    renderSkaterChips();
    renderSkaterGhostActions();
    renderSkaterCards();
    renderSkaterBurgerMenu();
  } catch (err) {
    console.error("Skater dashboard init failed", err);
    const statusEl = $("skater-status");
    if (statusEl) {
      statusEl.textContent = "There was a problem loading your skater dashboard.";
    }
  } finally {
    hideSkaterLoader();
  }
}

/* ============================================================
   LOADERS
============================================================ */
async function loadSkaterDashboard(user) {
  try {
    const res = await apiGet("/api/skater/dashboard", user);
    if (!res?.success) {
      console.error("Skater dashboard load failed", res?.error);
      return;
    }

    const data = res.data || {};

    skaterState.skater = data.skater || null;
    skaterState.earnings = data.earnings || 0;
    skaterState.contracts = Array.isArray(data.contracts) ? data.contracts : [];
    skaterState.badges = Array.isArray(data.badges) ? data.badges : [];
    skaterState.secondaryTalent = data.secondary_talent || null;
    skaterState.shows = Array.isArray(data.shows) ? data.shows : [];

    skaterState.analyticsChips = [
      { label: "Shows", value: skaterState.shows.length, link: "#shows" },
      { label: "Earnings", value: `$${Number(skaterState.earnings || 0).toFixed(2)}`, link: "#earnings" },
      { label: "Contracts", value: skaterState.contracts.length, link: "#contracts" },
      { label: "Badges", value: skaterState.badges.length, link: "#badges" }
    ];

    skaterState.actions = [
      { id: "create-show", label: "Create Show", icon: "🎬" },
      { id: "manage-tickets", label: "Tickets", icon: "🎟️" },
      { id: "view-contracts", label: "Contracts", icon: "📜" },
      { id: "edit-profile", label: "Edit Profile", icon: "🖊️" },
      { id: "open-feed", label: "Feed", icon: "📺" }
    ];
  } catch (err) {
    console.error("Skater dashboard load error", err);
  }
}

/* ============================================================
   RENDER — HERO
============================================================ */
function renderSkaterHero() {
  const nameEl = $("skater-hero-name");
  const subtitleEl = $("skater-hero-subtitle");
  const earningsEl = $("skater-hero-earnings");

  if (nameEl) {
    nameEl.textContent =
      skaterState.skater?.display_name ||
      skaterState.skater?.name ||
      "Skater";
  }

  if (subtitleEl) {
    const secondary = skaterState.secondaryTalent?.label || skaterState.secondaryTalent?.type;
    subtitleEl.textContent = secondary ? `Skater • ${secondary}` : "Roll Show Skater";
  }

  if (earningsEl) {
    earningsEl.textContent = `$${Number(skaterState.earnings || 0).toFixed(2)}`;
  }
}

/* ============================================================
   RENDER — ANALYTICS CHIPS (HORIZONTAL)
============================================================ */
function renderSkaterChips() {
  const container = $("skater-analytics-chips");
  if (!container) return;

  container.innerHTML = "";
  skaterState.analyticsChips.forEach((chip) => {
    const btn = document.createElement("button");
    btn.className = "rs-chip rs-chip-ghost";
    btn.textContent = `${chip.label}: ${chip.value}`;
    btn.addEventListener("click", () => {
      if (chip.link.startsWith("#")) {
        const target = document.querySelector(chip.link);
        if (target) target.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = chip.link;
      }
    });
    container.appendChild(btn);
  });
}

/* ============================================================
   RENDER — GHOST ACTION BUTTONS
============================================================ */
function renderSkaterGhostActions() {
  const container = $("skater-ghost-actions");
  if (!container) return;

  container.innerHTML = "";
  skaterState.actions.forEach((action) => {
    const btn = document.createElement("button");
    btn.className = "rs-ghost-button";
    btn.dataset.actionId = action.id;
    btn.innerHTML = `<span class="rs-ghost-icon">${action.icon}</span><span>${action.label}</span>`;
    btn.addEventListener("click", () => handleSkaterAction(action.id));
    container.appendChild(btn);
  });
}

/* ============================================================
   RENDER — CARDS (SHOWS, CONTRACTS, BADGES)
============================================================ */
function renderSkaterCards() {
  renderSkaterShows();
  renderSkaterContracts();
  renderSkaterBadges();
}

function renderSkaterShows() {
  const container = $("skater-shows-cards");
  if (!container) return;

  container.innerHTML = "";

  if (!skaterState.shows.length) {
    container.innerHTML = `<div class="rs-card rs-card-empty">No shows yet. Create your first show.</div>`;
    return;
  }

  skaterState.shows.forEach((show) => {
    const card = document.createElement("div");
    card.className = "rs-card rs-card-show";
    card.innerHTML = `
      <div class="rs-card-title">${show.title || "Untitled Show"}</div>
      <div class="rs-card-meta">
        <span>${show.type || "show"}</span>
        <span>${show.duration_seconds || 0}s</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderSkaterContracts() {
  const container = $("skater-contracts-cards");
  if (!container) return;

  container.innerHTML = "";

  if (!skaterState.contracts.length) {
    container.innerHTML = `<div class="rs-card rs-card-empty">No contracts yet.</div>`;
    return;
  }

  skaterState.contracts.forEach((c) => {
    const signed = !!c.signed_at;
    const card = document.createElement("div");
    card.className = "rs-card rs-card-contract";
    card.innerHTML = `
      <div class="rs-card-title">${c.title || c.slug || "Contract"}</div>
      <div class="rs-card-meta">
        <span>${signed ? "Signed" : "Unsigned"}</span>
        ${c.required ? "<span>Required</span>" : ""}
      </div>
    `;
    container.appendChild(card);
  });
}

function renderSkaterBadges() {
  const container = $("skater-badges-cards");
  if (!container) return;

  container.innerHTML = "";

  if (!skaterState.badges.length) {
    container.innerHTML = `<div class="rs-card rs-card-empty">No badges yet.</div>`;
    return;
  }

  skaterState.badges.forEach((b) => {
    const card = document.createElement("div");
    card.className = "rs-card rs-card-badge";
    card.innerHTML = `
      <div class="rs-card-title">${b.label || b.name || "Badge"}</div>
      <div class="rs-card-meta">
        <span>${b.description || ""}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

/* ============================================================
   RENDER — BURGER MENU
============================================================ */
function renderSkaterBurgerMenu() {
  const menu = $("rs-burger-menu");
  if (!menu) return;

  const items = [
    { label: "Owner Dashboard", link: "/owner.html" },
    { label: "Skater Dashboard", link: "/skater.html" },
    { label: "Business Dashboard", link: "/business.html" },
    { label: "Musician Dashboard", link: "/musician.html" },
    { label: "Buyer Dashboard", link: "/buyer.html" }
  ];

  menu.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("button");
    li.className = "rs-burger-item";
    li.textContent = item.label;
    li.addEventListener("click", () => {
      window.location.href = item.link;
    });
    menu.appendChild(li);
  });
}

/* ============================================================
   ACTION HANDLERS
============================================================ */
function handleSkaterAction(id) {
  switch (id) {
    case "create-show":
      window.location.href = "/skater-create-show.html";
      break;
    case "manage-tickets":
      window.location.href = "/skater-tickets.html";
      break;
    case "view-contracts":
      window.location.href = "/skater-contracts.html";
      break;
    case "edit-profile":
      window.location.href = "/skater-profile.html";
      break;
    case "open-feed":
      window.location.href = "/feed.html";
      break;
    default:
      console.log("Unhandled skater action:", id);
  }
}

/* ============================================================
   BOOTSTRAP
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  initSkaterDashboard();
});
