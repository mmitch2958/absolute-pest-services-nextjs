import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Absolute Pest Services',
  description: 'Privacy policy for Absolute Pest Services. Learn how we collect, use, and protect your personal information.',
  alternates: { canonical: 'https://absolutepestservices.com/privacy-policy' },
  robots: { index: false },
}

export default function PrivacyPolicyPage() {
  const updated = 'March 25, 2026'

  return (
    <main>
      <section className="bg-gradient-to-br from-green-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-green-300 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Privacy Policy</span>
          </nav>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-green-200">Last updated: {updated}</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none text-gray-700">

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Information We Collect</h2>
            <p>
              We collect information you provide directly, such as your name, email address, phone number, address, and service details when you submit a service request or contact form on our website.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Schedule and fulfill pest control services</li>
              <li>Send appointment confirmations and service reminders</li>
              <li>Respond to your questions and inquiries</li>
              <li>Send follow-up review requests after completed service</li>
              <li>Improve our website and service offerings</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers who assist in operating our business (e.g., scheduling software, email platforms), under strict confidentiality agreements.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Cookies</h2>
            <p>
              Our website may use cookies and similar tracking technologies to improve your browsing experience, analyze site traffic, and serve relevant advertising (including Google Ads). You can control cookie preferences through your browser settings.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, or destruction. Sensitive data is encrypted in transit and at rest.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">6. Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal information at any time by contacting us at <a href="mailto:info@absolutepestservices.com" className="text-green-700 hover:underline">info@absolutepestservices.com</a>.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">7. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us:
            </p>
            <p className="mt-2">
              <strong>Absolute Pest Services</strong><br />
              Phone: <a href="tel:4846432225" className="text-green-700 hover:underline">484-643-2225</a><br />
              Email: <a href="mailto:info@absolutepestservices.com" className="text-green-700 hover:underline">info@absolutepestservices.com</a>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
