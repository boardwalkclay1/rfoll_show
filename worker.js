export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ROUTES
    if (path === "/api/create-show" && request.method === "POST") {
      return createShow(request, env);
    }

    if (path === "/api/get-shows" && request.method === "GET") {
      return getShows(env);
    }

    if (path === "/api/buy-ticket" && request.method === "POST") {
      return buyTicket(request, env);
    }

    // STATIC FALLBACK (if using site bucket)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not found", { status: 404 });
  }
};

async function createShow(request, env) {
  try {
    const data = await request.json();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await env.DB.prepare(`
      INSERT INTO shows (
        id, skater_id, title, tagline, description,
        discipline, price, premiere_date, video_id,
        status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.skater_id,
      data.title,
      data.tagline,
      data.description,
      data.discipline,
      data.price,
      data.premiereDate,
      data.videoSource,
      "scheduled",
      now
    ).run();

    return Response.json({ success: true, id });

  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

async function getShows(env) {
  try {
    const shows = await env.DB
      .prepare("SELECT * FROM shows ORDER BY created_at DESC")
      .all();

    return Response.json(shows.results);

  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

async function buyTicket(request, env) {
  try {
    const data = await request.json();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await env.DB.prepare(`
      INSERT INTO tickets (id, show_id, buyer_id, purchase_time, status)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      id,
      data.show_id,
      data.buyer_id,
      now,
      "valid"
    ).run();

    // TODO: payout workflow (15% platform fee)

    return Response.json({ success: true, ticket_id: id });

  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
