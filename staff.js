// staff.js
import { apiJson } from "./users.js";

/* ============================================================
   ADD STAFF MEMBER TO BUSINESS
============================================================ */
export async function addStaff(request, env, user) {
  const { staff_user_id, role = "manager" } = await request.json();

  const business = await env.DB_roll.prepare(
    "SELECT id FROM business_profiles WHERE user_id = ?"
  ).bind(user.id).first();

  if (!business) return apiJson({ message: "Business profile not found" }, 404);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB_roll.prepare(
    `INSERT INTO business_staff (
       id, business_id, user_id, role, created_at
     )
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(id, business.id, staff_user_id, role, now)
    .run();

  return apiJson({ staff_id: id });
}

/* ============================================================
   LIST STAFF FOR BUSINESS
============================================================ */
export async function listStaff(request, env, user) {
  const business = await env.DB_roll.prepare(
    "SELECT id FROM business_profiles WHERE user_id = ?"
  ).bind(user.id).first();

  if (!business) return apiJson({ message: "Business profile not found" }, 404);

  const { results } = await env.DB_roll.prepare(
    `SELECT * FROM business_staff
     WHERE business_id = ?
     ORDER BY created_at DESC`
  )
    .bind(business.id)
    .all();

  return apiJson({ staff: results });
}
