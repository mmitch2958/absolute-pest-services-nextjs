import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import Header from "@/components/Header";

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Absolute Pest Services</title>
        <meta name="description" content="Privacy Policy for Absolute Pest Services. Learn how we collect, use, and protect your information when you use our pest control services." />
        <link rel="canonical" href="https://absolutepestservices.com/privacy-policy" />
      </Helmet>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: March 2026</p>

        <section className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">About This Policy</h2>
            <p>Absolute Pest Services ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard information when you visit our website at absolutepestservices.com or contact us for pest control services.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Information We Collect</h2>
            <p>We may collect the following information when you contact us or request service:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Name, phone number, and email address</li>
              <li>Service address and property details</li>
              <li>Description of your pest control needs</li>
              <li>Preferred contact method and appointment times</li>
            </ul>
            <p className="mt-3">We also collect non-personally-identifiable information automatically through cookies and analytics tools, including pages visited, time on site, and referring pages.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To schedule and deliver pest control services</li>
              <li>To respond to your inquiries and service requests</li>
              <li>To send appointment reminders and follow-up communications</li>
              <li>To improve our website and marketing efforts</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Google Analytics & Advertising</h2>
            <p>We use Google Analytics to understand how visitors use our website. Google Analytics collects anonymous usage data using cookies. We also use Google Ads conversion tracking to measure the effectiveness of our advertising campaigns.</p>
            <p className="mt-2">You can opt out of Google Analytics tracking by installing the <a href="https://tools.google.com/dlpage/gaoptout" className="text-green-700 underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>. You can manage your Google Ads preferences at <a href="https://adssettings.google.com" className="text-green-700 underline" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Information Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers who assist in our operations, subject to confidentiality agreements.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal information at any time by contacting us directly.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us:</p>
            <ul className="list-none mt-2 space-y-1">
              <li><strong>Absolute Pest Services</strong></li>
              <li>PO Box 8059, Newark, DE 19714</li>
              <li>Phone: <a href="tel:4846432225" className="text-green-700">484-643-2225</a></li>
              <li>Email: <a href="mailto:info@absolutepestservices.com" className="text-green-700">info@absolutepestservices.com</a></li>
            </ul>
          </div>
        </section>

        <div className="mt-10 pt-6 border-t border-gray-200">
          <Link href="/" className="text-green-700 hover:underline">← Back to Home</Link>
        </div>
      </main>
    </>
  );
}
