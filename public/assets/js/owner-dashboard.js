async function loadOwnerOverview() {
  const user = JSON.parse(localStorage.getItem("rollshow_user"));
  if (!user) return;

  const res = await fetch("/api/owner/overview", {
    headers: { "x-owner-id": user.id }
  });

  if (!res.ok) {
    console.error("Owner API failed:", await res.text());
    return;
  }

  const data = await res.json();
  const grid = document.getElementById("overview-grid");

  const items = [
    { label: "Total Users", value: data.total_users },
    { label: "Skaters", value: data.total_skaters },
    { label: "Businesses", value: data.total_businesses },
    { label: "Musicians", value: data.total_musicians },
    { label: "Shows", value: data.total_shows },
    { label: "Tickets Sold", value: data.total_tickets },
    { label: "Purchases", value: data.total_purchases },
    { label: "Revenue", value: "$" + data.total_revenue }
  ];

  grid.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${item.label}</h3>
      <p>${item.value}</p>
    `;
    grid.appendChild(card);
  });
}

loadOwnerOverview();
