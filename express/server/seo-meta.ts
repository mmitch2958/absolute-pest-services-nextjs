/**
 * SEO Meta Injection — Server-Side Route Map
 *
 * Since APS is a Vite/React SPA, Googlebot sees only the generic index.html
 * <title> and <meta name="description"> — not the per-page values set by
 * react-helmet-async (which runs client-side only).
 *
 * This module provides:
 *  1. A complete route → { title, description, canonical } lookup map for every SEO-critical URL
 *  2. An injectSeoMeta() function that rewrites index.html before sending it
 *     to any crawler or browser, so the correct tags appear in raw HTML source.
 *
 * Used by server/vite.ts serveStatic() and setupVite() to intercept all requests.
 */

const BASE_URL = "https://absolutepestservices.com";

interface PageMeta {
  title: string;
  description: string;
  canonical?: string;
  h1?: string;
}

/** Canonical default (homepage / fallback) */
const DEFAULT_META: PageMeta = {
  title: "Pest Control PA & DE | Absolute Pest Services",
  description:
    "Licensed pest control in Chester County PA, Delaware County PA & New Castle County DE. Wildlife removal, termite treatment, bed bug control & bat removal. Call 484-643-2225.",
  canonical: BASE_URL + "/",
  h1: "Professional Pest Control in PA & Delaware",
};

/**
 * Route meta map.
 * Keys are pathname strings (no trailing slash normalization needed — we
 * normalise in the lookup function below).
 */
const ROUTE_META: Record<string, PageMeta> = {
  // ── Homepage ──────────────────────────────────────────────────────────────
  "/": { ...DEFAULT_META },

  // ── Static / service pages ────────────────────────────────────────────────
  "/termites": {
    title: "Termite Treatment Chester County PA | Absolute Pest",
    description:
      "Licensed termite exterminators in Chester County, PA. Serving West Chester, Kennett Square, Malvern & all of Chester County. Protect your home — call 484-643-2225.",
    canonical: BASE_URL + "/termites",
    h1: "Termite Treatment in Chester County, PA",
  },
  "/bed-bugs": {
    title: "Bed Bug Exterminator Chester County PA | Absolute Pest",
    description:
      "Professional bed bug exterminator in Chester County, PA. Heat & chemical treatment options. Same-day service available. Licensed & insured. Call 484-643-2225.",
    canonical: BASE_URL + "/bed-bugs",
    h1: "Bed Bug Exterminator in Chester County, PA",
  },
  "/rodents": {
    title: "Mouse & Rat Exterminator Chester County PA | Absolute Pest",
    description:
      "Professional rodent control in Chester County, PA. Mouse & rat extermination, exclusion & prevention. Serving West Chester, Kennett Square & all Chester County. Call 484-643-2225.",
    canonical: BASE_URL + "/rodents",
    h1: "Mouse & Rat Exterminator in Chester County, PA",
  },
  "/wildlife": {
    title: "Wildlife Removal Chester County PA | Absolute Pest Services",
    description:
      "Humane wildlife removal in Chester County, PA. Expert raccoon removal, squirrel control, groundhog removal & more. Licensed PA wildlife operators. Call 484-643-2225.",
    canonical: BASE_URL + "/wildlife",
    h1: "Wildlife Removal in Chester County, PA",
  },
  "/wildlife-control": {
    title: "Wildlife Control Services | Absolute Pest Services PA & DE",
    description:
      "Humane wildlife control in PA & DE. Expert removal of raccoons, squirrels, groundhogs, skunks & more. Licensed wildlife control operators. Call 484-643-2225.",
    canonical: BASE_URL + "/wildlife-control",
  },
  "/bed-bug-treatment": {
    title: "Bed Bug Treatment | Absolute Pest Services PA & DE",
    description:
      "Professional bed bug treatment in PA & DE. Heat & chemical treatments available. Same-day service. Call 484-643-2225.",
    canonical: BASE_URL + "/bed-bug-treatment",
  },
  "/termite-treatment": {
    title: "Termite Treatment | Absolute Pest Services PA & DE",
    description:
      "Expert termite inspection and treatment in PA & DE. Protect your home from termite damage. Call 484-643-2225.",
    canonical: BASE_URL + "/termite-treatment",
  },
  "/bat-removal": {
    title: "Bat Removal Services | Absolute Pest Services PA & DE",
    description:
      "Safe, humane bat removal in PA & DE. Licensed & insured. We handle bat exclusion, guano cleanup & prevention. Call 484-643-2225.",
    canonical: BASE_URL + "/bat-removal",
  },
  "/request-service": {
    title: "Request Pest Control Service | Absolute Pest Services PA & DE",
    description:
      "Request pest control service from Absolute Pest Services. Serving PA & DE. Same-day service available. Call 484-643-2225.",
    canonical: BASE_URL + "/request-service",
  },
  "/blog": {
    title: "Pest Control Tips & News | Absolute Pest Services Blog",
    description:
      "Pest control tips, seasonal alerts, and expert advice from the team at Absolute Pest Services. Serving Chester County, PA and surrounding areas.",
    canonical: BASE_URL + "/blog",
  },
  // ── Service area index ────────────────────────────────────────────────────
  "/service-areas": {
    title: "Pest Control Service Areas PA & DE | Absolute Pest Services",
    description:
      "Absolute Pest Services covers Chester County, Delaware County, Montgomery County PA and New Castle County DE. Licensed & insured. Find your city and schedule service today.",
    canonical: BASE_URL + "/service-areas",
    h1: "Pest Control Service Areas in PA & Delaware",
  },

  // ── County-level service area pages ──────────────────────────────────────
  "/service-areas/chester-county-pa": {
    title: "Chester County PA Pest Control | Absolute Pest Services",
    description:
      "Expert pest control in Chester County, PA — West Grove, Kennett Square, Oxford, Avondale & more. Licensed, insured, 5-star rated. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/chester-county-pa",
    h1: "Pest Control Services in Chester County, PA",
  },
  "/service-areas/delaware-county-pa": {
    title: "Delaware County PA Pest Control | Absolute Pest Services",
    description:
      "Expert pest control in Delaware County, PA — Media, Newtown Square, Chester, Aston & more. Licensed, insured, 24/7 emergency service. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/delaware-county-pa",
    h1: "Pest Control Services in Delaware County, PA",
  },
  "/service-areas/new-castle-county-de": {
    title: "New Castle County DE Pest Control | Absolute Pest Services",
    description:
      "Expert pest control in New Castle County, DE — Hockessin, Newark, Wilmington & more. Licensed, insured, 24/7 emergency service. Call 302-235-1975.",
    canonical: BASE_URL + "/service-areas/new-castle-county-de",
    h1: "Pest Control Services in New Castle County, DE",
  },
  "/service-areas/montgomery-county-pa": {
    title: "Montgomery County PA Pest Control | Absolute Pest Services",
    description:
      "Expert pest control in Montgomery County, PA — Norristown, King of Prussia, Collegeville, Pottstown & more. Licensed, insured. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/montgomery-county-pa",
    h1: "Pest Control Services in Montgomery County, PA",
  },

  // ── City-level service area pages — Pennsylvania ─────────────────────────
  "/service-areas/avondale-pa": {
    title: "Avondale PA Pest Control Services | Absolute Pest Services",
    description:
      "Avondale, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/avondale-pa",
  },
  "/service-areas/chadds-ford-pa": {
    title: "Chadds Ford PA Pest Control | Absolute Pest Services",
    description:
      "Chadds Ford, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/chadds-ford-pa",
  },
  "/service-areas/coatesville-pa": {
    title: "Coatesville PA Pest Control | Absolute Pest Services",
    description:
      "Coatesville, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/coatesville-pa",
  },
  "/service-areas/cochranville-pa": {
    title: "Cochranville PA Pest Control | Absolute Pest Services",
    description:
      "Cochranville, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/cochranville-pa",
  },
  "/service-areas/collegeville-pa": {
    title: "Collegeville PA Pest Control | Absolute Pest Services",
    description:
      "Collegeville PA pest control: wildlife removal, termite treatment, and rodent control near Ursinus College and Perkiomen Creek. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/collegeville-pa",
  },
  "/service-areas/downingtown-pa": {
    title: "Downingtown PA Pest Control | Absolute Pest Services",
    description:
      "Downingtown PA pest control: wildlife removal, termite treatment, bed bug control near Marsh Creek State Park and East Brandywine. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/downingtown-pa",
  },
  "/service-areas/exton-pa": {
    title: "Exton PA Pest Control | Absolute Pest Services",
    description:
      "Exton PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination near the PA Turnpike. Serving Exton, Lionville & Uwchlan. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/exton-pa",
  },
  "/service-areas/glen-mills-pa": {
    title: "Glen Mills PA Pest Control Services | Absolute Pest Services",
    description:
      "Glen Mills, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/glen-mills-pa",
  },
  "/service-areas/kennett-square-pa": {
    title: "Kennett Square PA Pest Control | Absolute Pest Services",
    description:
      "Kennett Square, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/kennett-square-pa",
  },
  "/service-areas/king-of-prussia-pa": {
    title: "King of Prussia PA Pest Control | Absolute Pest Services",
    description:
      "King of Prussia PA pest control: commercial and residential wildlife removal, termite treatment, and rodent control near Valley Forge. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/king-of-prussia-pa",
  },
  "/service-areas/landenberg-pa": {
    title: "Landenberg PA Pest Control Services | Absolute Pest Services",
    description:
      "Landenberg, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/landenberg-pa",
  },
  "/service-areas/lincoln-university-pa": {
    title: "Lincoln University PA Pest Control | Absolute Pest Services",
    description:
      "Lincoln University, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/lincoln-university-pa",
  },
  "/service-areas/malvern-pa": {
    title: "Malvern PA Pest Control Services | Absolute Pest Services",
    description:
      "Malvern PA pest control: wildlife removal, termite treatment, bed bug control along the Paoli Pike corridor. Serving Malvern, Frazer, and Great Valley. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/malvern-pa",
  },
  "/service-areas/norristown-pa": {
    title: "Norristown PA Pest Control Services | Absolute Pest",
    description:
      "Norristown PA pest control: rodent control, wildlife removal & termite treatment in Montgomery County. Trusted local experts. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/norristown-pa",
  },
  "/service-areas/oxford-pa": {
    title: "Oxford PA Pest Control Services | Absolute Pest Services",
    description:
      "Oxford, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/oxford-pa",
  },
  "/service-areas/pottstown-pa": {
    title: "Pottstown PA Pest Control Services | Absolute Pest Services",
    description:
      "Pottstown PA pest control: rodent control, wildlife removal, and termite treatment in Montgomery County's industrial heritage corridor. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/pottstown-pa",
  },
  "/service-areas/west-chester-pa": {
    title: "West Chester PA Pest Control | Absolute Pest Services",
    description:
      "West Chester PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving West Chester Borough & surrounding townships. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/west-chester-pa",
  },
  "/service-areas/west-grove-pa": {
    title: "West Grove PA Pest Control Services | Absolute Pest Services",
    description:
      "West Grove, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/west-grove-pa",
  },

  // ── City-level service area pages — Delaware ─────────────────────────────
  "/service-areas/hockessin-de": {
    title: "Hockessin DE Pest Control Services | Absolute Pest Services",
    description:
      "Hockessin DE pest control: wildlife removal, termite treatment, and rodent control in heavily wooded Northern Delaware. Serving Kennett Pike corridor. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/hockessin-de",
  },
  "/service-areas/newark-de": {
    title: "Newark DE Pest Control Services | Absolute Pest Services",
    description:
      "Newark DE pest control: bed bug treatment, wildlife removal & termite control near the University of Delaware. Serving New Castle County. Call 302-235-1975.",
    canonical: BASE_URL + "/service-areas/newark-de",
  },
  "/service-areas/wilmington-de": {
    title: "Wilmington DE Pest Control Services | Absolute Pest Services",
    description:
      "Wilmington DE pest control: rodent control, wildlife removal, termite treatment near the Brandywine River. Delaware's largest city pest experts. Call 484-643-2225.",
    canonical: BASE_URL + "/service-areas/wilmington-de",
  },

  // ── City Services — General Pest Control (15 cities) ─────────────────────
  "/city-services/pest-control-avondale-pa": {
    title: "Pest Control in Avondale, PA | Absolute Pest Services",
    description:
      "Expert pest control in Avondale, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/pest-control-avondale-pa",
  },
  "/city-services/pest-control-chadds-ford-pa": {
    title: "Pest Control in Chadds Ford, PA | Absolute Pest Services",
    description:
      "Expert pest control in Chadds Ford, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/pest-control-chadds-ford-pa",
  },
  "/city-services/pest-control-coatesville-pa": {
    title: "Pest Control in Coatesville, PA | Absolute Pest Services",
    description:
      "Expert pest control in Coatesville, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/pest-control-coatesville-pa",
  },
  "/city-services/pest-control-cochranville-pa": {
    title: "Pest Control in Cochranville, PA | Absolute Pest Services",
    description:
      "Expert pest control in Cochranville, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/pest-control-cochranville-pa",
  },
  "/city-services/pest-control-downingtown-pa": {
    title: "Pest Control in Downingtown, PA | Absolute Pest Services",
    description:
      "Expert pest control in Downingtown, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/pest-control-downingtown-pa",
  },
  "/city-services/pest-control-exton-pa": {
    title: "Pest Control in Exton, PA | Absolute Pest Services",
    description:
      "Expert pest control in Exton, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/pest-control-exton-pa",
  },
  "/city-services/pest-control-glen-mills-pa": {
    title: "Pest Control in Glen Mills, PA | Absolute Pest Services",
    description:
      "Expert pest control in Glen Mills, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/pest-control-glen-mills-pa",
  },
  "/city-services/pest-control-hockessin-de": {
    title: "Pest Control in Hockessin, DE | Absolute Pest Services",
    description:
      "Expert pest control in Hockessin, DE. Licensed & insured. Serving New Castle County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/pest-control-hockessin-de",
  },
  "/city-services/pest-control-kennett-square-pa": {
    title: "Pest Control in Kennett Square, PA | Absolute Pest Services",
    description:
      "Expert pest control in Kennett Square, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/pest-control-kennett-square-pa",
  },
  "/city-services/pest-control-landenberg-pa": {
    title: "Pest Control in Landenberg, PA | Absolute Pest Services",
    description:
      "Expert pest control in Landenberg, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/pest-control-landenberg-pa",
  },
  "/city-services/pest-control-lincoln-university-pa": {
    title: "Pest Control in Lincoln University, PA | Absolute Pest Services",
    description:
      "Expert pest control in Lincoln University, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/pest-control-lincoln-university-pa",
  },
  "/city-services/pest-control-newark-de": {
    title: "Pest Control in Newark, DE | Absolute Pest Services",
    description:
      "Expert pest control in Newark, DE. Licensed & insured. Serving New Castle County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/pest-control-newark-de",
  },
  "/city-services/pest-control-oxford-pa": {
    title: "Pest Control in Oxford, PA | Absolute Pest Services",
    description:
      "Expert pest control in Oxford, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/pest-control-oxford-pa",
  },
  "/city-services/pest-control-west-grove-pa": {
    title: "Pest Control in West Grove, PA | Absolute Pest Services",
    description:
      "Expert pest control in West Grove, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/pest-control-west-grove-pa",
  },
  "/city-services/pest-control-wilmington-de": {
    title: "Pest Control in Wilmington, DE | Absolute Pest Services",
    description:
      "Expert pest control in Wilmington, DE. Licensed & insured. Serving New Castle County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/pest-control-wilmington-de",
  },

  // ── City Services — Termite Control (15 cities) ───────────────────────────
  "/city-services/termite-control-avondale-pa": {
    title: "Termite Control in Avondale, PA | Absolute Pest Services",
    description:
      "Expert termite control in Avondale, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/termite-control-avondale-pa",
  },
  "/city-services/termite-control-chadds-ford-pa": {
    title: "Termite Control in Chadds Ford, PA | Absolute Pest Services",
    description:
      "Expert termite control in Chadds Ford, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/termite-control-chadds-ford-pa",
  },
  "/city-services/termite-control-coatesville-pa": {
    title: "Termite Control in Coatesville, PA | Absolute Pest Services",
    description:
      "Expert termite control in Coatesville, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/termite-control-coatesville-pa",
  },
  "/city-services/termite-control-cochranville-pa": {
    title: "Termite Control in Cochranville, PA | Absolute Pest Services",
    description:
      "Expert termite control in Cochranville, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/termite-control-cochranville-pa",
  },
  "/city-services/termite-control-downingtown-pa": {
    title: "Termite Control in Downingtown, PA | Absolute Pest Services",
    description:
      "Expert termite control in Downingtown, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/termite-control-downingtown-pa",
  },
  "/city-services/termite-control-exton-pa": {
    title: "Termite Control in Exton, PA | Absolute Pest Services",
    description:
      "Expert termite control in Exton, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/termite-control-exton-pa",
  },
  "/city-services/termite-control-glen-mills-pa": {
    title: "Termite Control in Glen Mills, PA | Absolute Pest Services",
    description:
      "Expert termite control in Glen Mills, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/termite-control-glen-mills-pa",
  },
  "/city-services/termite-control-hockessin-de": {
    title: "Termite Control in Hockessin, DE | Absolute Pest Services",
    description:
      "Expert termite control in Hockessin, DE. Licensed & insured. Serving New Castle County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/termite-control-hockessin-de",
  },
  "/city-services/termite-control-kennett-square-pa": {
    title: "Termite Control in Kennett Square, PA | Absolute Pest Services",
    description:
      "Expert termite control in Kennett Square, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/termite-control-kennett-square-pa",
  },
  "/city-services/termite-control-landenberg-pa": {
    title: "Termite Control in Landenberg, PA | Absolute Pest Services",
    description:
      "Expert termite control in Landenberg, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/termite-control-landenberg-pa",
  },
  "/city-services/termite-control-lincoln-university-pa": {
    title: "Termite Control in Lincoln University, PA | Absolute Pest Services",
    description:
      "Expert termite control in Lincoln University, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/termite-control-lincoln-university-pa",
  },
  "/city-services/termite-control-newark-de": {
    title: "Termite Control in Newark, DE | Absolute Pest Services",
    description:
      "Expert termite control in Newark, DE. Licensed & insured. Serving New Castle County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/termite-control-newark-de",
  },
  "/city-services/termite-control-oxford-pa": {
    title: "Termite Control in Oxford, PA | Absolute Pest Services",
    description:
      "Expert termite control in Oxford, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/termite-control-oxford-pa",
  },
  "/city-services/termite-control-west-grove-pa": {
    title: "Termite Control in West Grove, PA | Absolute Pest Services",
    description:
      "Expert termite control in West Grove, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/termite-control-west-grove-pa",
  },
  "/city-services/termite-control-wilmington-de": {
    title: "Termite Control in Wilmington, DE | Absolute Pest Services",
    description:
      "Expert termite control in Wilmington, DE. Licensed & insured. Serving New Castle County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/termite-control-wilmington-de",
  },

  // ── City Services — Wildlife Control (15 cities) ─────────────────────────
  "/city-services/wildlife-control-avondale-pa": {
    title: "Wildlife Control in Avondale, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Avondale, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/wildlife-control-avondale-pa",
  },
  "/city-services/wildlife-control-chadds-ford-pa": {
    title: "Wildlife Control in Chadds Ford, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Chadds Ford, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/wildlife-control-chadds-ford-pa",
  },
  "/city-services/wildlife-control-coatesville-pa": {
    title: "Wildlife Control in Coatesville, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Coatesville, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/wildlife-control-coatesville-pa",
  },
  "/city-services/wildlife-control-cochranville-pa": {
    title: "Wildlife Control in Cochranville, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Cochranville, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/wildlife-control-cochranville-pa",
  },
  "/city-services/wildlife-control-downingtown-pa": {
    title: "Wildlife Control in Downingtown, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Downingtown, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/wildlife-control-downingtown-pa",
  },
  "/city-services/wildlife-control-exton-pa": {
    title: "Wildlife Control in Exton, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Exton, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/wildlife-control-exton-pa",
  },
  "/city-services/wildlife-control-glen-mills-pa": {
    title: "Wildlife Control in Glen Mills, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Glen Mills, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/wildlife-control-glen-mills-pa",
  },
  "/city-services/wildlife-control-hockessin-de": {
    title: "Wildlife Control in Hockessin, DE | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Hockessin, DE. Licensed & insured. Serving New Castle County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/wildlife-control-hockessin-de",
  },
  "/city-services/wildlife-control-kennett-square-pa": {
    title: "Wildlife Control in Kennett Square, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Kennett Square, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/wildlife-control-kennett-square-pa",
  },
  "/city-services/wildlife-control-landenberg-pa": {
    title: "Wildlife Control in Landenberg, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Landenberg, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/wildlife-control-landenberg-pa",
  },
  "/city-services/wildlife-control-lincoln-university-pa": {
    title: "Wildlife Control in Lincoln University, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Lincoln University, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/wildlife-control-lincoln-university-pa",
  },
  "/city-services/wildlife-control-newark-de": {
    title: "Wildlife Control in Newark, DE | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Newark, DE. Licensed & insured. Serving New Castle County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/wildlife-control-newark-de",
  },
  "/city-services/wildlife-control-oxford-pa": {
    title: "Wildlife Control in Oxford, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Oxford, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/wildlife-control-oxford-pa",
  },
  "/city-services/wildlife-control-west-grove-pa": {
    title: "Wildlife Control in West Grove, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in West Grove, PA. Licensed & insured. Serving Chester County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/wildlife-control-west-grove-pa",
  },
  "/city-services/wildlife-control-wilmington-de": {
    title: "Wildlife Control in Wilmington, DE | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Wilmington, DE. Licensed & insured. Serving New Castle County. Call 484-643-2225 for fast service.",
    canonical: BASE_URL + "/city-services/wildlife-control-wilmington-de",
  },

  // ── City Services — Ant & Wasp Control (15 cities) ───────────────────────
  "/city-services/ant-wasp-control-avondale-pa": {
    title: "Ant & Wasp Control in Avondale, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Avondale, PA. Licensed & insured. Serving Chester County. Call 484-643-2225.",
    canonical: BASE_URL + "/city-services/ant-wasp-control-avondale-pa",
  },
  "/city-services/ant-wasp-control-chadds-ford-pa": {
    title: "Ant & Wasp Control in Chadds Ford, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Chadds Ford, PA. Licensed & insured. Serving Chester County. Call 484-643-2225.",
    canonical: BASE_URL + "/city-services/ant-wasp-control-chadds-ford-pa",
  },
  "/city-services/ant-wasp-control-coatesville-pa": {
    title: "Ant & Wasp Control in Coatesville, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Coatesville, PA. Licensed & insured. Serving Chester County. Call 484-643-2225.",
    canonical: BASE_URL + "/city-services/ant-wasp-control-coatesville-pa",
  },
  "/city-services/ant-wasp-control-cochranville-pa": {
    title: "Ant & Wasp Control in Cochranville, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Cochranville, PA. Licensed & insured. Serving Chester County. Call 484-643-2225.",
    canonical: BASE_URL + "/city-services/ant-wasp-control-cochranville-pa",
  },
  "/city-services/ant-wasp-control-downingtown-pa": {
    title: "Ant & Wasp Control in Downingtown, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Downingtown, PA. Licensed & insured. Serving Chester County. Call 484-643-2225.",
    canonical: BASE_URL + "/city-services/ant-wasp-control-downingtown-pa",
  },
  "/city-services/ant-wasp-control-exton-pa": {
    title: "Ant & Wasp Control in Exton, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Exton, PA. Licensed & insured. Serving Chester County. Call 484-643-2225.",
    canonical: BASE_URL + "/city-services/ant-wasp-control-exton-pa",
  },
  "/city-services/ant-wasp-control-glen-mills-pa": {
    title: "Ant & Wasp Control in Glen Mills, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Glen Mills, PA. Licensed & insured. Serving Chester County. Call 484-643-2225.",
    canonical: BASE_URL + "/city-services/ant-wasp-control-glen-mills-pa",
  },
  "/city-services/ant-wasp-control-hockessin-de": {
    title: "Ant & Wasp Control in Hockessin, DE | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Hockessin, DE. Licensed & insured. Serving New Castle County. Call 484-643-2225.",
    canonical: BASE_URL + "/city-services/ant-wasp-control-hockessin-de",
  },
  "/city-services/ant-wasp-control-kennett-square-pa": {
    title: "Ant & Wasp Control in Kennett Square, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Kennett Square, PA. Licensed & insured. Serving Chester County. Call 484-643-2225.",
    canonical: BASE_URL + "/city-services/ant-wasp-control-kennett-square-pa",
  },
  "/city-services/ant-wasp-control-landenberg-pa": {
    title: "Ant & Wasp Control in Landenberg, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Landenberg, PA. Licensed & insured. Serving Chester County. Call 484-643-2225.",
    canonical: BASE_URL + "/city-services/ant-wasp-control-landenberg-pa",
  },
  "/city-services/ant-wasp-control-lincoln-university-pa": {
    title: "Ant & Wasp Control in Lincoln University, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Lincoln University, PA. Licensed & insured. Serving Chester County. Call 484-643-2225.",
    canonical: BASE_URL + "/city-services/ant-wasp-control-lincoln-university-pa",
  },
  "/city-services/ant-wasp-control-newark-de": {
    title: "Ant & Wasp Control in Newark, DE | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Newark, DE. Licensed & insured. Serving New Castle County. Call 484-643-2225.",
    canonical: BASE_URL + "/city-services/ant-wasp-control-newark-de",
  },
  "/city-services/ant-wasp-control-oxford-pa": {
    title: "Ant & Wasp Control in Oxford, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Oxford, PA. Licensed & insured. Serving Chester County. Call 484-643-2225.",
    canonical: BASE_URL + "/city-services/ant-wasp-control-oxford-pa",
  },
  "/city-services/ant-wasp-control-west-grove-pa": {
    title: "Ant & Wasp Control in West Grove, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in West Grove, PA. Licensed & insured. Serving Chester County. Call 484-643-2225.",
    canonical: BASE_URL + "/city-services/ant-wasp-control-west-grove-pa",
  },
  "/city-services/ant-wasp-control-wilmington-de": {
    title: "Ant & Wasp Control in Wilmington, DE | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Wilmington, DE. Licensed & insured. Serving New Castle County. Call 484-643-2225.",
    canonical: BASE_URL + "/city-services/ant-wasp-control-wilmington-de",
  },

  // ── Legal / Trust pages ────────────────────────────────────────────────────
  "/privacy-policy": {
    title: "Privacy Policy | Absolute Pest Services",
    description:
      "Privacy Policy for Absolute Pest Services. Learn how we collect, use, and protect your information when you contact us for pest control services in PA & DE.",
    canonical: BASE_URL + "/privacy-policy",
    h1: "Privacy Policy",
  },
  "/about": {
    title: "About Absolute Pest Services | Chester County PA",
    description:
      "Absolute Pest Services is a licensed, insured pest control company serving Chester County PA, Delaware County PA, Montgomery County PA, and New Castle County DE. 5-star rated.",
    canonical: BASE_URL + "/about",
    h1: "About Absolute Pest Services",
  },
  "/contact": {
    title: "Contact Absolute Pest Services | Call 484-643-2225",
    description:
      "Contact Absolute Pest Services for pest control in Chester County PA and Delaware. Call 484-643-2225, text, or request service online. 24/7 emergency service available.",
    canonical: BASE_URL + "/contact",
    h1: "Contact Absolute Pest Services",
  },
};

/**
 * Look up meta for a given request path.
 * Normalises trailing slashes for lookup (both with and without slash hit the same entry).
 */
export function getRouteMeta(pathname: string): PageMeta {
  // Normalise: remove trailing slash UNLESS it's root "/"
  const normalised =
    pathname === "/" ? "/" : pathname.replace(/\/+$/, "");

  // Direct lookup (no trailing slash)
  if (ROUTE_META[normalised]) return ROUTE_META[normalised];

  // Fallback for blog posts, admin, portal pages, etc. — use path as canonical
  return {
    ...DEFAULT_META,
    canonical: BASE_URL + normalised,
  };
}

/**
 * Escape HTML entities in strings we inject into HTML attributes/elements.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Inject the correct <title>, <meta name="description">, <link rel="canonical">,
 * og:title, og:description, og:url, twitter:title, twitter:description
 * into an HTML string.
 *
 * Returns the modified HTML string.
 */
export function injectSeoMeta(html: string, meta: PageMeta): string {
  const safeTitle = escapeHtml(meta.title);
  const safeDesc = escapeHtml(meta.description);
  const canonicalUrl = meta.canonical || BASE_URL + "/";

  let result = html;

  // Replace <title>
  result = result.replace(
    /<title>[^<]*<\/title>/,
    `<title>${safeTitle}</title>`
  );

  // Replace <meta name="description" content="...">
  result = result.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${safeDesc}" />`
  );

  // Replace <link rel="canonical" href="...">
  result = result.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  // Replace og:title
  result = result.replace(
    /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
    `$1${safeTitle}$2`
  );

  // Replace og:description
  result = result.replace(
    /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
    `$1${safeDesc}$2`
  );

  // Replace og:url
  result = result.replace(
    /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
    `$1${canonicalUrl}$2`
  );

  // Replace twitter:title
  result = result.replace(
    /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
    `$1${safeTitle}$2`
  );

  // Replace twitter:description
  result = result.replace(
    /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
    `$1${safeDesc}$2`
  );

  // Inject server-side H1 inside <div id="root"> so Google sees it
  // without JavaScript. React replaces inner content on mount so users
  // see the normal React UI. This is a valid SSR workaround for SPAs.
  if (meta.h1) {
    const safeH1 = escapeHtml(meta.h1);
    result = result.replace(
      /<div id="root"><\/div>/,
      `<div id="root"><h1>${safeH1}</h1></div>`
    );
  }

  return result;
}
