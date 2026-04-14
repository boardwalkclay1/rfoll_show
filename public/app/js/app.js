// /app/js/app.js — CLEANED + OWNER-SAFE VERSION
// --------------------------------------------------------------
// This file ONLY handles:
// - shows
// - tickets
// - purchases
// - UI rendering
// - navigation
// - DOM helpers
//
// It DOES NOT handle:
// - login
// - cookies
// - sessions
// - role guard
// - redirects
// - auth checks
//
// OWNER ALWAYS ALLOWED.
// --------------------------------------------------------------

// ============================================================
// OWNER MODE (always true for you)
// ============================================================
const OWNER_MODE = true;

// ============================================================
// DOM READY
// ============================================================
function onReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

// ============================================================
// LOGOUT BUTTONS (optional)
// ============================================================
onReady(() => {
  document.querySelectorAll(".logout-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      window.location.href = "/pages/auth-login.html";
    });
  });
});

// ============================================================
// SHOW LISTING (homepage)
// ============================================================
onReady(() => {
  const featured = document.getElementById("featuredShows");
  const grid = document.getElementById("showGrid");
  if (!featured && !grid) return;

  (async () => {
    try {
      const res = await API.get("/api/shows");
      const shows = res?.data || [];

      if (!Array.isArray(shows) || shows.length === 0) {
        if (featured) featured.innerHTML = "<p>No shows yet.</p>";
        if (grid) grid.innerHTML = "<p>No shows yet.</p>";
        return;
      }

      if (featured) featured.innerHTML = shows.slice(0, 3).map(showCard).join("");
      if (grid) grid.innerHTML = shows.map(showCard).join("");
    } catch {
      if (featured) featured.innerHTML = "<p>Error loading shows.</p>";
      if (grid) grid.innerHTML = "<p>Error loading shows.</p>";
    }
  })();
});

// ============================================================
// SHOW PAGE
// ============================================================
onReady(() => {
  const header = document.getElementById("showHeader");
  const preview = document.getElementById("showVideoPreview");
  const priceDisplay = document.getElementById("ticketPriceDisplay");
  const desc = document.getElementById("showDescriptionText");
  const buyBtn = document.getElementById("buyTicketBtn");

  if (!header && !buyBtn && !preview && !priceDisplay && !desc) return;

  (async () => {
    const url = new URL(window.location.href);
    const showId = url.searchParams.get("id");
    if (!showId) return;

    try {
      const res = await API.get(`/api/shows/${encodeURIComponent(showId)}`);
      const show = res?.data;
      if (!show) return;

      if (header) header.innerHTML = `<h1>${escapeHtml(show.title)}</h1><p>${escapeHtml(show.description || "")}</p>`;
      if (preview) preview.innerHTML = `<img src="${escapeAttr(show.thumbnail)}" class="video-thumb">`;
      if (priceDisplay) priceDisplay.textContent = `$${(Number(show.price_cents || 0) / 100).toFixed(2)}`;
      if (desc) desc.textContent = show.description || "";
    } catch {}
  })();

  if (buyBtn) {
    buyBtn.addEventListener("click", async () => {
      try {
        const showId = new URL(window.location.href).searchParams.get("id");
        const res = await API.post("/api/buyer/tickets", { show_id: showId });
        const ticketId = res?.data?.ticketId;

        if (!ticketId) {
          alert("Error creating ticket.");
          return;
        }

        window.location.href = `/pages/ticket-confirmation.html?ticket=${encodeURIComponent(ticketId)}`;
      } catch {
        alert("Network error creating ticket.");
      }
    });
  }
});

// ============================================================
// TICKET WALLET
// ============================================================
onReady(() => {
  const wallet = document.getElementById("ticketWalletList");
  if (!wallet) return;

  (async () => {
    try {
      const res = await API.get("/api/buyer/tickets");
      const tickets = res?.data || [];

      if (!Array.isArray(tickets) || tickets.length === 0) {
        wallet.innerHTML = "<p>No tickets yet.</p>";
        return;
      }

      wallet.innerHTML = tickets.map(t => `
        <div class="ticket-card">
          <h3>${escapeHtml(t.title)}</h3>
          <p>Premiere: ${escapeHtml(t.premiere_date)}</p>
          <p>QR: ${escapeHtml(t.qr_code)}</p>
          <button onclick="viewTicket('${encodeURIComponent(t.id)}')">View Ticket</button>
        </div>
      `).join("");
    } catch {
      wallet.innerHTML = "<p>Error loading tickets.</p>";
    }
  })();
});

// ============================================================
// PURCHASE HISTORY
// ============================================================
onReady(() => {
  const history = document.getElementById("purchaseHistoryList");
  if (!history) return;

  (async () => {
    try {
      const res = await API.get("/api/buyer/purchases");
      const rows = res?.data || [];

      if (!Array.isArray(rows) || rows.length === 0) {
        history.innerHTML = "<p>No purchases yet.</p>";
        return;
      }

      history.innerHTML = rows.map(p => `
        <div class="purchase-item">
          <h3>${escapeHtml(p.title)}</h3>
          <p>Amount: $${(Number(p.amount_cents || 0) / 100).toFixed(2)}</p>
          <p>Date: ${new Date(p.created_at).toLocaleString()}</p>
          <p>Transaction: ${escapeHtml(p.partner_transaction_id || '')}</p>
        </div>
      `).join("");
    } catch {
      history.innerHTML = "<p>Error loading purchases.</p>";
    }
  })();
});

// ============================================================
// NAV HELPERS
// ============================================================
function viewTicket(id) {
  window.location.href = `/pages/ticket-view.html?id=${encodeURIComponent(id)}`;
}

function viewShow(id) {
  window.location.href = `/pages/show.html?id=${encodeURIComponent(id)}`;
}

// ============================================================
// SAFETY HELPERS
// ============================================================
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll("\n", " ");
}
