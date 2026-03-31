import { json } from "../users.js";
import { requireRole } from "../users.js";

/* ============================================================
   OWNER: BUSINESS APPLICATIONS LIST (PENDING)
============================================================ */
export async function ownerBusinessApplications(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const { results } = await env.DB_business.prepare(
      `SELECT b.id,
              b.company_name,
              b.website,
              b.phone,
              b.address,
              b.ein,
              b.verified,
              b.review_status,
              b.review_notes,
              b.submitted_at,
              u.email AS owner_email,
              u.name  AS owner_name
       FROM businesses b
       JOIN users u ON b.user_id = u.id
       WHERE b.review_status IN ('pending','needs_info')
       ORDER BY b.submitted_at DESC`
    ).all();

    return json({ applications: results || [] });
  });
}

/* ============================================================
   OWNER: UPDATE BUSINESS APPLICATION STATUS
============================================================ */
export async function ownerBusinessUpdateStatus(request, env) {
  return requireRole(request, env, ["owner"], async (req, env) => {
    const body = await req.json().catch(() => ({}));
    const { businessId, action, notes } = body;

    const valid = ["approve", "reject", "needs_info"];
    if (!valid.includes(action)) {
      return json({ success: false, error: "Invalid action" }, 400);
    }

    let verified = 0;
    let review_status = "pending";

    if (action === "approve") {
      verified = 1;
      review_status = "approved";
    } else if (action === "reject") {
      verified = 0;
      review_status = "rejected";
    } else if (action === "needs_info") {
      verified = 0;
      review_status = "needs_info";
    }

    await env.DB_business.prepare(
      `UPDATE businesses
       SET verified = ?, review_status = ?, review_notes = ?
       WHERE id = ?`
    ).bind(verified, review_status, notes || "", businessId).run();

    return json({ success: true, businessId, review_status, verified });
  });
}
