import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, CheckCircle } from 'lucide-react'
import ServiceRequestForm from '@/components/forms/ServiceRequestForm'

export const metadata: Metadata = {
  title: 'Request Pest Control Service | Absolute Pest Services',
  description:
    'Schedule same-day pest control, wildlife removal, bed bug treatment or termite inspection in PA & DE. Fast response. Licensed & insured. Call 484-643-2225.',
  alternates: { canonical: 'https://absolutepestservices.com/request-service' },
}

export default function RequestServicePage() {
  return (
    <>
      <section className="bg-gradient-to-br from-[#0a221c] to-[#203d34] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-[#c3d6bd] mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span>Request Service</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Request Pest Control Service</h1>
          <p className="text-xl text-[#c7d0cb] max-w-2xl">
            Fill out the form below and we&rsquo;ll contact you within 1–2 business hours.
            For same-day service or emergencies, call us directly.
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#f7f6f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#e9eddf]">
                <h2 className="text-2xl font-bold text-[#203d34] mb-6">Service Request Form</h2>
                <ServiceRequestForm />
              </div>
            </div>

            {/* Contact info sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[#173f35] text-white rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-xl mb-4">Prefer to Call?</h3>
                <a
                  href="tel:484-643-2225"
                  className="flex items-center gap-3 bg-white text-[#173f35] hover:bg-[#e9eddf] font-bold px-5 py-4 rounded-xl w-full justify-center text-lg mb-3"
                >
                  <Phone size={22} />
                  484-643-2225
                </a>
                <p className="text-[#e9eddf] text-sm text-center">
                  Available 24/7 for emergencies
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#e9eddf]">
                <h3 className="font-bold text-[#203d34] mb-4">What Happens Next?</h3>
                <div className="space-y-3">
                  {[
                    'We receive your request immediately',
                    'A technician reviews and calls you within 1–2 hours',
                    'We schedule a time that works for you',
                    'Same-day service available in most cases',
                    'Free estimate provided before any work begins',
                  ].map((step, i) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#e9eddf] text-[#173f35] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-sm text-[#3f5049]">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#f7f6f0] rounded-2xl p-6 border border-[#e9eddf] mt-6">
                <h3 className="font-bold text-[#203d34] mb-3">Service Hours</h3>
                <div className="text-sm space-y-2 text-[#3f5049]">
                  <div className="flex justify-between">
                    <span>Mon–Fri</span>
                    <span>7:00 AM – 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>8:00 AM – 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Emergencies only</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <CheckCircle size={14} className="text-[#66845d]" />
                    <span className="text-[#173f35] font-medium">24/7 Emergency Line</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
