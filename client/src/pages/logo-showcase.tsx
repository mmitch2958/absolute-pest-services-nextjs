import { LogoExamples } from "@/components/logo-examples";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function LogoShowcase() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[hsl(0,0%,98%)]">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="ghost" onClick={() => setLocation('/')}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold text-[hsl(210,13%,28%)] ml-4">
              Logo Design Options
            </h1>
          </div>
        </div>
      </header>
      
      <div className="max-w-5xl mx-auto">
        <LogoExamples />
        
        <div className="text-center p-8 bg-white mx-4 mb-8 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Each logo can be customized with:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>• Different colors</div>
            <div>• Various sizes</div>
            <div>• Alternative fonts</div>
            <div>• Layout adjustments</div>
          </div>
          <p className="mt-4 text-gray-600">
            Let me know which style you prefer and I can implement it throughout the website!
          </p>
        </div>
      </div>
    </div>
  );
}