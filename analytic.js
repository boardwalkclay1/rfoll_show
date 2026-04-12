// analytics.js
import { apiJson } from "./users.js";

/* ============================================================
   INTERNAL: ADVANCED ANALYTICS LOGGER
============================================================ */
async function logAnalytics(env, {
  user_id,
  event_type,
  target_type = null,
  target_id = null,
  title = null,
  value = null,
  metadata = null
}) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB_roll.prepare(
    `INSERT INTO analytics (
       id, user_id, title, value, created_at,
       event_type, target_type, target_id, metadata
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      user_id,
      title,
      value,
      now,
      event_type,
      target_type,
      target_id,
      metadata ? JSON.stringify(metadata) : null
    )
    .run();

  return id;
}

/* ============================================================
   INTERNAL: USER ACTIVITY LOG
============================================================ */
async function logActivity(env, user_id, action, target_type, target_id, metadata) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB_roll.prepare(
    `INSERT INTO user_activity_log (
       id, user_id, action, target_type, target_id, metadata, created_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      user_id,
      action,
      target_type,
      target_id,
      metadata ? JSON.stringify(metadata) : null,
      now
    )
    .run();

  return id;
}

/* ============================================================
   INTERNAL: WEBHOOK TRIGGER
============================================================ */
async function triggerWebhooks(env, event_type, payload) {
  const { results } = await env.DB_roll.prepare(
    `SELECT * FROM webhooks
     WHERE event_type = ? AND active = 1`
  )
    .bind(event_type)
    .all();

  for (const hook of results) {
    fetch(hook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": hook.secret || ""
      },
      body: JSON.stringify(payload)
    }).catch(() => {});
  }
}

/* ============================================================
   PUBLIC: RECORD GENERIC EVENT
============================================================ */
export async function recordEvent(request, env, user) {
  const { event_type, target_type, target_id, value, metadata } = await request.json();

  if (!event_type) return apiJson({ message: "Missing event_type" }, 400);

  const analytics_id = await logAnalytics(env, {
    user_id: user.id,
    event_type,
    target_type,
    target_id,
    value,
    metadata,
    title: event_type
  });

  await triggerWebhooks(env, "analytics_event", {
    analytics_id,
    user_id: user.id,
    event_type,
    target_type,
    target_id,
    value
  });

  return apiJson({ analytics_id });
}

/* ============================================================
   PUBLIC: RECORD USER ACTIVITY
============================================================ */
export async function recordActivity(request, env, user) {
  const { action, target_type, target_id, metadata } = await request.json();

  if (!action) return apiJson({ message: "Missing action" }, 400);

  const activity_id = await logActivity(env, user.id, action, target_type, target_id, metadata);

  await triggerWebhooks(env, "user_activity", {
    activity_id,
    user_id: user.id,
    action,
    target_type,
    target_id
  });

  return apiJson({ activity_id });
}

/* ============================================================
   PUBLIC: RECORD FEED VIEW
============================================================ */
export async function recordFeedView(request, env, user) {
  const { post_id } = await request.json();
  if (!post_id) return apiJson({ message: "Missing post_id" }, 400);

  const id = crypto.randomUUID();

  await env.DB_roll.prepare(
    `INSERT INTO feed_views (id, user_id, post_id)
     VALUES (?, ?, ?)`
  )
    .bind(id, user.id, post_id)
    .run();

  await logAnalytics(env, {
    user_id: user.id,
    event_type: "view_post",
    target_type: "post",
    target_id: post_id,
    value: 1
  });

  return apiJson({ ok: true });
}

/* ============================================================
   PUBLIC: RECORD FEED IMPRESSION
============================================================ */
export async function recordFeedImpression(request, env, user) {
  const { post_id, source } = await request.json();
  if (!post_id) return apiJson({ message: "Missing post_id" }, 400);

  const id = crypto.randomUUID();

  await env.DB_roll.prepare(
    `INSERT INTO feed_impressions (id, user_id, post_id, source)
     VALUES (?, ?, ?, ?)`
  )
    .bind(id, user.id, post_id, source || null)
    .run();

  await logAnalytics(env, {
    user_id: user.id,
    event_type: "impression_post",
    target_type: "post",
    target_id: post_id,
    value: 1,
    metadata: { source }
  });

  return apiJson({ ok: true });
}

/* ============================================================
   PUBLIC: RECORD QR SCAN
============================================================ */
export async function recordQrScan(request, env, user) {
  const { qr_id } = await request.json();
  if (!qr_id) return apiJson({ message: "Missing qr_id" }, 400);

  await logAnalytics(env, {
    user_id: user?.id || "anonymous",
    event_type: "scan_qr",
    target_type: "qr",
    target_id: qr_id,
    value: 1
  });

  return apiJson({ ok: true });
}

/* ============================================================
   PUBLIC: RECORD HEATMAP METRIC
============================================================ */
export async function recordHeatmapMetric(request, env, user) {
  const { session_id, metric, value } = await request.json();
  if (!session_id || !metric || value === undefined) {
    return apiJson({ message: "Missing session_id, metric, or value" }, 400);
  }

  const id = crypto.randomUUID();

  await env.DB_roll.prepare(
    `INSERT INTO sessions_heatmap (
       id, session_id, metric, value
     )
     VALUES (?, ?, ?, ?)`
  )
    .bind(id, session_id, metric, value)
    .run();

  await logAnalytics(env, {
    user_id: user.id,
    event_type: `session_metric:${metric}`,
    target_type: "session",
    target_id: session_id,
    value
  });

  return apiJson({ heatmap_id: id });
}

/* ============================================================
   PUBLIC: ATTACH ANALYTICS TO SESSION
============================================================ */
export async function attachAnalyticsToSession(request, env, user) {
  const { session_id, analytics_id } = await request.json();
  if (!session_id || !analytics_id) {
    return apiJson({ message: "Missing session_id or analytics_id" }, 400);
  }

  const id = crypto.randomUUID();

  await env.DB_roll.prepare(
    `INSERT INTO sessions_analytics_bridge (
       id, session_id, analytics_id
     )
     VALUES (?, ?, ?)`
  )
    .bind(id, session_id, analytics_id)
    .run();

  return apiJson({ bridge_id: id });
}

/* ============================================================
   PUBLIC: LOG ERROR
============================================================ */
export async function logError(request, env) {
  const { context, message, stack } = await request.json();
  if (!message) return apiJson({ message: "Missing message" }, 400);

  const id = crypto.randomUUID();

  await env.DB_roll.prepare(
    `INSERT INTO error_logs (
       id, context, message, stack
     )
     VALUES (?, ?, ?, ?)`
  )
    .bind(id, context || null, message, stack || null)
    .run();

  return apiJson({ error_id: id });
}

/* ============================================================
   PUBLIC: LOG AUDIT ACTION
============================================================ */
export async function logAudit(request, env, user) {
  const { action, target_type, target_id, detail } = await request.json();
  if (!action) return apiJson({ message: "Missing action" }, 400);

  const id = crypto.randomUUID();

  await env.DB_roll.prepare(
    `INSERT INTO audit_log (
       id, actor_id, action, target_type, target_id, detail
     )
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(id, user.id, action, target_type || null, target_id || null, detail || null)
    .run();

  return apiJson({ audit_id: id });
}
