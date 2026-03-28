import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import Header from "@/components/Header";
import { Shield, Star, Clock, MapPin, Phone } from "lucide-react";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Absolute Pest Services | Chester County PA</title>
        <meta name="description" content="Absolute Pest Services is a licensed, insured pest control company serving Chester County PA, Delaware County PA, Montgomery County PA, and New Castle County DE. 5-star rated, 24/7 emergency service." />
        <link rel="canonical" href="https://absolutepestservices.com/about" />
      </Helmet>
      <Header />
      <main>
        <section className="bg-green-800 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">About Absolute Pest Services</h1>
            <p className="text-xl text-green-100">Licensed, insured, and trusted pest control professionals serving southeastern Pennsylvania and Delaware.</p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Who We Are</h2>
              <p className="text-gray-700 mb-4">Absolute Pest Services is a locally owned and operated pest control company based in Chester County, Pennsylvania. We specialize in residential and commercial pest control, wildlife removal, termite treatment, bed bug elimination, and bat removal across southeastern PA and northern Delaware.</p>
              <p className="text-gray-700 mb-4">Our team of licensed technicians brings expertise, care, and integrity to every job. We treat your home or business like our own — using targeted, family-safe treatments and humane wildlife removal methods.</p>
              <p className="text-gray-700">We are fully licensed by the Pennsylvania Department of Agriculture and the Delaware Department of Agriculture, and carry comprehensive liability insurance for your protection.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                <Shield className="text-green-700 mt-1 shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900">Licensed & Insured</h3>
                  <p className="text-gray-600 text-sm">Licensed in PA and DE. Fully insured for your peace of mind.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                <Star className="text-green-700 mt-1 shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900">5-Star Rated</h3>
                  <p className="text-gray-600 text-sm">Consistently rated 5 stars by homeowners across Chester County and beyond.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                <Clock className="text-green-700 mt-1 shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900">24/7 Emergency Service</h3>
                  <p className="text-gray-600 text-sm">Pest emergencies don't wait — neither do we. Call anytime.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                <MapPin className="text-green-700 mt-1 shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900">Service Area</h3>
                  <p className="text-gray-600 text-sm">Chester County, Delaware County, Montgomery County PA and New Castle County DE.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Services</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "General Pest Control",
                "Termite Treatment & Inspection",
                "Bed Bug Elimination",
                "Wildlife Removal",
                "Rodent Control",
                "Bat Removal & Exclusion",
                "Ant & Wasp Control",
                "Mosquito Control",
                "Stink Bug Treatment",
              ].map((service) => (
                <div key={service} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700 text-sm">{service}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-green-800 text-white py-12 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-green-100 mb-6">Call us today or request service online. We're here to help.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="tel:4846432225" className="flex items-center gap-2 bg-white text-green-800 font-bold px-6 py-3 rounded-full hover:bg-green-50 transition-colors">
                <Phone size={18} />
                484-643-2225
              </a>
              <Link href="/request-service" className="border-2 border-white text-white font-bold px-6 py-3 rounded-full hover:bg-green-700 transition-colors">
                Request Service
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
