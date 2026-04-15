// worker.js — MODULE WORKER (auth removed; profile/dashboard handlers only)
// ----------------------------------------------------------------------
// - Auth (signup/login/hash/verify) is handled by a separate auth-worker.
// - This worker exposes role-protected APIs and profile endpoints.
// - Handlers return plain objects; requireRole wraps them into JSON Responses.

import { cors, apiJson, requireRole } from "./users.js";

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
  businessScanTicket,
  createBusinessProfile
} from "./business.js";

import {
  musicianDashboard,
  uploadTrack,
  listMusic,
  licenseTrack,
  musicianCreateOffer,
  listMusicianOffers,
  createMusicianProfile
} from "./musicians.js";

import { ownerDashboard } from "./routes/owner.js";

/* ---------------------------
   Utilities
   --------------------------- */
function withCORS(response) {
  const headers = cors();
  for (const [k, v] of Object.entries(headers)) {
    response.headers.set(k, v);
  }
  return response;
}

function normalizePath(path) {
  if (!path) return "/";
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

/* ---------------------------
   Module worker entrypoint
   --------------------------- */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const rawPath = url.pathname;
    const path = normalizePath(rawPath);
    const method = (request.method || "GET").toUpperCase();

    // CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors() });
    }

    try {
      // Initialize domain APIs (factories return available handlers)
      const Skaters = makeSkatersApi ? makeSkatersApi(env.DB_roll) : {};
      // Business and musician profile helpers are imported above

      /* ---------------------------
         SKATER ROUTES (profile + dashboard)
         - Signup/login removed; profile creation is idempotent and requires auth
         --------------------------- */
      if (path === "/api/profiles/skater" && method === "POST") {
        return withCORS(
          await requireRole(request.clone(), env, ["skater"], async (req, envInner, user) => {
            if (typeof Skaters.createSkaterProfile === "function") {
              return Skaters.createSkaterProfile(req, envInner, user);
            }
            return { success: false, message: "Skater profile endpoint not implemented" };
          })
        );
      }

      if (path === "/api/skater/dashboard" && method === "GET") {
        return withCORS(
          await requireRole(request.clone(), env, ["skater"], async (req, envInner, user) => {
            if (typeof Skaters.skaterDashboard === "function") {
              return Skaters.skaterDashboard(req, envInner, user);
            }
            return { success: false, message: "Skater dashboard not implemented" };
          })
        );
      }

      /* ---------------------------
         MUSICIAN ROUTES (profile + dashboard)
         --------------------------- */
      if (path === "/api/profiles/musician" && method === "POST") {
        return withCORS(
          await requireRole(request.clone(), env, ["musician"], async (req, envInner, user) => {
            if (typeof createMusicianProfile === "function") {
              return createMusicianProfile(req, envInner, user);
            }
            return { success: false, message: "Musician profile endpoint not implemented" };
          })
        );
      }

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

      /* ---------------------------
         BUSINESS ROUTES (profile + dashboard + submissions)
         --------------------------- */
      if (path === "/api/profiles/business" && method === "POST") {
        return withCORS(
          await requireRole(request.clone(), env, ["business"], async (req, envInner, user) => {
            if (typeof createBusinessProfile === "function") {
              return createBusinessProfile(req, envInner, user);
            }
            return { success: false, message: "Business profile endpoint not implemented" };
          })
        );
      }

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

      /* Staff management */
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

      /* ---------------------------
         BUYER ROUTES
         --------------------------- */
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
        // partner webhook may be unauthenticated depending on integration
        return withCORS(await partnerWebhook(request.clone(), env));
      }

      if (path === "/api/buyer/checkin" && method === "POST") {
        return withCORS(await requireRole(request.clone(), env, ["buyer"], checkInTicket));
      }

      /* ---------------------------
         OWNER ROUTES
         --------------------------- */
      if (path === "/api/owner/dashboard" && method === "GET") {
        return withCORS(await requireRole(request.clone(), env, ["owner"], ownerDashboard));
      }

      /* ---------------------------
         LEGAL ACCEPTANCE (idempotent)
         --------------------------- */
      if (path === "/api/legal/accept" && method === "POST") {
        return withCORS(
          await requireRole(request.clone(), env, ["buyer", "skater", "musician", "business", "staff", "owner"], async (req, envInner, user) => {
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

      /* ---------------------------
         Fallback
         --------------------------- */
      return withCORS(apiJson({ success: false, message: "Not found" }, 404));
    } catch (err) {
      console.error("Worker fetch error:", String(err));
      return withCORS(apiJson({ success: false, message: "Server error", detail: String(err) }, 500));
    }
  }
};
