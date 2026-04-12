// routes/owner.js — FINAL PBKDF2-CLEAN OWNER DASHBOARD
import { apiJson, requireRole } from "../users.js";

export async function ownerDashboard(request, env) {
  return requireRole(request, env, ["owner"], async () => {
    const db = env.DB_roll;

    /* ------------------------------
       SAFE COUNT HELPERS
    ------------------------------ */
    async function count(table) {
      const row = await db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).first();
      return row?.n || 0;
    }

    /* ------------------------------
       HIGH-LEVEL COUNTS
    ------------------------------ */
    const total_users = await count("users");
    const total_skaters = await count("skater_profiles");
    const total_businesses = await count("business_profiles");
    const total_musicians = await count("musician_profiles");
    const total_buyers = await count("buyer_profiles");

    const total_shows = await count("shows");
    const total_tickets = await count("tickets");
    const total_merch_orders = await count("merch_orders");
    const total_skatecard_sales = await count("skate_card_sales");

    /* ------------------------------
       TOTAL REVENUE (SAFE)
    ------------------------------ */
    const revenueRow = await db.prepare(`
      SELECT COALESCE(SUM(price_cents), 0) AS total
      FROM (
        SELECT price_cents FROM tickets
        UNION ALL
        SELECT price_cents FROM merch_orders
        UNION ALL
        SELECT price_cents FROM skate_card_sales
      )
    `).first();

    const total_revenue = revenueRow?.total || 0;

    /* ------------------------------
       RECENT ACTIVITY
    ------------------------------ */
    const recent_users = (
      await db.prepare(`
        SELECT id, email, role, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 10
      `).all()
    ).results || [];

    const recent_reports = (
      await db.prepare(`
        SELECT r.*, u.email AS reporter_email
        FROM feed_reports r
        LEFT JOIN users u ON u.id = r.reporter_id
        ORDER BY r.created_at DESC
        LIMIT 10
      `).all()
    ).results || [];

    const recent_errors = (
      await db.prepare(`
        SELECT *
        FROM error_logs
        ORDER BY created_at DESC
        LIMIT 10
      `).all()
    ).results || [];

    /* ------------------------------
       ANALYTICS CHIPS
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
       GHOST BUTTONS
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
       BURGER MENU
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
       FINAL RESPONSE
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
