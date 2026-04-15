// worker.js — AUTH REMOVED (signup/login/proxy taken out)
// -------------------------------------------------------------------------

import {
  cors,
  apiJson,
  requireRole
} from "./users.js";

import {
  listTickets,
  createTicket,
  partnerWebhook,
  checkInTicket,
  buyerDashboard
} from "./buyers.js";

import { makeSkatersApi } from "./skaters.js";

import {
  businessDashboard,
  businessSubmitOffer,
  businessSubmitEvent,
  businessSubmitAd,
  businessSubmitVenue,
  businessSubmitSponsorship,
  businessSubmitAffiliate,
  businessSubmitDiscount,
  businessAddStaff,
  businessRemoveStaff,
  businessListStaff,
  businessScanTicket
} from "./business.js";

import {
  musicianDashboard,
  uploadTrack,
  listMusic,
  licenseTrack,
  musicianCreateOffer,
  listMusicianOffers
} from "./musicians.js";

import { ownerDashboard } from "./routes/owner.js";

// ============================================================
// CORS WRAPPER
// ============================================================
function withCORS(response) {
  const headers = cors();
  for (const [k, v] of Object.entries(headers)) {
    response.headers.set(k, v);
  }
  return response;
}

function normalizePath(path) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

// ============================================================
// MODULE WORKER ENTRYPOINT (AUTH HANDLED BY AUTH WORKER)
// ============================================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const rawPath = url.pathname;
    const path = normalizePath(rawPath);
    const method = request.method.toUpperCase();

    // CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors() });
    }

    try {
      // NOTE: auth (login/signup/hash/verify) has been removed from this worker.
      // Those endpoints should be served by the separate auth-worker.

      // Initialize Skaters API with DB binding
      const Skaters = makeSkatersApi(env.DB_roll);

      // SKATER ROUTES
      if (path === "/api/skater/dashboard" && method === "GET") {
        return withCORS(
          await requireRole(request.clone(), env, ["skater"], async (req, envInner, user) =>
            Skaters.getSkaterProfile(user.id)
          )
        );
      }

      if (path === "/api/skater/profile" && method === "PUT") {
        return withCORS(
          await requireRole(request.clone(), env, ["skater"], async (req, envInner, user) => {
            const body = await req.json();
            return Skaters.updateSkaterProfile(user.profile_id || user.id, body);
          })
        );
      }

      if (path === "/api/skater/offerings" && method === "POST") {
        return withCORS(
          await requireRole(request.clone(), env, ["skater"], async (req, envInner, user) => {
            const body = await req.json();
            return Skaters.createSkaterOffering(user.profile_id || user.id, body);
          })
        );
      }

      if (path === "/api/skater/offerings" && method === "GET") {
        return withCORS(
          await requireRole(request.clone(), env, ["skater"], async (req, envInner, user) =>
            Skaters.listSkaterOfferings(user.profile_id || user.id)
          )
        );
      }

      if (path === "/api/skater/shows" && method === "POST") {
        return withCORS(
          await requireRole(request.clone(), env, ["skater"], async (req, envInner, user) => {
            const body = await req.json();
            return Skaters.createShowForSkaterOrGroup({
              host_type: "skater",
              host_id: user.profile_id || user.id,
              ...body
            });
          })
        );
      }

      if (path === "/api/skater/shows" && method === "GET") {
        return withCORS(
          await requireRole(request.clone(), env, ["skater"], async (req, envInner, user) =>
            Skaters.listShowsForHost("skater", user.profile_id || user.id)
          )
        );
      }

      // MUSICIAN ROUTES
      if (path === "/api/musician/dashboard" && method === "GET") {
        return withCORS(await requireRole(request.clone(), env, ["musician"], musicianDashboard));
      }

      if (path === "/api/musician/tracks" && method === "GET") {
        return withCORS(await requireRole(request.clone(), env, ["musician"], listMusic));
      }

      if (path === "/api/musician/tracks" && method === "POST") {
        return withCORS(await requireRole(request.clone(), env, ["musician"], uploadTrack));
      }

      if (path === "/api/musician/license" && method === "POST") {
        return withCORS(await requireRole(request.clone(), env, ["musician"], licenseTrack));
      }

      // BUSINESS ROUTES
      if (path === "/api/business/dashboard" && method === "GET") {
        return withCORS(await requireRole(request.clone(), env, ["business"], businessDashboard));
      }

      if (path === "/api/business/offers" && method === "POST") {
        return withCORS(await requireRole(request.clone(), env, ["business"], businessSubmitOffer));
      }

      if (path === "/api/business/events" && method === "POST") {
        return withCORS(await requireRole(request.clone(), env, ["business"], businessSubmitEvent));
      }

      if (path === "/api/business/ads" && method === "POST") {
        return withCORS(await requireRole(request.clone(), env, ["business"], businessSubmitAd));
      }

      if (path === "/api/business/staff" && method === "POST") {
        return withCORS(await requireRole(request.clone(), env, ["business"], businessAddStaff));
      }

      if (path === "/api/business/staff" && method === "DELETE") {
        return withCORS(await requireRole(request.clone(), env, ["business"], businessRemoveStaff));
      }

      if (path === "/api/business/staff" && method === "GET") {
        return withCORS(await requireRole(request.clone(), env, ["business"], businessListStaff));
      }

      if (path === "/api/business/scan-ticket" && method === "POST") {
        return withCORS(await requireRole(request.clone(), env, ["business"], businessScanTicket));
      }

      if (path === "/api/business/venues" && method === "POST") {
        return withCORS(await requireRole(request.clone(), env, ["business"], businessSubmitVenue));
      }

      if (path === "/api/business/sponsorships" && method === "POST") {
        return withCORS(await requireRole(request.clone(), env, ["business"], businessSubmitSponsorship));
      }

      if (path === "/api/business/affiliates" && method === "POST") {
        return withCORS(await requireRole(request.clone(), env, ["business"], businessSubmitAffiliate));
      }

      if (path === "/api/business/discounts" && method === "POST") {
        return withCORS(await requireRole(request.clone(), env, ["business"], businessSubmitDiscount));
      }

      // BUYER ROUTES
      if (path === "/api/buyer/dashboard" && method === "GET") {
        return withCORS(await requireRole(request.clone(), env, ["buyer"], buyerDashboard));
      }

      if (path === "/api/buyer/tickets" && method === "GET") {
        return withCORS(await requireRole(request.clone(), env, ["buyer"], listTickets));
      }

      if (path === "/api/buyer/tickets" && method === "POST") {
        return withCORS(await requireRole(request.clone(), env, ["buyer"], createTicket));
      }

      if (path === "/api/buyer/partner-webhook" && method === "POST") {
        return withCORS(await partnerWebhook(request.clone(), env));
      }

      if (path === "/api/buyer/checkin" && method === "POST") {
        return withCORS(await requireRole(request.clone(), env, ["buyer"], checkInTicket));
      }

      // OWNER ROUTES
      if (path === "/api/owner/dashboard" && method === "GET") {
        return withCORS(await requireRole(request.clone(), env, ["owner"], ownerDashboard));
      }

      // NEW: LEGAL ACCEPTANCE ENDPOINT
      if (path === "/api/legal/accept" && method === "POST") {
        return withCORS(
          await requireRole(request.clone(), env, ["buyer","skater","musician","business","staff","owner"], async (req, envInner, user) => {
            const form = await req.formData();

            const agreement_type = form.get("agreement_type");
            const agreement_version = form.get("agreement_version");
            const role = form.get("role");

            if (!agreement_type || !agreement_version || !role) {
              return apiJson({ success: false, error: "Missing fields" }, 400);
            }

            try {
              await env.DB_roll.prepare(
                `INSERT OR IGNORE INTO legal_acceptances
                 (user_id, role, agreement_type, agreement_version, ip_address, user_agent)
                 VALUES (?, ?, ?, ?, ?, ?)`
              ).bind(
                user.id,
                role,
                agreement_type,
                agreement_version,
                req.headers.get("cf-connecting-ip") || null,
                req.headers.get("user-agent") || null
              ).run();

              return apiJson({ success: true });
            } catch (err) {
              return apiJson({ success: false, error: String(err) }, 500);
            }
          })
        );
      }

      // FALLBACK
      return withCORS(apiJson({ success: false, message: "Not found" }, 404));
    } catch (err) {
      console.error("Worker fetch error:", String(err));
      return withCORS(apiJson({ success: false, message: "Server error", detail: String(err) }, 500));
    }
  }
};
