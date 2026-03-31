const container = document.getElementById("business-dashboard");

function render(html) {
  container.innerHTML = html;
}

async function loadDashboard() {
  const res = await fetch("/api/business/dashboard", {
    headers: { "Content-Type": "application/json" }
  });

  const data = await res.json();

  /* ============================================================
     VERIFICATION STATES
  ============================================================ */
  if (!res.ok) {
    if (data.review_status === "pending") {
      return render(`
        <h1 class="rs-title">Application Pending</h1>
        <p>Your business is under review. You will be notified once approved.</p>
      `);
    }

    if (data.review_status === "needs_info") {
      return render(`
        <h1 class="rs-title">More Information Required</h1>
        <p>${data.review_notes || "Please provide additional information."}</p>
      `);
    }

    if (data.review_status === "rejected") {
      return render(`
        <h1 class="rs-title">Application Rejected</h1>
        <p>${data.review_notes || "Your application was not approved."}</p>
      `);
    }

    return render(`<p class="rs-message error">${data.error}</p>`);
  }

  /* ============================================================
     APPROVED DASHBOARD
  ============================================================ */

  const {
    business,
    offers,
    contracts,
    ads,
    sponsorships,
    events,
    skater_opportunities
  } = data;

  render(`
    <h1 class="rs-title">${business.company_name}</h1>
    <p class="rs-subtitle">Verified Business Dashboard</p>

    <!-- SKATER OPPORTUNITIES -->
    <section class="rs-section">
      <h2 class="rs-subtitle">Skater Opportunities</h2>
      <div class="rs-list">
        ${
          (skater_opportunities || []).length
            ? skater_opportunities
                .map(
                  (s) => `
          <div class="rs-item">
            <strong>${s.name}</strong> — ${s.discipline || ""}
            <div class="rs-item-actions">
              <button class="rs-btn-secondary" data-action="message" data-skater="${s.id}">
                Message
              </button>
              <button class="rs-btn-secondary" data-action="sponsor" data-skater="${s.id}">
                Propose Sponsorship
              </button>
            </div>
          </div>
        `
                )
                .join("")
            : "<p>No signed skaters available yet.</p>"
        }
      </div>
    </section>

    <!-- ADS -->
    <section class="rs-section">
      <h2 class="rs-subtitle">Advertising</h2>
      <button class="rs-btn-primary" id="create-ad-btn">Create Ad</button>
      <pre class="rs-pre">${JSON.stringify(ads, null, 2)}</pre>
    </section>

    <!-- SPONSORSHIPS -->
    <section class="rs-section">
      <h2 class="rs-subtitle">Sponsorships</h2>
      <pre class="rs-pre">${JSON.stringify(sponsorships, null, 2)}</pre>
    </section>

    <!-- EVENTS -->
    <section class="rs-section">
      <h2 class="rs-subtitle">Events</h2>
      <button class="rs-btn-primary" id="create-event-btn">Create Event</button>
      <pre class="rs-pre">${JSON.stringify(events, null, 2)}</pre>
    </section>

    <!-- OFFERS -->
    <section class="rs-section">
      <h2 class="rs-subtitle">Offers</h2>
      <pre class="rs-pre">${JSON.stringify(offers, null, 2)}</pre>
    </section>

    <!-- CONTRACTS -->
    <section class="rs-section">
      <h2 class="rs-subtitle">Contracts</h2>
      <pre class="rs-pre">${JSON.stringify(contracts, null, 2)}</pre>
    </section>
  `);

  wireActions();
}

/* ============================================================
   ACTION HANDLERS
============================================================ */
function wireActions() {
  const root = container;

  /* CREATE AD */
  const createAdBtn = document.getElementById("create-ad-btn");
  if (createAdBtn) {
    createAdBtn.addEventListener("click", async () => {
      const title = prompt("Ad title:");
      if (!title) return;

      await fetch("/api/business/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
      });

      loadDashboard();
    });
  }

  /* CREATE EVENT */
  const createEventBtn = document.getElementById("create-event-btn");
  if (createEventBtn) {
    createEventBtn.addEventListener("click", async () => {
      const title = prompt("Event title:");
      if (!title) return;

      await fetch("/api/business/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
      });

      loadDashboard();
    });
  }

  /* MESSAGE + SPONSORSHIP BUTTONS */
  root.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    const skaterId = btn.dataset.skater;

    if (!action || !skaterId) return;

    if (action === "message") {
      const message = prompt("Message to skater:");
      if (!message) return;

      await fetch("/api/skater/business/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: null, // backend links automatically
          message
        })
      });

      alert("Message sent.");
    }

    if (action === "sponsor") {
      alert("Sponsorship proposal flow coming next.");
    }
  });
}

loadDashboard();
