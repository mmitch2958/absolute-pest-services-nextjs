'use client'

import ServiceRequestForm from '@/components/forms/ServiceRequestForm'
import { Phone, MapPin, CheckCircle, Clock, Shield, Star, ThumbsUp } from 'lucide-react'
import Link from 'next/link'
import { SERVICE_AREAS_LANDING } from '@/lib/service-areas-data'

export default function ServiceAreasPage() {
  const { h1, subheading, countyGroups } = SERVICE_AREAS_LANDING

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {h1}
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            {subheading}
          </p>
          <a
            href="tel:484-643-2225"
            className="inline-flex items-center bg-white text-[hsl(132,48%,35%)] px-8 py-4 text-lg font-semibold hover:bg-gray-100 rounded-md transition-colors"
          >
            <Phone className="mr-2 h-5 w-5" />
            Call Now: 484-643-2225
          </a>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-1">
              <Shield className="w-6 h-6 text-[hsl(132,48%,35%)]" />
              <span className="text-sm font-semibold text-gray-900">Licensed & Insured</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Clock className="w-6 h-6 text-[hsl(132,48%,35%)]" />
              <span className="text-sm font-semibold text-gray-900">30+ Years Experience</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Star className="w-6 h-6 text-[hsl(132,48%,35%)]" />
              <span className="text-sm font-semibold text-gray-900">5.0 Google Rating</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ThumbsUp className="w-6 h-6 text-[hsl(132,48%,35%)]" />
              <span className="text-sm font-semibold text-gray-900">Local & Family Owned</span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas by County */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Find Your Community
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select your county or city below to learn about our services in your area.
            </p>
          </div>

          <div className="space-y-12">
            {countyGroups.map((group) => (
              <div key={group.name}>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        group.accentColor === '[hsl(132,48%,35%)]' ? 'hsl(132,48%,35%)' :
                        group.accentColor === '[hsl(207,73%,44%)]' ? 'hsl(207,73%,44%)' :
                        group.accentColor === '[hsl(36,100%,47%)]' ? 'hsl(36,100%,47%)' :
                        'teal',
                    }}
                  />
                  <h3 className="text-2xl font-bold text-gray-900">{group.name}</h3>
                  <a
                    href={`tel:${group.phoneNumber.replace(/-/g, '')}`}
                    className="ml-auto hidden sm:flex items-center gap-2 text-sm font-semibold text-[hsl(132,48%,35%)] hover:text-[hsl(132,48%,25%)]"
                  >
                    <Phone className="w-4 h-4" />
                    {group.phoneNumber}
                  </a>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {group.areas.map((area) => (
                    <Link key={area.slug} href={`/service-areas/${area.slug}`}>
                      <div className={`${group.bgCard} rounded-lg border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer h-full p-5 flex items-center gap-3`}>
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                          style={{
                            backgroundColor:
                              group.accentColor === '[hsl(132,48%,35%)]' ? 'hsl(132,48%,35%)' :
                              group.accentColor === '[hsl(207,73%,44%)]' ? 'hsl(207,73%,44%)' :
                              group.accentColor === '[hsl(36,100%,47%)]' ? 'hsl(36,100%,47%)' :
                              'teal',
                          }}
                        >
                          <MapPin className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-gray-900">{area.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>

                <a
                  href={`tel:${group.phoneNumber.replace(/-/g, '')}`}
                  className="mt-4 sm:hidden flex items-center justify-center gap-2 text-sm font-semibold text-[hsl(132,48%,35%)]"
                >
                  <Phone className="w-4 h-4" />
                  {group.phoneNumber}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Homeowners Choose Absolute Pest Services
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Licensed & Insured',
                desc: 'Fully licensed in PA, DE, and MD. $2M liability insurance for your peace of mind.',
                color: 'hsl(132,48%,35%)',
              },
              {
                icon: Clock,
                title: 'Same-Day Emergency Service',
                desc: "Pest emergencies don't wait. Neither do we. Call anytime for rapid response.",
                color: 'hsl(36,100%,47%)',
              },
              {
                icon: Star,
                title: '5.0 Star Rated',
                desc: 'Consistently rated 5 stars by homeowners across Chester, Delaware, Montgomery, and New Castle Counties.',
                color: 'hsl(207,73%,44%)',
              },
              {
                icon: CheckCircle,
                title: '30+ Years Experience',
                desc: 'Three decades of trusted pest control experience in southeastern PA and Delaware.',
                color: 'hsl(132,48%,35%)',
              },
              {
                icon: MapPin,
                title: 'Locally Based',
                desc: 'Our office is in West Grove, PA. We know our communities and respond faster.',
                color: 'hsl(36,100%,47%)',
              },
              {
                icon: ThumbsUp,
                title: 'Safe Treatments',
                desc: 'EPA-registered products. Child and pet-friendly options available. We follow strict safety protocols.',
                color: 'hsl(207,73%,44%)',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-lg border border-gray-100 hover:shadow-lg transition-shadow p-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white"
                  style={{ backgroundColor: item.color }}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pest Control Services We Offer
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From wildlife removal to termite protection, we offer comprehensive solutions for every pest problem.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: '/wildlife-control', label: 'Wildlife Control & Removal', desc: 'Raccoon, groundhog, fox, squirrel removal' },
              { href: '/bat-removal', label: 'Bat Removal & Exclusion', desc: 'Licensed, humane bat exclusion' },
              { href: '/bed-bug-treatment', label: 'Bed Bug Treatment', desc: 'Heat & chemical treatment options' },
              { href: '/termite-treatment', label: 'Termite Inspection & Treatment', desc: 'Free inspections, guaranteed protection' },
              { href: '/rodents', label: 'Rodent Control', desc: 'Mice & rat extermination & exclusion' },
              { href: '/request-service', label: 'Schedule Free Inspection', desc: 'Same-day appointments available' },
            ].map((service) => (
              <div key={service.href} className="bg-white rounded-lg border border-gray-100 hover:shadow-lg transition-shadow p-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0 text-white">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <Link href={service.href} className="font-semibold text-gray-900 hover:text-[hsl(132,48%,35%)]">
                    {service.label}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">{service.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request Service Form */}
      <section className="py-16 bg-gradient-to-br from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Schedule Your Free Inspection
            </h2>
            <p className="text-green-100">
              Fill out the form below and we&apos;ll be in touch within 24 hours to schedule your free inspection.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-xl p-6">
            <ServiceRequestForm />
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-[hsl(210,13%,28%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-2xl font-bold text-[hsl(132,48%,35%)]">484-643-2225</p>
              <p className="text-gray-600 mt-2">24/7 Emergency Service</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-[hsl(36,100%,47%)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hours</h3>
              <p className="text-gray-600">Mon-Fri: 8:00 AM - 5:00 PM</p>
              <p className="text-gray-600">Sat: 8:00 AM - 12:00 PM</p>
              <p className="text-gray-600">Sun: Emergency Only</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-[hsl(207,73%,44%)] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Main Office</h3>
              <p className="text-gray-600">21 Sheffield Dr</p>
              <p className="text-gray-600">West Grove, PA 19390</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
