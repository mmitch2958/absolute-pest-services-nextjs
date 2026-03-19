import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Calendar, ArrowLeft, Shield, Bed, Clock, CheckCircle, Bug, Zap } from "lucide-react";
import { AbsoluteLogoSimple } from "@/components/absolute-logo";
import ScheduleInspectionModal from "@/components/schedule-inspection-modal";
import QuoteRequestModal from "@/components/quote-request-modal";
import LocalSEO from "@/components/local-seo";

export default function BedBugTreatment() {
  return (
    <div className="min-h-screen bg-[hsl(0,0%,98%)]">
      <LocalSEO 
        title="Professional Bed Bug Treatment & Extermination Services"
        description="Expert bed bug treatment and extermination services in PA, DE, MD. Comprehensive inspections, heat treatments, and effective elimination of bed bugs. Licensed professionals with proven results."
        serviceName="Bed Bug Treatment"
        serviceArea="Chester County PA, Delaware County PA, Montgomery County PA, New Castle County DE"
      />
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
              <AbsoluteLogoSimple />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-sm text-[hsl(210,13%,28%)]">24/7 Emergency Service</span>
                <span className="text-lg font-semibold text-[hsl(132,48%,35%)]">610-869-3000</span>
              </div>
              <QuoteRequestModal>
                <Button className="bg-[hsl(36,100%,47%)] text-white hover:bg-[hsl(36,100%,37%)] font-medium">
                  Get Quote
                </Button>
              </QuoteRequestModal>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[hsl(207,73%,44%)] to-[hsl(207,73%,34%)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Complete Bed Bug Elimination
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Get back to peaceful sleep with our proven bed bug treatment methods. 
            We use the latest technology and techniques to eliminate bed bugs completely.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-[hsl(207,73%,44%)] px-8 py-4 text-lg font-semibold hover:bg-gray-100">
              <Phone className="mr-2 h-5 w-5" />
              Call Now: 610-869-3000
            </Button>
            <ScheduleInspectionModal>
              <Button className="bg-[hsl(36,100%,47%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(36,100%,37%)]">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Inspection
              </Button>
            </ScheduleInspectionModal>
          </div>
        </div>
      </section>

      {/* Service Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[hsl(210,13%,28%)] mb-6">
                Advanced Bed Bug Treatment Solutions
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Bed bugs are persistent pests that require professional expertise to eliminate completely. 
                Our comprehensive treatment approach combines multiple proven methods to ensure complete 
                eradication and prevent re-infestation.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We use heat treatment, chemical applications, and integrated pest management techniques 
                to target bed bugs at all life stages. Our treatments are safe for families and pets 
                while being deadly effective against bed bugs. We proudly serve West Chester, Wilmington, 
                Norristown, and communities throughout Chester County, Delaware County, and beyond.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[hsl(207,73%,44%)] rounded-full flex items-center justify-center mr-3">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[hsl(210,13%,28%)] font-medium">Heat Treatment</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[hsl(207,73%,44%)] rounded-full flex items-center justify-center mr-3">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[hsl(210,13%,28%)] font-medium">Safe & Effective</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[hsl(207,73%,44%)] rounded-full flex items-center justify-center mr-3">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[hsl(210,13%,28%)] font-medium">Fast Results</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[hsl(207,73%,44%)] rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[hsl(210,13%,28%)] font-medium">Guaranteed</span>
                </div>
              </div>
            </div>
            
            <div>
              <img 
                src="https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Bed bug treatment professional" 
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Signs of Bed Bugs */}
      <section className="py-20 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[hsl(210,13%,28%)] mb-4">
              Signs You Have Bed Bugs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Early detection is key to effective treatment. Watch for these common signs of bed bug infestation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Bite Marks",
                description: "Red, itchy welts on skin, often in clusters or lines, typically on exposed areas while sleeping.",
                color: "bg-red-600"
              },
              {
                title: "Blood Stains",
                description: "Small reddish or rust-colored stains on sheets, pillowcases, or mattresses from crushed bugs.",
                color: "bg-[hsl(207,73%,44%)]"
              },
              {
                title: "Dark Spots",
                description: "Small dark or black spots on mattresses, bed frames, or nearby furniture (bed bug excrement).",
                color: "bg-gray-600"
              },
              {
                title: "Sweet Odor",
                description: "A musty, sweet smell in heavily infested rooms, often described as like berries or almonds.",
                color: "bg-[hsl(36,100%,47%)]"
              },
              {
                title: "Eggshells",
                description: "Tiny eggshells, shed skins, or live bugs in mattress seams, bed frames, or furniture cracks.",
                color: "bg-green-600"
              },
              {
                title: "Unexplained Bites",
                description: "Waking up with new bites that weren't there before bed, especially during warmer months.",
                color: "bg-purple-600"
              }
            ].map((sign, index) => (
              <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${sign.color} rounded-full flex items-center justify-center mb-4`}>
                    <Bug className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[hsl(210,13%,28%)] mb-3">
                    {sign.title}
                  </h3>
                  <p className="text-gray-600">
                    {sign.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Treatment Methods */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[hsl(210,13%,28%)] mb-4">
              Our Proven Treatment Methods
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We use multiple treatment approaches to ensure complete elimination of bed bugs at all life stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Heat Treatment",
                description: "Whole-room heat treatment raises temperatures to lethal levels for bed bugs, penetrating deep into furniture and cracks where chemicals can't reach.",
                features: ["Kills all life stages", "Chemical-free option", "Single treatment", "Immediate results"],
                color: "bg-[hsl(36,100%,47%)]"
              },
              {
                title: "Chemical Treatment",
                description: "Targeted application of EPA-approved insecticides designed specifically for bed bugs, applied to harborage areas and travel routes.",
                features: ["Long-lasting protection", "Multiple formulations", "Safe for families", "Residual effects"],
                color: "bg-[hsl(207,73%,44%)]"
              },
              {
                title: "Steam Treatment",
                description: "High-temperature steam application that kills bed bugs and eggs on contact, perfect for mattresses and upholstered furniture.",
                features: ["Instant kill", "No chemicals", "Deep penetration", "Furniture safe"],
                color: "bg-[hsl(132,48%,35%)]"
              },
              {
                title: "Integrated Approach",
                description: "Combination of multiple methods tailored to your specific situation, ensuring the most effective treatment possible.",
                features: ["Customized solution", "Maximum effectiveness", "Prevention focused", "Follow-up included"],
                color: "bg-purple-600"
              }
            ].map((method, index) => (
              <Card key={index} className="bg-[hsl(0,0%,98%)]">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${method.color} rounded-full flex items-center justify-center mb-6`}>
                    <Bed className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[hsl(210,13%,28%)] mb-4">
                    {method.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {method.description}
                  </p>
                  <ul className="space-y-2">
                    {method.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-[hsl(132,48%,35%)] mr-2" />
                        <span className="text-[hsl(210,13%,28%)]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[hsl(207,73%,44%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Don't Let Bed Bugs Ruin Your Sleep
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Act fast - bed bugs multiply quickly. Our expert technicians are ready to eliminate 
            your bed bug problem with proven, effective treatments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-[hsl(207,73%,44%)] px-8 py-4 text-lg font-semibold hover:bg-gray-100">
              <Phone className="mr-2 h-5 w-5" />
              Call Now: 610-869-3000
            </Button>
            <ScheduleInspectionModal>
              <Button className="bg-[hsl(36,100%,47%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(36,100%,37%)]">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Free Inspection
              </Button>
            </ScheduleInspectionModal>
          </div>
        </div>
      </section>
    </div>
  );
}