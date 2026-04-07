// feed.js
import { apiJson } from "./users.js";

/* ============================================================
   INTERNAL: GET USER ROLE + PROFILE
============================================================ */
async function resolveUserProfile(env, user) {
  // Try skater
  const skater = await env.DB_users.prepare(
    "SELECT id FROM skater_profiles WHERE user_id = ?"
  ).bind(user.id).first();
  if (skater) return { role: "skater", profile_id: skater.id };

  // Try musician
  const musician = await env.DB_users.prepare(
    "SELECT id FROM musician_profiles WHERE user_id = ?"
  ).bind(user.id).first();
  if (musician) return { role: "musician", profile_id: musician.id };

  // Try business
  const business = await env.DB_users.prepare(
    "SELECT id FROM business_profiles WHERE user_id = ?"
  ).bind(user.id).first();
  if (business) return { role: "business", profile_id: business.id };

  // Try buyer
  const buyer = await env.DB_users.prepare(
    "SELECT id FROM buyer_profiles WHERE user_id = ?"
  ).bind(user.id).first();
  if (buyer) return { role: "buyer", profile_id: buyer.id };

  return null;
}

/* ============================================================
   CREATE FEED POST
============================================================ */
export async function createFeedPost(request, env, user) {
  const profile = await resolveUserProfile(env, user);
  if (!profile) return apiJson({ message: "Profile not found" }, 404);

  const {
    post_type = "post",
    content,
    media_url,
    media_type
  } = await request.json();

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB_users.prepare(
    `INSERT INTO feed_posts (
       id, user_id, role, profile_id,
       post_type, content, media_url, media_type,
       created_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      user.id,
      profile.role,
      profile.profile_id,
      post_type,
      content || null,
      media_url || null,
      media_type || null,
      now
    )
    .run();

  return apiJson({ post_id: id });
}

/* ============================================================
   LIST GLOBAL FEED
============================================================ */
export async function listFeed(request, env, user) {
  const { results } = await env.DB_users.prepare(
    `SELECT 
        p.*,
        (SELECT COUNT(*) FROM feed_likes WHERE post_id = p.id) AS like_count,
        (SELECT COUNT(*) FROM feed_comments WHERE post_id = p.id) AS comment_count,
        (SELECT COUNT(*) FROM feed_shares WHERE post_id = p.id) AS share_count
     FROM feed_posts p
     ORDER BY p.created_at DESC
     LIMIT 200`
  ).all();

  return apiJson({ feed: results });
}

/* ============================================================
   LIKE / UNLIKE POST
============================================================ */
export async function toggleLike(request, env, user) {
  const { post_id } = await request.json();
  if (!post_id) return apiJson({ message: "Missing post_id" }, 400);

  const existing = await env.DB_users.prepare(
    "SELECT id FROM feed_likes WHERE post_id = ? AND user_id = ?"
  )
    .bind(post_id, user.id)
    .first();

  if (existing) {
    await env.DB_users.prepare(
      "DELETE FROM feed_likes WHERE id = ?"
    ).bind(existing.id).run();

    return apiJson({ post_id, liked: false });
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB_users.prepare(
    `INSERT INTO feed_likes (id, post_id, user_id, created_at)
     VALUES (?, ?, ?, ?)`
  )
    .bind(id, post_id, user.id, now)
    .run();

  return apiJson({ post_id, liked: true });
}

/* ============================================================
   COMMENT ON POST
============================================================ */
export async function commentOnPost(request, env, user) {
  const { post_id, content } = await request.json();
  if (!post_id || !content) {
    return apiJson({ message: "Missing post_id or content" }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB_users.prepare(
    `INSERT INTO feed_comments (
       id, post_id, user_id, content, created_at
     )
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(id, post_id, user.id, content, now)
    .run();

  return apiJson({ comment_id: id });
}

/* ============================================================
   SHARE POST
============================================================ */
export async function sharePost(request, env, user) {
  const { post_id } = await request.json();
  if (!post_id) return apiJson({ message: "Missing post_id" }, 400);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB_users.prepare(
    `INSERT INTO feed_shares (
       id, post_id, user_id, created_at
     )
     VALUES (?, ?, ?, ?)`
  )
    .bind(id, post_id, user.id, now)
    .run();

  return apiJson({ share_id: id });
}

/* ============================================================
   CREATE STITCH (VIDEO RESPONSE)
============================================================ */
export async function createStitch(request, env, user) {
  const { post_id, video_url } = await request.json();
  if (!post_id || !video_url) {
    return apiJson({ message: "Missing post_id or video_url" }, 400);
  }

  const id = crypto.randomUUID();

  await env.DB_users.prepare(
    `INSERT INTO feed_stitches (
       id, post_id, user_id, video_url
     )
     VALUES (?, ?, ?, ?)`
  )
    .bind(id, post_id, user.id, video_url)
    .run();

  return apiJson({ stitch_id: id });
}

/* ============================================================
   REPORT POST
============================================================ */
export async function reportPost(request, env, user) {
  const { post_id, reason } = await request.json();
  if (!post_id || !reason) {
    return apiJson({ message: "Missing post_id or reason" }, 400);
  }

  const id = crypto.randomUUID();

  await env.DB_users.prepare(
    `INSERT INTO feed_reports (
       id, post_id, reporter_id, reason
     )
     VALUES (?, ?, ?, ?)`
  )
    .bind(id, post_id, user.id, reason)
    .run();

  return apiJson({ report_id: id });
}

/* ============================================================
   RECORD VIEW / IMPRESSION
============================================================ */
export async function recordView(request, env, user) {
  const { post_id } = await request.json();
  if (!post_id) return apiJson({ message: "Missing post_id" }, 400);

  const id = crypto.randomUUID();

  await env.DB_users.prepare(
    `INSERT INTO feed_views (id, user_id, post_id)
     VALUES (?, ?, ?)`
  )
    .bind(id, user.id, post_id)
    .run();

  return apiJson({ ok: true });
}

export async function recordImpression(request, env, user) {
  const { post_id, source } = await request.json();
  if (!post_id) return apiJson({ message: "Missing post_id" }, 400);

  const id = crypto.randomUUID();

  await env.DB_users.prepare(
    `INSERT INTO feed_impressions (id, user_id, post_id, source)
     VALUES (?, ?, ?, ?)`
  )
    .bind(id, user.id, post_id, source || null)
    .run();

  return apiJson({ ok: true });
}
