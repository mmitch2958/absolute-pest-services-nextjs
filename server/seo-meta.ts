/**
 * SEO Meta Injection — Server-Side Route Map
 *
 * Since APS is a Vite/React SPA, Googlebot sees only the generic index.html
 * <title> and <meta name="description"> — not the per-page values set by
 * react-helmet-async (which runs client-side only).
 *
 * This module provides:
 *  1. A complete route → { title, description } lookup map for every SEO-critical URL
 *  2. An injectSeoMeta() function that rewrites index.html before sending it
 *     to any crawler or browser, so the correct tags appear in raw HTML source.
 *
 * Used by server/vite.ts serveStatic() and setupVite() to intercept all requests.
 */

interface PageMeta {
  title: string;
  description: string;
}

/** Canonical default (homepage / fallback) */
const DEFAULT_META: PageMeta = {
  title: "Absolute Pest Services - Professional Pest Control in PA, DE, MD",
  description:
    "Expert pest control in PA, DE & MD. Humane wildlife control, bed bug treatment, termite protection & bat removal. Licensed, insured & available 24/7. Call 484-643-2225.",
};

/**
 * Route meta map.
 * Keys are pathname strings (no trailing slash normalization needed — we
 * normalise in the lookup function below).
 */
const ROUTE_META: Record<string, PageMeta> = {
  // ── Homepage ──────────────────────────────────────────────────────────────
  "/": DEFAULT_META,

  // ── Static / service pages ────────────────────────────────────────────────
  "/termites": {
    title: "Termite Treatment Chester County PA | Free Inspection | Absolute Pest Services",
    description:
      "Expert termite treatment in Chester County, PA. Free termite inspection. Licensed termite exterminators serving West Chester, Kennett Square, Malvern & all of Chester County. Call 484-643-2225.",
  },
  "/bed-bugs": {
    title: "Bed Bug Exterminator Chester County PA | Heat Treatment | Absolute Pest Services",
    description:
      "Professional bed bug exterminator in Chester County, PA. Heat & chemical treatment options. Free bed bug inspection. Same-day service. Serving West Chester, Kennett Square, Malvern & all Chester County. Call 484-643-2225.",
  },
  "/rodents": {
    title: "Mouse Exterminator Chester County PA | Rat Control | Absolute Pest Services",
    description:
      "Professional mouse & rat exterminator in Chester County, PA. Rodent control, exclusion & prevention. Free inspection. Serving West Chester, Kennett Square, Malvern & all Chester County. Call 484-643-2225.",
  },
  "/wildlife": {
    title: "Wildlife Removal Chester County PA | Raccoon Removal | Absolute Pest Services",
    description:
      "Professional wildlife removal in Chester County, PA. Humane raccoon removal, squirrel removal, groundhog control & more. Licensed PA wildlife control. Free inspection. Call 484-643-2225.",
  },
  "/wildlife-control": {
    title: "Wildlife Control Services | Absolute Pest Services",
    description:
      "Humane wildlife control in PA, DE & MD. Expert removal of raccoons, squirrels, groundhogs, skunks & more. Licensed wildlife control operators. Call 484-643-2225.",
  },
  "/bed-bug-treatment": {
    title: "Bed Bug Treatment | Absolute Pest Services",
    description:
      "Professional bed bug treatment in PA, DE & MD. Heat & chemical treatments available. Free inspection. Same-day service. Call 484-643-2225.",
  },
  "/termite-treatment": {
    title: "Termite Treatment | Absolute Pest Services",
    description:
      "Expert termite inspection and treatment in PA, DE & MD. Protect your home from termite damage. Free inspection available. Call 484-643-2225.",
  },
  "/bat-removal": {
    title: "Bat Removal Services | Absolute Pest Services",
    description:
      "Safe, humane bat removal in PA, DE & MD. Licensed & insured. We handle bat exclusion, guano cleanup & prevention. Call 484-643-2225.",
  },
  "/request-service": {
    title: "Request Pest Control Service | Absolute Pest Services",
    description:
      "Request pest control service from Absolute Pest Services. Serving PA, DE & MD. Same-day service available. Call 484-643-2225.",
  },
  "/blog": {
    title: "Pest Control Tips & News | Absolute Pest Services Blog",
    description:
      "Pest control tips, seasonal alerts, and expert advice from the team at Absolute Pest Services. Serving Chester County, PA and surrounding areas.",
  },
  "/cost-calculator": {
    title: "Pest Control Cost Calculator | Absolute Pest Services",
    description:
      "Estimate your pest control costs with our free calculator. Get a quick quote for services in PA, DE & MD. Call 484-643-2225 to confirm pricing.",
  },

  // ── Service area index ────────────────────────────────────────────────────
  "/service-areas": {
    title: "Pest Control Service Areas | PA, DE, MD | Absolute Pest Services",
    description:
      "Absolute Pest Services covers Chester County, Delaware County, Montgomery County PA, New Castle County DE, and Northeast MD. Find your city and schedule service today.",
  },

  // ── County-level service area pages ──────────────────────────────────────
  "/service-areas/chester-county-pa": {
    title: "Chester County PA Pest Control Services | Absolute Pest Services",
    description:
      "Chester County PA: Expert pest control services in West Grove, Kennett Square, Oxford, Avondale. Licensed, insured, emergency service available. 5.0 star rated.",
  },
  "/service-areas/delaware-county-pa": {
    title: "Delaware County PA Pest Control Services | Absolute Pest Services",
    description:
      "Delaware County PA: Expert pest control in Media, Newtown Square, Chester, Aston, Brookhaven. Licensed, insured, emergency service available.",
  },
  "/service-areas/new-castle-county-de": {
    title: "New Castle County DE Pest Control Services | Absolute Pest Services",
    description:
      "New Castle County DE: Expert pest control in Hockessin, Newark, Wilmington, Bear. Licensed, insured, emergency service available.",
  },
  "/service-areas/montgomery-county-pa": {
    title: "Montgomery County PA Pest Control Services | Absolute Pest Services",
    description:
      "Montgomery County PA: Expert pest control in Norristown, King of Prussia, Collegeville, Pottstown. Licensed, insured, emergency service available.",
  },
  "/service-areas/northeast-maryland": {
    title: "Northeast Maryland Pest Control Services | Absolute Pest Services",
    description:
      "Northeast MD: Expert pest control in Elkton, North East, Perryville, Rising Sun. Licensed, insured, emergency service available.",
  },

  // ── City-level service area pages ────────────────────────────────────────
  "/service-areas/avondale-pa": {
    title: "Avondale PA Pest Control Services | Absolute Pest Services",
    description:
      "Avondale, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
  },
  "/service-areas/chadds-ford-pa": {
    title: "Chadds Ford PA Pest Control Services | Absolute Pest Services",
    description:
      "Chadds Ford, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
  },
  "/service-areas/coatesville-pa": {
    title: "Coatesville PA Pest Control Services | Absolute Pest Services",
    description:
      "Coatesville, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
  },
  "/service-areas/cochranville-pa": {
    title: "Cochranville PA Pest Control Services | Absolute Pest Services",
    description:
      "Cochranville, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
  },
  "/service-areas/collegeville-pa": {
    title: "Collegeville PA Pest Control Services | Absolute Pest Services",
    description:
      "Collegeville PA pest control: wildlife removal, termite treatment, and rodent control near Ursinus College and Perkiomen Creek. Call 484-643-2225.",
  },
  "/service-areas/downingtown-pa": {
    title: "Downingtown PA Pest Control Services | Absolute Pest Services",
    description:
      "Downingtown PA pest control: wildlife removal, termite treatment, bed bug control near Marsh Creek State Park and East Brandywine. Call 484-643-2225.",
  },
  "/service-areas/exton-pa": {
    title: "Exton PA Pest Control Services | Absolute Pest Services",
    description:
      "Exton PA pest control: wildlife removal, termite treatment, bed bug control, and rodent extermination near the PA Turnpike. Serving Exton, Lionville, and Uwchlan. Call 484-643-2225.",
  },
  "/service-areas/glen-mills-pa": {
    title: "Glen Mills PA Pest Control Services | Absolute Pest Services",
    description:
      "Glen Mills, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
  },
  "/service-areas/hockessin-de": {
    title: "Hockessin DE Pest Control Services | Absolute Pest Services",
    description:
      "Hockessin DE pest control: wildlife removal, termite treatment, and rodent control in heavily wooded Northern Delaware. Serving Kennett Pike corridor. Call 484-643-2225.",
  },
  "/service-areas/kennett-square-pa": {
    title: "Kennett Square PA Pest Control Services | Absolute Pest Services",
    description:
      "Kennett Square, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
  },
  "/service-areas/king-of-prussia-pa": {
    title: "King of Prussia PA Pest Control Services | Absolute Pest Services",
    description:
      "King of Prussia PA pest control: commercial and residential wildlife removal, termite treatment, and rodent control near Valley Forge. Call 484-643-2225.",
  },
  "/service-areas/landenberg-pa": {
    title: "Landenberg PA Pest Control Services | Absolute Pest Services",
    description:
      "Landenberg, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
  },
  "/service-areas/lincoln-university-pa": {
    title: "Lincoln University PA Pest Control Services | Absolute Pest Services",
    description:
      "Lincoln University, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
  },
  "/service-areas/malvern-pa": {
    title: "Malvern PA Pest Control Services | Absolute Pest Services",
    description:
      "Malvern PA pest control: wildlife removal, termite treatment, bed bug control along the Paoli Pike corridor. Serving Malvern, Frazer, and Great Valley. Call 484-643-2225.",
  },
  "/service-areas/newark-de": {
    title: "Newark DE Pest Control Services | Absolute Pest Services",
    description:
      "Newark DE pest control: bed bug treatment, wildlife removal, termite control near the University of Delaware. Serving Newark and growing New Castle County suburbs. Call 484-643-2225.",
  },
  "/service-areas/norristown-pa": {
    title: "Norristown PA Pest Control Services | Absolute Pest Services",
    description:
      "Norristown PA pest control: rodent control, wildlife removal, termite treatment along the Schuylkill River corridor. Montgomery County's trusted pest experts. Call 484-643-2225.",
  },
  "/service-areas/oxford-pa": {
    title: "Oxford PA Pest Control Services | Absolute Pest Services",
    description:
      "Oxford, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
  },
  "/service-areas/pottstown-pa": {
    title: "Pottstown PA Pest Control Services | Absolute Pest Services",
    description:
      "Pottstown PA pest control: rodent control, wildlife removal, and termite treatment in Montgomery County's industrial heritage corridor. Call 484-643-2225.",
  },
  "/service-areas/west-chester-pa": {
    title: "West Chester PA Pest Control Services | Absolute Pest Services",
    description:
      "West Chester PA pest control: expert wildlife removal, termite treatment, bed bug control, and rodent extermination. Serving West Chester Borough and surrounding townships. Call 484-643-2225.",
  },
  "/service-areas/west-grove-pa": {
    title: "West Grove PA Pest Control Services | Absolute Pest Services",
    description:
      "West Grove, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225.",
  },
  "/service-areas/wilmington-de": {
    title: "Wilmington DE Pest Control Services | Absolute Pest Services",
    description:
      "Wilmington DE pest control: rodent control, wildlife removal, termite treatment near the Brandywine River. Delaware's largest city pest experts. Call 484-643-2225.",
  },
  "/service-areas/aberdeen-md": {
    title: "Aberdeen MD Pest Control Services | Absolute Pest Services",
    description:
      "Aberdeen MD pest control: wildlife removal, termite treatment, and rodent control near Aberdeen Proving Ground and the Chesapeake Bay. Call 484-643-2225.",
  },
  "/service-areas/bel-air-md": {
    title: "Bel Air MD Pest Control Services | Absolute Pest Services",
    description:
      "Bel Air MD pest control: wildlife removal, termite treatment, and rodent control near I-95 in Harford County. Serving Bel Air and surrounding suburbs. Call 484-643-2225.",
  },
  "/service-areas/havre-de-grace-md": {
    title: "Havre de Grace MD Pest Control Services | Absolute Pest Services",
    description:
      "Havre de Grace MD pest control: wildlife removal, termite treatment near the Susquehanna River and Chesapeake Bay. Historic waterfront city pest experts. Call 484-643-2225.",
  },

  // ── 60 City × Service programmatic pages ─────────────────────────────────
  // General Pest Control (15 cities)
  "/pest-control-avondale-pa/": {
    title: "General Pest Control in Avondale, PA | Absolute Pest Services",
    description:
      "Expert general pest control in Avondale, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/pest-control-chadds-ford-pa/": {
    title: "General Pest Control in Chadds Ford, PA | Absolute Pest Services",
    description:
      "Expert general pest control in Chadds Ford, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/pest-control-coatesville-pa/": {
    title: "General Pest Control in Coatesville, PA | Absolute Pest Services",
    description:
      "Expert general pest control in Coatesville, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/pest-control-cochranville-pa/": {
    title: "General Pest Control in Cochranville, PA | Absolute Pest Services",
    description:
      "Expert general pest control in Cochranville, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/pest-control-downingtown-pa/": {
    title: "General Pest Control in Downingtown, PA | Absolute Pest Services",
    description:
      "Expert general pest control in Downingtown, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/pest-control-exton-pa/": {
    title: "General Pest Control in Exton, PA | Absolute Pest Services",
    description:
      "Expert general pest control in Exton, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/pest-control-glen-mills-pa/": {
    title: "General Pest Control in Glen Mills, PA | Absolute Pest Services",
    description:
      "Expert general pest control in Glen Mills, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/pest-control-hockessin-de/": {
    title: "General Pest Control in Hockessin, DE | Absolute Pest Services",
    description:
      "Expert general pest control in Hockessin, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/pest-control-kennett-square-pa/": {
    title: "General Pest Control in Kennett Square, PA | Absolute Pest Services",
    description:
      "Expert general pest control in Kennett Square, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/pest-control-landenberg-pa/": {
    title: "General Pest Control in Landenberg, PA | Absolute Pest Services",
    description:
      "Expert general pest control in Landenberg, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/pest-control-lincoln-university-pa/": {
    title: "General Pest Control in Lincoln University, PA | Absolute Pest Services",
    description:
      "Expert general pest control in Lincoln University, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/pest-control-newark-de/": {
    title: "General Pest Control in Newark, DE | Absolute Pest Services",
    description:
      "Expert general pest control in Newark, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/pest-control-oxford-pa/": {
    title: "General Pest Control in Oxford, PA | Absolute Pest Services",
    description:
      "Expert general pest control in Oxford, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/pest-control-west-grove-pa/": {
    title: "General Pest Control in West Grove, PA | Absolute Pest Services",
    description:
      "Expert general pest control in West Grove, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/pest-control-wilmington-de/": {
    title: "General Pest Control in Wilmington, DE | Absolute Pest Services",
    description:
      "Expert general pest control in Wilmington, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225 for fast service.",
  },

  // Termite Control (15 cities)
  "/termite-control-avondale-pa/": {
    title: "Termite Control in Avondale, PA | Absolute Pest Services",
    description:
      "Expert termite control in Avondale, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/termite-control-chadds-ford-pa/": {
    title: "Termite Control in Chadds Ford, PA | Absolute Pest Services",
    description:
      "Expert termite control in Chadds Ford, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/termite-control-coatesville-pa/": {
    title: "Termite Control in Coatesville, PA | Absolute Pest Services",
    description:
      "Expert termite control in Coatesville, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/termite-control-cochranville-pa/": {
    title: "Termite Control in Cochranville, PA | Absolute Pest Services",
    description:
      "Expert termite control in Cochranville, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/termite-control-downingtown-pa/": {
    title: "Termite Control in Downingtown, PA | Absolute Pest Services",
    description:
      "Expert termite control in Downingtown, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/termite-control-exton-pa/": {
    title: "Termite Control in Exton, PA | Absolute Pest Services",
    description:
      "Expert termite control in Exton, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/termite-control-glen-mills-pa/": {
    title: "Termite Control in Glen Mills, PA | Absolute Pest Services",
    description:
      "Expert termite control in Glen Mills, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/termite-control-hockessin-de/": {
    title: "Termite Control in Hockessin, DE | Absolute Pest Services",
    description:
      "Expert termite control in Hockessin, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/termite-control-kennett-square-pa/": {
    title: "Termite Control in Kennett Square, PA | Absolute Pest Services",
    description:
      "Expert termite control in Kennett Square, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/termite-control-landenberg-pa/": {
    title: "Termite Control in Landenberg, PA | Absolute Pest Services",
    description:
      "Expert termite control in Landenberg, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/termite-control-lincoln-university-pa/": {
    title: "Termite Control in Lincoln University, PA | Absolute Pest Services",
    description:
      "Expert termite control in Lincoln University, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/termite-control-newark-de/": {
    title: "Termite Control in Newark, DE | Absolute Pest Services",
    description:
      "Expert termite control in Newark, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/termite-control-oxford-pa/": {
    title: "Termite Control in Oxford, PA | Absolute Pest Services",
    description:
      "Expert termite control in Oxford, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/termite-control-west-grove-pa/": {
    title: "Termite Control in West Grove, PA | Absolute Pest Services",
    description:
      "Expert termite control in West Grove, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/termite-control-wilmington-de/": {
    title: "Termite Control in Wilmington, DE | Absolute Pest Services",
    description:
      "Expert termite control in Wilmington, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225 for fast service.",
  },

  // Wildlife & Rodent Control (15 cities)
  "/wildlife-control-avondale-pa/": {
    title: "Wildlife & Rodent Control in Avondale, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Avondale, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/wildlife-control-chadds-ford-pa/": {
    title: "Wildlife & Rodent Control in Chadds Ford, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Chadds Ford, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/wildlife-control-coatesville-pa/": {
    title: "Wildlife & Rodent Control in Coatesville, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Coatesville, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/wildlife-control-cochranville-pa/": {
    title: "Wildlife & Rodent Control in Cochranville, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Cochranville, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/wildlife-control-downingtown-pa/": {
    title: "Wildlife & Rodent Control in Downingtown, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Downingtown, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/wildlife-control-exton-pa/": {
    title: "Wildlife & Rodent Control in Exton, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Exton, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/wildlife-control-glen-mills-pa/": {
    title: "Wildlife & Rodent Control in Glen Mills, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Glen Mills, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/wildlife-control-hockessin-de/": {
    title: "Wildlife & Rodent Control in Hockessin, DE | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Hockessin, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/wildlife-control-kennett-square-pa/": {
    title: "Wildlife & Rodent Control in Kennett Square, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Kennett Square, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/wildlife-control-landenberg-pa/": {
    title: "Wildlife & Rodent Control in Landenberg, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Landenberg, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/wildlife-control-lincoln-university-pa/": {
    title: "Wildlife & Rodent Control in Lincoln University, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Lincoln University, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/wildlife-control-newark-de/": {
    title: "Wildlife & Rodent Control in Newark, DE | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Newark, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/wildlife-control-oxford-pa/": {
    title: "Wildlife & Rodent Control in Oxford, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Oxford, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/wildlife-control-west-grove-pa/": {
    title: "Wildlife & Rodent Control in West Grove, PA | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in West Grove, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service.",
  },
  "/wildlife-control-wilmington-de/": {
    title: "Wildlife & Rodent Control in Wilmington, DE | Absolute Pest Services",
    description:
      "Expert wildlife & rodent control in Wilmington, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225 for fast service.",
  },

  // Ant & Wasp Control (15 cities)
  "/ant-wasp-control-avondale-pa/": {
    title: "Ant & Wasp Control in Avondale, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Avondale, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225.",
  },
  "/ant-wasp-control-chadds-ford-pa/": {
    title: "Ant & Wasp Control in Chadds Ford, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Chadds Ford, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225.",
  },
  "/ant-wasp-control-coatesville-pa/": {
    title: "Ant & Wasp Control in Coatesville, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Coatesville, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225.",
  },
  "/ant-wasp-control-cochranville-pa/": {
    title: "Ant & Wasp Control in Cochranville, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Cochranville, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225.",
  },
  "/ant-wasp-control-downingtown-pa/": {
    title: "Ant & Wasp Control in Downingtown, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Downingtown, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225.",
  },
  "/ant-wasp-control-exton-pa/": {
    title: "Ant & Wasp Control in Exton, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Exton, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225.",
  },
  "/ant-wasp-control-glen-mills-pa/": {
    title: "Ant & Wasp Control in Glen Mills, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Glen Mills, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225.",
  },
  "/ant-wasp-control-hockessin-de/": {
    title: "Ant & Wasp Control in Hockessin, DE | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Hockessin, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225.",
  },
  "/ant-wasp-control-kennett-square-pa/": {
    title: "Ant & Wasp Control in Kennett Square, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Kennett Square, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225.",
  },
  "/ant-wasp-control-landenberg-pa/": {
    title: "Ant & Wasp Control in Landenberg, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Landenberg, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225.",
  },
  "/ant-wasp-control-lincoln-university-pa/": {
    title: "Ant & Wasp Control in Lincoln University, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Lincoln University, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225.",
  },
  "/ant-wasp-control-newark-de/": {
    title: "Ant & Wasp Control in Newark, DE | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Newark, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225.",
  },
  "/ant-wasp-control-oxford-pa/": {
    title: "Ant & Wasp Control in Oxford, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Oxford, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225.",
  },
  "/ant-wasp-control-west-grove-pa/": {
    title: "Ant & Wasp Control in West Grove, PA | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in West Grove, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225.",
  },
  "/ant-wasp-control-wilmington-de/": {
    title: "Ant & Wasp Control in Wilmington, DE | Absolute Pest Services",
    description:
      "Expert ant, wasp, hornet & carpenter bee control in Wilmington, DE. Licensed & insured. Serving New Castle County. Free inspection available. Call 484-643-2225.",
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

  // Lookup with trailing slash (city-service pages use trailing slash)
  if (ROUTE_META[normalised + "/"]) return ROUTE_META[normalised + "/"];

  // Fallback for blog posts, admin, portal pages, etc.
  return DEFAULT_META;
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
 * Inject the correct <title> and <meta name="description"> into an HTML string.
 *
 * - Replaces the existing <title>...</title> (must exist in index.html)
 * - Replaces the existing <meta name="description" content="..."> (must exist)
 * - Also updates og:title, og:description, twitter:title, twitter:description
 *
 * Returns the modified HTML string.
 */
export function injectSeoMeta(html: string, meta: PageMeta): string {
  const safeTitle = escapeHtml(meta.title);
  const safeDesc = escapeHtml(meta.description);

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

  return result;
}
