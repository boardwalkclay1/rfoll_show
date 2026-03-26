export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    // --- CORS PRE-FLIGHT ---
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    // --- API ROUTES ---
    if (pathname === "/api/shows" && request.method === "GET") {
      return listShows(env);
    }

    if (pathname.startsWith("/api/shows/") && request.method === "GET") {
      const id = pathname.split("/").pop();
      return getShow(env, id);
    }

    if (pathname === "/api/tickets" && request.method === "GET") {
      return listBuyerTickets(request, env);
    }

    if (pathname === "/api/purchases" && request.method === "GET") {
      return listBuyerPurchases(request, env);
    }

    if (pathname === "/api/tickets/create" && request.method === "POST") {
      return createPendingTicket(request, env);
    }

    if (pathname === "/api/webhooks/partner" && request.method === "POST") {
      return handlePartnerWebhook(request, env);
    }

    return new Response("Not found", {
      status: 404,
      headers: corsHeaders()
    });
  }
};

// ======================================================
// API FUNCTIONS
// ======================================================

async function listShows(env) {
  const { results } = await env.DB.prepare(
    "SELECT id, title, description, price_cents, thumbnail, premiere_date FROM shows ORDER BY created_at DESC"
  ).all();

  return json(results);
}

async function getShow(env, id) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM shows WHERE id = ?"
  ).bind(id).all();

  if (!results.length) return json({ error: "Show not found" }, 404);
  return json(results[0]);
}

async function listBuyerTickets(request, env) {
  const buyerId = await getBuyerIdFromAuth(request);
  if (!buyerId) return json({ error: "Unauthorized" }, 401);

  const { results } = await env.DB.prepare(
    `SELECT t.*, s.title, s.premiere_date
     FROM tickets t
     JOIN shows s ON t.show_id = s.id
     WHERE t.buyer_id = ? AND t.status = 'paid'
     ORDER BY t.created_at DESC`
  ).bind(buyerId).all();

  return json(results);
}

async function listBuyerPurchases(request, env) {
  const buyerId = await getBuyerIdFromAuth(request);
  if (!buyerId) return json({ error: "Unauthorized" }, 401);

  const { results } = await env.DB.prepare(
    `SELECT p.*, s.title
     FROM purchases p
     JOIN tickets t ON p.ticket_id = t.id
     JOIN shows s ON t.show_id = s.id
     WHERE p.buyer_id = ?
     ORDER BY p.created_at DESC`
  ).bind(buyerId).all();

  return json(results);
}

async function createPendingTicket(request, env) {
  const buyerId = await getBuyerIdFromAuth(request);
  if (!buyerId) return json({ error: "Unauthorized" }, 401);

  const { showId } = await request.json();
  if (!showId) return json({ error: "Missing showId" }, 400);

  const ticketId = crypto.randomUUID();
  const qrCode = `ROLLSHOW-${ticketId}`;
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO tickets (id, show_id, buyer_id, qr_code, stamp, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`
  ).bind(ticketId, showId, buyerId, qrCode, "unverified", now).run();

  return json({
    ticketId,
    status: "pending",
    message: "Ticket created. Redirect to partner checkout."
  });
}

async function handlePartnerWebhook(request, env) {
  const payload = await request.json();
  const { ticketId, amount_cents, partner_transaction_id, status } = payload;

  if (status !== "paid") return json({ ok: true });

  const now = new Date().toISOString();

  const ticketRow = await env.DB.prepare(
    "SELECT buyer_id, show_id FROM tickets WHERE id = ?"
  ).bind(ticketId).first();

  if (!ticketRow) return json({ error: "Ticket not found" }, 404);

  await env.DB.prepare(
    "UPDATE tickets SET status = 'paid', stamp = 'verified' WHERE id = ?"
  ).bind(ticketId).run();

  const purchaseId = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO purchases (id, buyer_id, ticket_id, amount_cents, partner_transaction_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(
    purchaseId,
    ticketRow.buyer_id,
    ticketId,
    amount_cents,
    partner_transaction_id,
    now
  ).run();

  return json({ ok: true });
}

// ======================================================
// HELPERS
// ======================================================

async function getBuyerIdFromAuth(request) {
  return request.headers.get("x-buyer-id") || null;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders()
    }
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "https://roll-show.pages.dev",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-buyer-id"
  };
}
