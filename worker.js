export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // -----------------------------
    // CORS + OPTIONS SUPPORT
    // -----------------------------
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // -----------------------------
    // AUTH ROUTES
    // -----------------------------
    if (path === "/api/signup" && request.method === "POST") {
      const res = await signup(request, env);
      return addCors(res, corsHeaders);
    }

    if (path === "/api/login" && request.method === "POST") {
      const res = await login(request, env);
      return addCors(res, corsHeaders);
    }

    // -----------------------------
    // SHOW ROUTES
    // -----------------------------
    if (path === "/api/create-show" && request.method === "POST") {
      const res = await createShow(request, env);
      return addCors(res, corsHeaders);
    }

    if (path === "/api/get-shows" && request.method === "GET") {
      const res = await getShows(env);
      return addCors(res, corsHeaders);
    }

    if (path === "/api/buy-ticket" && request.method === "POST") {
      const res = await buyTicket(request, env);
      return addCors(res, corsHeaders);
    }

    // -----------------------------
    // STATIC FALLBACK (for Worker mode)
    // -----------------------------
    if (env.ASSETS) {
      const assetResponse = await env.ASSETS.fetch(request);
      return addCors(assetResponse, corsHeaders);
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  }
};

// -----------------------------
// CORS WRAPPER
// -----------------------------
function addCors(response, corsHeaders) {
  const newHeaders = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders)) {
    newHeaders.set(k, v);
  }
  return new Response(response.body, {
    status: response.status,
    headers: newHeaders
  });
}

// -----------------------------
// AUTH HELPERS
// -----------------------------
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// -----------------------------
// SIGNUP
// -----------------------------
async function signup(request, env) {
  try {
    const data = await request.json();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const passwordHash = await hashPassword(data.password);

    await env.DB.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.name,
      data.email,
      passwordHash,
      data.role,
      now
    ).run();

    return Response.json({ success: true, user_id: id });

  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// -----------------------------
// LOGIN
// -----------------------------
async function login(request, env) {
  try {
    const data = await request.json();
    const passwordHash = await hashPassword(data.password);

    const user = await env.DB.prepare(`
      SELECT * FROM users WHERE email = ?
    `).bind(data.email).first();

    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (user.password_hash !== passwordHash) {
      return Response.json({ success: false, error: "Invalid password" }, { status: 401 });
    }

    return Response.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// -----------------------------
// CREATE SHOW
// -----------------------------
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

// -----------------------------
// GET SHOWS
// -----------------------------
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

// -----------------------------
// BUY TICKET
// -----------------------------
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

    return Response.json({ success: true, ticket_id: id });

  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
