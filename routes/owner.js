// routes/owner.js — FULL CINEMATIC OWNER DASHBOARD
import { apiJson, requireRole } from "../users.js";

/* ============================================================
   OWNER DASHBOARD — MAIN ENTRY
   Returns structured sections for mobile UI
============================================================ */
export async function ownerDashboard(request, env) {
  return requireRole(request, env, ["owner"], async () => {
    const db = env.DB_users;

    /* ------------------------------
       HIGH-LEVEL COUNTS
    ------------------------------ */
    const total_users = (await db.prepare("SELECT COUNT(*) AS n FROM users").first()).n;
    const total_skaters = (await db.prepare("SELECT COUNT(*) AS n FROM skater_profiles").first()).n;
    const total_businesses = (await db.prepare("SELECT COUNT(*) AS n FROM business_profiles").first()).n;
    const total_musicians = (await db.prepare("SELECT COUNT(*) AS n FROM musician_profiles").first()).n;
    const total_buyers = (await db.prepare("SELECT COUNT(*) AS n FROM buyer_profiles").first()).n;

    const total_shows = (await db.prepare("SELECT COUNT(*) AS n FROM shows").first()).n;
    const total_tickets = (await db.prepare("SELECT COUNT(*) AS n FROM tickets").first()).n;

    const total_merch_orders = (await db.prepare("SELECT COUNT(*) AS n FROM merch_orders").first()).n;
    const total_skatecard_sales = (await db.prepare("SELECT COUNT(*) AS n FROM skate_card_sales").first()).n;

    const total_revenue = (await db.prepare(`
      SELECT 
        COALESCE(SUM(price_cents),0) 
      FROM (
        SELECT price_cents FROM tickets
        UNION ALL
        SELECT price_cents FROM merch_orders
        UNION ALL
        SELECT price_cents FROM skate_card_sales
      )
    `).first())["COALESCE(SUM(price_cents),0)"];

    /* ------------------------------
       RECENT ACTIVITY
    ------------------------------ */
    const recent_users = (await db.prepare(`
      SELECT id, email, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 10
    `).all()).results;

    const recent_reports = (await db.prepare(`
      SELECT r.*, u.email AS reporter_email
      FROM feed_reports r
      LEFT JOIN users u ON u.id = r.reporter_id
      ORDER BY r.created_at DESC
      LIMIT 10
    `).all()).results;

    const recent_errors = (await db.prepare(`
      SELECT *
      FROM error_logs
      ORDER BY created_at DESC
      LIMIT 10
    `).all()).results;

    /* ------------------------------
       ANALYTICS CHIPS (YouTube style)
    ------------------------------ */
    const analytics_chips = [
      { label: "Users", value: total_users, link: "/owner/users" },
      { label: "Skaters", value: total_skaters, link: "/owner/skaters" },
      { label: "Businesses", value: total_businesses, link: "/owner/businesses" },
      { label: "Musicians", value: total_musicians, link: "/owner/musicians" },
      { label: "Buyers", value: total_buyers, link: "/owner/buyers" },
      { label: "Shows", value: total_shows, link: "/owner/shows" },
      { label: "Tickets", value: total_tickets, link: "/owner/tickets" },
      { label: "Merch Orders", value: total_merch_orders, link: "/owner/merch" },
      { label: "Skatecard Sales", value: total_skatecard_sales, link: "/owner/skatecards" },
      { label: "Revenue", value: total_revenue / 100, link: "/owner/revenue" }
    ];

    /* ------------------------------
       GHOST BUTTON SECTIONS
    ------------------------------ */
    const ghost_buttons = [
      { label: "Users", icon: "users", link: "/owner/users" },
      { label: "Skaters", icon: "skate", link: "/owner/skaters" },
      { label: "Businesses", icon: "briefcase", link: "/owner/businesses" },
      { label: "Musicians", icon: "music", link: "/owner/musicians" },
      { label: "Shows", icon: "ticket", link: "/owner/shows" },
      { label: "Contracts", icon: "file", link: "/owner/contracts" },
      { label: "Reports", icon: "flag", link: "/owner/reports" },
      { label: "Errors", icon: "alert", link: "/owner/errors" },
      { label: "Webhooks", icon: "link", link: "/owner/webhooks" },
      { label: "Branding", icon: "palette", link: "/owner/branding" },
      { label: "Notes", icon: "note", link: "/owner/notes" },
      { label: "Sponsorships", icon: "star", link: "/owner/sponsorships" }
    ];

    /* ------------------------------
       BURGER MENU (ALL DASHBOARDS)
    ------------------------------ */
    const burger_menu = [
      { label: "Owner Dashboard", link: "/owner" },
      { label: "Skater Dashboard", link: "/skater" },
      { label: "Business Dashboard", link: "/business" },
      { label: "Musician Dashboard", link: "/musician" },
      { label: "Buyer Dashboard", link: "/buyer" },
      { label: "Admin Tools", link: "/admin" }
    ];

    /* ------------------------------
       FINAL STRUCTURED RESPONSE
    ------------------------------ */
    return apiJson({
      layout: "owner_dashboard",
      analytics_chips,
      ghost_buttons,
      burger_menu,
      recent_users,
      recent_reports,
      recent_errors
    });
  });
}
