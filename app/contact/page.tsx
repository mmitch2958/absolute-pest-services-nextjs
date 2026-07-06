import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import ConversionCard from '@/components/forms/ConversionCard'

export const metadata: Metadata = {
  title: 'Contact Us | Absolute Pest Services',
  description: 'Contact Absolute Pest Services for pest control in PA & DE. Call 484-643-2225 for same-day service. Serving Chester County, Delaware County, and New Castle County.',
  alternates: { canonical: 'https://absolutepestservices.com/contact' },
  openGraph: {
    title: 'Contact Absolute Pest Services',
    description: 'Call 484-643-2225 for same-day pest control in PA & DE.',
    url: 'https://absolutepestservices.com/contact',
    type: 'website',
  },
}

export default function ContactPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-green-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-green-300 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Contact</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Absolute Pest Services</h1>
          <p className="text-xl text-green-100 max-w-3xl">
            Get in touch for same-day pest control, free quotes, and emergency wildlife removal across PA &amp; DE.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-green-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Phone — PA (Main)</p>
                    <a href="tel:6108693000" className="text-green-700 hover:underline text-lg">610-869-3000</a>
                    <br />
                    <a href="tel:4846432225" className="text-green-700 hover:underline">484-643-2225</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-green-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Phone — Delaware</p>
                    <a href="tel:6103254000" className="text-green-700 hover:underline text-lg">610-325-4000</a>
                    <br />
                    <a href="tel:3022351975" className="text-green-700 hover:underline">302-235-1975</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-green-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <a href="mailto:info@absolutepestservices.com" className="text-green-700 hover:underline">
                      info@absolutepestservices.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-green-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Service Area</p>
                    <p className="text-gray-600">Chester County PA · Delaware County PA</p>
                    <p className="text-gray-600">Montgomery County PA · New Castle County DE</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-green-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Hours</p>
                    <p className="text-gray-600">Monday – Friday: 7:00 AM – 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 8:00 AM – 4:00 PM</p>
                    <p className="text-gray-600">Emergency service available 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            <div id="contact-form">
              <ConversionCard
                heading="Request Service Online"
                subheading="We respond within 1 hour during business hours"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
