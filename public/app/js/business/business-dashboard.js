const container = document.getElementById("business-dashboard");

function render(html) {
  container.innerHTML = html;
}

async function loadDashboard() {
  const res = await fetch("/api/business/dashboard", {
    headers: { "Content-Type": "application/json" }
  });

  const data = await res.json();

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

  /* APPROVED DASHBOARD */
  render(`
    <h1 class="rs-title">Business Dashboard</h1>
    <p class="rs-subtitle">Welcome, your business is verified.</p>

    <div class="rs-section">
      <h2 class="rs-subtitle">Offers</h2>
      <pre>${JSON.stringify(data.offers, null, 2)}</pre>
    </div>

    <div class="rs-section">
      <h2 class="rs-subtitle">Contracts</h2>
      <pre>${JSON.stringify(data.contracts, null, 2)}</pre>
    </div>
  `);
}

loadDashboard();
