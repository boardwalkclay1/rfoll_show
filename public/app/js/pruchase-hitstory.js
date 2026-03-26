// purchase-history.js

document.addEventListener("DOMContentLoaded", () => {
  loadPurchaseHistory();
});

async function loadPurchaseHistory() {
  const container = document.getElementById("purchaseHistoryList");
  container.innerHTML = `<p style="color:white;">Loading...</p>`;

  try {
    const buyerId = localStorage.getItem("buyer_id");
    if (!buyerId) {
      container.innerHTML = `
        <p style="color:white;">You must be logged in to view purchase history.</p>
      `;
      return;
    }

    const res = await fetch("/api/purchases", {
      method: "GET",
      headers: {
        "x-buyer-id": buyerId
      }
    });

    if (!res.ok) {
      container.innerHTML = `
        <p style="color:white;">Unable to load purchase history.</p>
      `;
      return;
    }

    const purchases = await res.json();

    if (!purchases.length) {
      container.innerHTML = `
        <p style="color:white;">No purchases yet.</p>
      `;
      return;
    }

    container.innerHTML = "";

    purchases.forEach(purchase => {
      const item = document.createElement("div");
      item.className = "purchase-item";
      item.style = `
        background: rgba(0,0,0,0.6);
        padding: 16px;
        border-radius: 12px;
        margin-bottom: 16px;
        color: white;
        backdrop-filter: blur(6px);
      `;

      const amount = (purchase.amount_cents / 100).toFixed(2);
      const date = new Date(purchase.created_at).toLocaleString();

      item.innerHTML = `
        <h3 style="margin:0 0 8px 0;">${purchase.title}</h3>

        <p style="margin:4px 0;">
          <strong>Amount:</strong> $${amount}
        </p>

        <p style="margin:4px 0;">
          <strong>Date:</strong> ${date}
        </p>

        <p style="margin:4px 0;">
          <strong>Transaction ID:</strong> ${purchase.partner_transaction_id}
        </p>

        <p style="margin:4px 0;">
          <strong>Ticket ID:</strong> ${purchase.ticket_id}
        </p>
      `;

      container.appendChild(item);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <p style="color:white;">Something went wrong loading your purchase history.</p>
    `;
  }
}
