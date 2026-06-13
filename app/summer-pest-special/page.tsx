import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  CheckCircle2,
  Clock3,
  Phone,
  ShieldCheck,
  Sparkles,
  SunMedium,
} from "lucide-react"

import ConversionCard from "@/components/forms/ConversionCard"

export const metadata: Metadata = {
  title: "Summer Pest Special | Absolute Pest Services",
  description:
    "Fast summer pest control for ants, wasps, hornets, spiders, roaches, ticks, and more across Chester County and nearby Delaware County.",
  alternates: {
    canonical: "https://absolutepestservices.com/summer-pest-special",
  },
  openGraph: {
    title: "Summer Pest Special | Absolute Pest Services",
    description:
      "A fast, conversion-focused landing page for summer pest service requests in Chester County and nearby Delaware County.",
    url: "https://absolutepestservices.com/summer-pest-special",
    type: "website",
    images: [
      {
        url: "https://absolutepestservices.com/images/aps_banner.jpg",
        width: 1200,
        height: 628,
        alt: "Absolute Pest Services summer pest special",
      },
    ],
  },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does the summer pest special cover?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "This page is a good fit for common warm-weather pest issues such as ants, wasps, hornets, spiders, roaches, ticks, and other recurring insect activity around the home.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to know exactly what pest I have before requesting service?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "No. Many homeowners just know they are seeing pest activity and want help quickly. Tell us what you are seeing and where, and Absolute Pest Services can recommend the right next step.",
      },
    },
    {
      "@type": "Question",
      name: "How quickly do you respond to summer pest requests?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Response time depends on scheduling and route availability, but APS aims to respond quickly and make it easy to request service online or by phone.",
      },
    },
  ],
}

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Summer Pest Special",
  serviceType: "Seasonal Pest Control",
  provider: {
    "@type": "LocalBusiness",
    name: "Absolute Pest Services",
    telephone: "+1-484-643-2225",
    url: "https://absolutepestservices.com/summer-pest-special",
  },
  areaServed: "Chester County PA and nearby Delaware County PA",
  url: "https://absolutepestservices.com/summer-pest-special",
}

const highlights = [
  "Fast local response",
  "Built for summer insect activity",
  "Easy online request form",
]

const coveredPests = [
  "Ants",
  "Wasps and hornets",
  "Carpenter bees",
  "Spiders",
  "Roaches",
  "Ticks",
  "Mosquitoes",
  "Stink bugs",
  "Fleas",
  "Silverfish",
  "Earwigs",
  "General household insect activity",
]

const reasons = [
  {
    title: "Built for peak summer demand",
    body:
      "Warm weather brings more nesting, more exterior activity, and more insects finding their way indoors. This page is designed for those higher-intent seasonal service requests.",
  },
  {
    title: "Simple request flow",
    body:
      "Visitors can call right away or submit a service request without hunting through the site for the right page first.",
  },
  {
    title: "Good fit for mixed symptoms",
    body:
      "If the issue could be ants, wasps, spiders, or a broader pest-control problem, this page gives people a clear starting point without forcing them into the wrong service bucket.",
  },
]

const serviceAreas = [
  "West Chester",
  "Kennett Square",
  "West Grove",
  "Oxford",
  "Avondale",
  "Exton",
  "Coatesville",
  "Chadds Ford",
  "Glen Mills",
  "Media",
  "Newtown Square",
  "Landenberg",
]

export default function SummerPestSpecialPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/aps_banner.jpg"
            alt="Absolute Pest Services summer pest special"
            fill
            priority
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-950/90 via-slate-950/88 to-amber-950/70" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <nav className="mb-4 text-sm text-green-200" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>Summer Pest Special</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_420px] lg:items-start">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-100">
                <SunMedium className="h-3.5 w-3.5" />
                Summer Pest Special
              </div>

              <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
                Fast help for the summer pest problems homeowners notice first.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
                From ants in the kitchen to wasps around the deck and general
                insect activity around the house, Absolute Pest Services helps
                homeowners across Chester County and nearby Delaware County get
                quick, practical help without a complicated process.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="tel:484-643-2225"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-green-900 hover:bg-green-50"
                >
                  <Phone className="h-5 w-5" />
                  Call 484-643-2225
                </a>
                <a
                  href="#request-service"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-3 font-semibold text-white hover:bg-white/10"
                >
                  Request Service
                </a>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div id="request-service">
              <ConversionCard
                heading="Request Your Summer Pest Service"
                subheading="Seasonal pest help"
                defaultService="pest-control"
                trustItems={[
                  "Response within 1-2 hours",
                  "Great for summer pest issues",
                  "No commitment required",
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
              <Clock3 className="h-3.5 w-3.5" />
              Seasonal demand page
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">
              A cleaner landing page for summer demand
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              This page is built for high-intent homeowners who know they need
              help now, but may not know whether the problem belongs on a wasp
              page, an ant page, or a broader pest-control page.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reasons.map((reason) => (
              <div
                key={reason.title}
                className="rounded-xl border border-gray-200 bg-gray-50 p-6"
              >
                <Sparkles className="h-5 w-5 text-green-700" />
                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {reason.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Common summer pest problems we help with
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Summer service calls come in fast. This page is meant to catch
                the kinds of problems homeowners want solved quickly, even when
                they are not sure which exact service page they need.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {coveredPests.map((pest) => (
                  <div
                    key={pest}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-700" />
                    {pest}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3 text-green-800">
                <ShieldCheck className="h-5 w-5" />
                <h3 className="text-lg font-bold text-gray-900">
                  Why this page should convert well
                </h3>
              </div>

              <div className="mt-5 space-y-4 text-sm leading-6 text-gray-600">
                <p>
                  It matches broad summer intent without forcing people into the
                  wrong service bucket too early.
                </p>
                <p>
                  It gives call-first visitors an obvious path while keeping a
                  full request form right on the page for people who prefer to
                  submit online.
                </p>
                <p>
                  It is also a stronger destination for cold traffic than
                  sending new campaign clicks to the homepage.
                </p>
              </div>

              <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-900">
                Strong fit for ant pressure, seasonal wasp activity, carpenter
                bee issues, recurring spider sightings, and mixed household
                insect symptoms.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Service areas this page supports well
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                The offer and language on this page fit the core service area we
                are already prioritizing in Chester County and nearby Delaware
                County.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {serviceAreas.map((area) => (
                  <div
                    key={area}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800"
                  >
                    {area}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 p-8 text-white">
              <h2 className="text-3xl font-bold">
                Ready to request summer pest service?
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-200">
                Use the form above or call now if you are seeing insect activity
                around your home and want quick help from a local team.
              </p>

              <div className="mt-8 space-y-4 text-sm leading-6 text-slate-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-300" />
                  <p>Good fit for urgent summer pest questions and fast estimate requests.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-300" />
                  <p>Works well for broad search traffic when visitors do not yet know the exact pest.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-300" />
                  <p>Keeps the request form front and center for paid traffic.</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#request-service"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 font-bold text-slate-900 hover:bg-slate-100"
                >
                  Start Request
                </a>
                <a
                  href="tel:484-643-2225"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-semibold text-white hover:bg-white/10"
                >
                  <Phone className="h-4 w-4" />
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}