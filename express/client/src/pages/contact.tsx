import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Absolute Pest Services | Call 484-643-2225</title>
        <meta name="description" content="Contact Absolute Pest Services for pest control in Chester County PA and Delaware. Call 484-643-2225, text, or request service online. 24/7 emergency service available." />
        <link rel="canonical" href="https://absolutepestservices.com/contact" />
      </Helmet>
      <Header />
      <main>
        <section className="bg-green-800 text-white py-16 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-green-100">Ready to solve your pest problem? We're here to help — call, text, or request service online.</p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Get In Touch</h2>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Phone className="text-green-700" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Phone & Text</h3>
                  <a href="tel:4846432225" className="text-green-700 font-bold text-lg hover:underline block">484-643-2225</a>
                  <a href="tel:6108693000" className="text-green-700 hover:underline block">610-869-3000</a>
                  <p className="text-gray-500 text-sm mt-1">Text us at 484-643-2225 · 24/7 emergency service</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Phone className="text-green-700" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Delaware Customers</h3>
                  <a href="tel:6103254000" className="text-green-700 font-bold text-lg hover:underline block">610-325-4000</a>
                  <p className="text-gray-500 text-sm mt-1">New Castle County: <a href="tel:3022351975" className="text-green-700 hover:underline">302-235-1975</a></p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Mail className="text-green-700" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <a href="mailto:info@absolutepestservices.com" className="text-green-700 hover:underline">info@absolutepestservices.com</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <MapPin className="text-green-700" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mailing Address</h3>
                  <p className="text-gray-700">PO Box 8059<br />Newark, DE 19714</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Clock className="text-green-700" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Hours</h3>
                  <p className="text-gray-700">Monday – Friday: 7am – 6pm</p>
                  <p className="text-gray-700">Saturday: 8am – 4pm</p>
                  <p className="text-gray-700">24/7 Emergency Response</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-2xl p-8 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Service Online</h2>
              <p className="text-gray-600 mb-6">Fill out our quick service request form and we'll get back to you promptly.</p>
              <Link
                href="/request-service"
                className="bg-green-700 text-white font-bold px-6 py-4 rounded-xl text-center hover:bg-green-800 transition-colors text-lg"
              >
                Request Service Now →
              </Link>
              <p className="text-gray-500 text-sm mt-4 text-center">We typically respond within 1 business hour</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
