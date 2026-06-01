import type { Metadata } from "next"
import Link from "next/link"
import { Bug, CheckCircle, Home, Phone, ShieldCheck, Sparkles, Star } from "lucide-react"
import ConversionCard from "@/components/forms/ConversionCard"

export const metadata: Metadata = {
  title: "Pest Control Services | General Insect Exterminator | Absolute Pest Services",
  description:
    "General pest control for ants, spiders, roaches, stink bugs, fleas, ticks, mosquitoes, crickets, and more in Chester County and nearby Delaware County. Fast response and free estimates.",
  keywords: [
    "pest control",
    "general pest control",
    "ant exterminator",
    "spider exterminator",
    "roach exterminator",
    "tick exterminator",
    "mosquito control",
    "insect exterminator",
    "pest control Chester County",
    "pest control Delaware County",
  ],
  alternates: {
    canonical: "https://absolutepestservices.com/pest-control",
  },
  openGraph: {
    title: "Pest Control Services | Absolute Pest Services",
    description:
      "Fast, professional insect and pest control for homes in Chester County and nearby Delaware County.",
    url: "https://absolutepestservices.com/pest-control",
    type: "website",
  },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What pests are covered under general pest control?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our general pest control service covers many common insect pests including ants, spiders, cockroaches, crickets, silverfish, earwigs, fleas, ticks, mosquitoes, stink bugs, beetles, centipedes, and millipedes. If you are unsure what you are seeing, we can identify it during the inspection.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer same-day pest control?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Same-day availability depends on route capacity and the urgency of the issue, but we do our best to respond quickly throughout Chester County and nearby Delaware County.",
      },
    },
    {
      "@type": "Question",
      name: "Can you help if I am not sure what insect I have?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. Many homeowners know they have a pest problem but do not know the species. Tell us where you are seeing activity and we will help identify the issue and recommend the right treatment.",
      },
    },
    {
      "@type": "Question",
      name: "Is your treatment safe for children and pets?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We use professional products and treatment methods with safety in mind. Your technician will explain where products are applied and any simple precautions to take after service.",
      },
    },
  ],
}

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "General Pest Control",
  serviceType: "Pest Control",
  provider: {
    "@type": "LocalBusiness",
    name: "Absolute Pest Services",
    telephone: "+1-484-643-2225",
    url: "https://absolutepestservices.com/pest-control",
  },
  areaServed: "Chester County PA and nearby Delaware County PA",
  url: "https://absolutepestservices.com/pest-control",
}

const coveredPests = [
  "Ants",
  "Carpenter ants",
  "Spiders",
  "Cockroaches",
  "Stink bugs",
  "Crickets",
  "Silverfish",
  "Earwigs",
  "Fleas",
  "Ticks",
  "Mosquitoes",
  "Beetles",
  "Centipedes",
  "Millipedes",
]

const benefits = [
  {
    title: "Fast local response",
    text: "We serve homeowners across Chester County and nearby Delaware County with quick scheduling and practical treatment plans.",
  },
  {
    title: "Clear recommendations",
    text: "If you are not sure what pest you have, we help identify the problem and explain the next best step in plain language.",
  },
  {
    title: "Built for recurring pests",
    text: "We treat the pests that show up again and again around foundations, kitchens, basements, garages, attics, and exterior entry points.",
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

export default function PestControlPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

      <section className="bg-gradient-to-br from-green-900 to-slate-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-4 text-sm text-green-300" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span>Pest Control</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_420px] lg:items-start">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-100">
                <Bug className="h-3.5 w-3.5" />
                General insect control for common home pests
              </div>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
                Pest control for ants, spiders, roaches, and the insects that keep showing up.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-green-50/90">
                Absolute Pest Services helps homeowners across Chester County and nearby Delaware County handle common pest problems quickly, clearly, and without making the process harder than it needs to be.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="tel:484-643-2225" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-green-900 hover:bg-green-50">
                  <Phone className="h-5 w-5" />
                  Call 484-643-2225
                </a>
                <a href="#request-service" className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-3 font-semibold text-white hover:bg-white/10">
                  Request Service
                </a>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  "Fast response",
                  "Free estimates",
                  "Licensed and insured",
                ].map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-green-50">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div id="request-service">
              <ConversionCard
                heading="Get a Free Pest Control Estimate"
                subheading="General insect service"
                defaultService="pest-control"
                trustItems={[
                  "Response within 1-2 hours",
                  "General insect control",
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
            <h2 className="text-3xl font-bold text-gray-900">A better fit for everyday pest problems</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Not every homeowner needs a specialty service page. This page is built for general pest issues where the problem is urgent, annoying, or simply unclear and you just need a local pro to take a look.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                <Sparkles className="h-5 w-5 text-green-700" />
                <h3 className="mt-4 text-lg font-bold text-gray-900">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Common pests we handle</h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                If it crawls, bites, stings, or keeps coming back inside, there is a good chance we can help. These are some of the pests homeowners ask us about most often.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {coveredPests.map((pest) => (
                  <div key={pest} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800">
                    <CheckCircle className="h-4 w-4 text-green-700" />
                    {pest}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3 text-green-800">
                <ShieldCheck className="h-5 w-5" />
                <h3 className="text-lg font-bold text-gray-900">Why homeowners call APS</h3>
              </div>
              <div className="mt-5 space-y-4 text-sm leading-6 text-gray-600">
                <p>We keep the process simple: identify the issue, recommend the right treatment, and help you get service scheduled without a lot of back-and-forth.</p>
                <p>For ads and lead forms, this page is designed to work well when someone knows they need pest control but has not narrowed it down to a specialty service yet.</p>
              </div>
              <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-900">
                Good fit for ant problems, spider issues, roach sightings, stink bugs, fleas, ticks, mosquitoes, and other common insect concerns.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <div className="flex items-center gap-3 text-green-800">
                <Home className="h-5 w-5" />
                <h2 className="text-xl font-bold text-gray-900">Areas we commonly serve</h2>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {serviceAreas.map((area) => (
                  <div key={area} className="rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700">
                    {area}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900">Frequently asked questions</h2>
              <div className="mt-8 space-y-4">
                {faqSchema.mainEntity.map((item) => (
                  <div key={item.name} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{item.acceptedAnswer.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-green-900 p-6 text-white">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-green-300" />
                  <h3 className="text-lg font-bold">Need service now?</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-green-50/90">
                  Call now for the fastest response, or submit the form and we will follow up quickly with the next best step.
                </p>
                <a href="tel:484-643-2225" className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-green-900 hover:bg-green-50">
                  <Phone className="h-5 w-5" />
                  484-643-2225
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}