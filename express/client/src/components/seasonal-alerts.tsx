import { AlertCircle, Bug, Snowflake, Sun, Leaf, Flower, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function SeasonalAlerts() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentAlert, setCurrentAlert] = useState<{
    season: string;
    icon: JSX.Element;
    title: string;
    message: string;
    color: string;
  } | null>(null);

  useEffect(() => {
    const month = new Date().getMonth() + 1; // 1-12
    
    let alert = null;
    
    // Spring (March-May)
    if (month >= 3 && month <= 5) {
      alert = {
        season: "Spring",
        icon: <Flower className="w-5 h-5" />,
        title: "Spring Pest Alert: Ants & Termites",
        message: "Spring is peak season for ant and termite activity. Schedule your inspection now to prevent infestations.",
        color: "bg-green-50 border-green-200 text-green-900",
      };
    }
    // Summer (June-August)
    else if (month >= 6 && month <= 8) {
      alert = {
        season: "Summer",
        icon: <Sun className="w-5 h-5" />,
        title: "Summer Pest Alert: Mosquitoes & Wasps",
        message: "Protect your family from mosquitoes and stinging insects. Get your yard treated today for a pest-free summer.",
        color: "bg-yellow-50 border-yellow-200 text-yellow-900",
      };
    }
    // Fall (September-November)
    else if (month >= 9 && month <= 11) {
      alert = {
        season: "Fall",
        icon: <Leaf className="w-5 h-5" />,
        title: "Fall Pest Alert: Rodents & Spiders",
        message: "Rodents and spiders seek shelter indoors as temperatures drop. Seal entry points before winter arrives.",
        color: "bg-orange-50 border-orange-200 text-orange-900",
      };
    }
    // Winter (December-February)
    else {
      alert = {
        season: "Winter",
        icon: <Snowflake className="w-5 h-5" />,
        title: "Winter Pest Alert: Indoor Pests",
        message: "Rodents, cockroaches, and other pests seek warmth indoors during winter. Schedule your inspection today.",
        color: "bg-blue-50 border-blue-200 text-blue-900",
      };
    }
    
    setCurrentAlert(alert);
  }, []);

  if (!isVisible || !currentAlert) {
    return null;
  }

  return (
    <div className={`border-2 rounded-lg p-4 mb-6 ${currentAlert.color}`} data-testid="alert-seasonal">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5" data-testid="icon-season">
            {currentAlert.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4" />
              <h3 className="font-bold" data-testid="text-alert-title">
                {currentAlert.title}
              </h3>
            </div>
            <p className="text-sm mb-3" data-testid="text-alert-message">
              {currentAlert.message}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                data-testid="button-calculator"
                onClick={() => window.location.href = '/#contact'}
              >
                <Bug className="w-4 h-4 mr-1" />
                Get Estimate
              </Button>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700" 
                data-testid="button-schedule"
                onClick={() => window.location.href = '/#contact'}
              >
                Schedule Inspection
              </Button>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
          data-testid="button-close-alert"
          aria-label="Close alert"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
