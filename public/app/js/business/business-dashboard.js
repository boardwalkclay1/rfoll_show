import API from "/js/api.js";

const businessState = {
  user: null,
  business: null,
  analyticsChips: [],
  actions: [],
  shows: [],
  campaigns: [],
  sponsorships: [],
  earnings: 0
};

const $b = (id) => document.getElementById(id);

async function apiGet(path, user) {
  return API.get(path, user);
}

function hideBusinessLoader() {
  const loader = $b("business-loading");
  if (loader) loader.classList.add("rs-hidden");
}

async function initBusinessDashboard() {
  try {
    const userRaw = localStorage.getItem("user");
    if (!userRaw) {
      window.location.href = "/login.html";
      return;
    }

    businessState.user = JSON.parse(userRaw);

    await loadBusinessDashboard(businessState.user);

    renderBusinessHero();
    renderBusinessChips();
    renderBusinessGhostActions();
    renderBusinessCards();
    renderBusinessBurgerMenu();
  } catch (err) {
    console.error("Business dashboard init failed", err);
  } finally {
    hideBusinessLoader();
  }
}

async function loadBusinessDashboard(user) {
  try {
    const res = await apiGet("/api/business/dashboard", user);
    if (!res?.success) {
      console.error("Business dashboard load failed", res?.error);
      return;
    }

    const data = res.data || {};

    businessState.business = data.business || null;
    businessState.earnings = data.earnings || 0;
    businessState.shows = Array.isArray(data.shows) ? data.shows : [];
    businessState.campaigns = Array.isArray(data.campaigns) ? data.campaigns : [];
    businessState.sponsorships = Array.isArray(data.sponsorships) ? data.sponsorships : [];

    businessState.analyticsChips = [
      { label: "Shows", value: businessState.shows.length, link: "#biz-shows" },
      { label: "Campaigns", value: businessState.campaigns.length, link: "#biz-campaigns" },
      { label: "Sponsorships", value: businessState.sponsorships.length, link: "#biz-sponsorships" },
      { label: "Earnings", value: `$${Number(businessState.earnings || 0).toFixed(2)}`, link: "#biz-earnings" }
    ];

    businessState.actions = [
      { id: "create-campaign", label: "Create Campaign", icon: "📣" },
      { id: "view-shows", label: "Shows", icon: "🎟️" },
      { id: "manage-sponsorships", label: "Sponsorships", icon: "🤝" },
      { id: "edit-profile", label: "Edit Profile", icon: "🖊️" }
    ];
  } catch (err) {
    console.error("Business dashboard load error", err);
  }
}

function renderBusinessHero() {
  const nameEl = $b("business-hero-name");
  const subtitleEl = $b("business-hero-subtitle");
  const earningsEl = $b("business-hero-earnings");

  if (nameEl) {
    nameEl.textContent =
      businessState.business?.display_name ||
      businessState.business?.name ||
      "Business";
  }

  if (subtitleEl) {
    subtitleEl.textContent = businessState.business?.category || "Roll Show Partner";
  }

  if (earningsEl) {
    earningsEl.textContent = `$${Number(businessState.earnings || 0).toFixed(2)}`;
  }
}

function renderBusinessChips() {
  const container = $b("business-analytics-chips");
  if (!container) return;

  container.innerHTML = "";
  businessState.analyticsChips.forEach((chip) => {
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

function renderBusinessGhostActions() {
  const container = $b("business-ghost-actions");
  if (!container) return;

  container.innerHTML = "";
  businessState.actions.forEach((action) => {
    const btn = document.createElement("button");
    btn.className = "rs-ghost-button";
    btn.dataset.actionId = action.id;
    btn.innerHTML = `<span class="rs-ghost-icon">${action.icon}</span><span>${action.label}</span>`;
    btn.addEventListener("click", () => handleBusinessAction(action.id));
    container.appendChild(btn);
  });
}

function renderBusinessCards() {
  renderBusinessShows();
  renderBusinessCampaigns();
  renderBusinessSponsorships();
}

function renderBusinessShows() {
  const container = $b("business-shows-cards");
  if (!container) return;

  container.innerHTML = "";
  if (!businessState.shows.length) {
    container.innerHTML = `<div class="rs-card rs-card-empty">No shows yet.</div>`;
    return;
  }

  businessState.shows.forEach((show) => {
    const card = document.createElement("div");
    card.className = "rs-card rs-card-show";
    card.innerHTML = `
      <div class="rs-card-title">${show.title || "Untitled Show"}</div>
      <div class="rs-card-meta">
        <span>${show.venue_name || ""}</span>
        <span>${show.date || ""}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderBusinessCampaigns() {
  const container = $b("business-campaigns-cards");
  if (!container) return;

  container.innerHTML = "";
  if (!businessState.campaigns.length) {
    container.innerHTML = `<div class="rs-card rs-card-empty">No campaigns yet.</div>`;
    return;
  }

  businessState.campaigns.forEach((c) => {
    const card = document.createElement("div");
    card.className = "rs-card rs-card-campaign";
    card.innerHTML = `
      <div class="rs-card-title">${c.name || "Campaign"}</div>
      <div class="rs-card-meta">
        <span>Status: ${c.status || "draft"}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderBusinessSponsorships() {
  const container = $b("business-sponsorships-cards");
  if (!container) return;

  container.innerHTML = "";
  if (!businessState.sponsorships.length) {
    container.innerHTML = `<div class="rs-card rs-card-empty">No sponsorships yet.</div>`;
    return;
  }

  businessState.sponsorships.forEach((s) => {
    const card = document.createElement("div");
    card.className = "rs-card rs-card-sponsorship";
    card.innerHTML = `
      <div class="rs-card-title">${s.title || "Sponsorship"}</div>
      <div class="rs-card-meta">
        <span>${s.status || ""}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderBusinessBurgerMenu() {
  const menu = $b("rs-burger-menu");
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

function handleBusinessAction(id) {
  switch (id) {
    case "create-campaign":
      window.location.href = "/business-campaign-create.html";
      break;
    case "view-shows":
      window.location.href = "/business-shows.html";
      break;
    case "manage-sponsorships":
      window.location.href = "/business-sponsorships.html";
      break;
    case "edit-profile":
      window.location.href = "/business-profile.html";
      break;
    default:
      console.log("Unhandled business action:", id);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initBusinessDashboard();
});
