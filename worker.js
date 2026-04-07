// worker.js — CLEAN, MODERN, REAL ARCHITECTURE ONLY

import {
  cors,
  apiJson,
  requireRole,
  login as userLogin,
  signupBase
} from "./users.js";

import {
  signupBuyer,
  listTickets,
  createTicket,
  partnerWebhook,
  checkInTicket,
  buyerDashboard
} from "./buyers.js";

import { makeSkatersApi } from "./skaters.js";

import {
  signupBusiness,
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
  signupMusician,
  musicianDashboard,
  uploadTrack,
  listMusic,
  licenseTrack,
  musicianCreateOffer,
  listMusicianOffers
} from "./musicians.js";

import { ownerDashboard } from "./routes/owner.js";


// ============================================================
// MAIN ROUTER
// ============================================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors() });
    }

    // LOGIN
    if (path === "/api/login" && method === "POST") {
      return userLogin(request.clone(), env);
    }

    // SIGNUP
    if (path === "/api/buyer/signup" && method === "POST") {
      return signupBuyer(request.clone(), env);
    }

    if (path === "/api/skater/signup" && method === "POST") {
      return signupBase(request.clone(), env, "skater");
    }

    if (path === "/api/musician/signup" && method === "POST") {
      return signupMusician(request.clone(), env);
    }

    if (path === "/api/business/signup" && method === "POST") {
      return signupBusiness(request.clone(), env);
    }

    // INIT SKATER API
    const Skaters = makeSkatersApi(env.DB_users);

    // ============================================================
    // SKATER ROUTES
    // ============================================================

    if (path === "/api/skater/dashboard" && method === "GET") {
      return requireRole(request.clone(), env, ["skater"], async (req, envInner, user) =>
        Skaters.getSkaterProfile(user.id)
      );
    }

    if (path === "/api/skater/profile" && method === "PUT") {
      return requireRole(request.clone(), env, ["skater"], async (req, envInner, user) => {
        const body = await req.json();
        return Skaters.updateSkaterProfile(user.profile_id, body);
      });
    }

    if (path === "/api/skater/offerings" && method === "POST") {
      return requireRole(request.clone(), env, ["skater"], async (req, envInner, user) => {
        const body = await req.json();
        return Skaters.createSkaterOffering(user.profile_id, body);
      });
    }

    if (path === "/api/skater/offerings" && method === "GET") {
      return requireRole(request.clone(), env, ["skater"], async (req, envInner, user) =>
        Skaters.listSkaterOfferings(user.profile_id)
      );
    }

    if (path === "/api/skater/shows" && method === "POST") {
      return requireRole(request.clone(), env, ["skater"], async (req, envInner, user) => {
        const body = await req.json();
        return Skaters.createShowForSkaterOrGroup({
          host_type: "skater",
          host_id: user.profile_id,
          ...body
        });
      });
    }

    if (path === "/api/skater/shows" && method === "GET") {
      return requireRole(request.clone(), env, ["skater"], async (req, envInner, user) =>
        Skaters.listShowsForHost("skater", user.profile_id)
      );
    }

    // ============================================================
    // MUSICIAN ROUTES
    // ============================================================

    if (path === "/api/musician/dashboard" && method === "GET") {
      return requireRole(request.clone(), env, ["musician"], musicianDashboard);
    }

    if (path === "/api/musician/tracks" && method === "GET") {
      return requireRole(request.clone(), env, ["musician"], listMusic);
    }

    if (path === "/api/musician/tracks" && method === "POST") {
      return requireRole(request.clone(), env, ["musician"], uploadTrack);
    }

    if (path === "/api/musician/license" && method === "POST") {
      return requireRole(request.clone(), env, ["musician"], licenseTrack);
    }

    // ============================================================
    // BUSINESS ROUTES
    // ============================================================

    if (path === "/api/business/dashboard" && method === "GET") {
      return requireRole(request.clone(), env, ["business"], businessDashboard);
    }

    if (path === "/api/business/offers" && method === "POST") {
      return requireRole(request.clone(), env, ["business"], businessSubmitOffer);
    }

    if (path === "/api/business/events" && method === "POST") {
      return requireRole(request.clone(), env, ["business"], businessSubmitEvent);
    }

    if (path === "/api/business/ads" && method === "POST") {
      return requireRole(request.clone(), env, ["business"], businessSubmitAd);
    }

    if (path === "/api/business/staff" && method === "POST") {
      return requireRole(request.clone(), env, ["business"], businessAddStaff);
    }

    if (path === "/api/business/staff" && method === "DELETE") {
      return requireRole(request.clone(), env, ["business"], businessRemoveStaff);
    }

    if (path === "/api/business/staff" && method === "GET") {
      return requireRole(request.clone(), env, ["business"], businessListStaff);
    }

    if (path === "/api/business/scan-ticket" && method === "POST") {
      return requireRole(request.clone(), env, ["business"], businessScanTicket);
    }

    // ============================================================
    // BUYER ROUTES
    // ============================================================

    if (path === "/api/buyer/dashboard" && method === "GET") {
      return requireRole(request.clone(), env, ["buyer"], buyerDashboard);
    }

    if (path === "/api/buyer/tickets" && method === "GET") {
      return requireRole(request.clone(), env, ["buyer"], listTickets);
    }

    if (path === "/api/buyer/tickets" && method === "POST") {
      return requireRole(request.clone(), env, ["buyer"], createTicket);
    }

    if (path === "/api/buyer/partner-webhook" && method === "POST") {
      return partnerWebhook(request.clone(), env);
    }

    // ============================================================
    // OWNER ROUTES
    // ============================================================

    if (path === "/api/owner/dashboard" && method === "GET") {
      return requireRole(request.clone(), env, ["owner"], ownerDashboard);
    }

    // ============================================================
    // FALLBACK
    // ============================================================

    return apiJson({ message: "Not found" }, 404);
  }
};
