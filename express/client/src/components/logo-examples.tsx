import { Shield, Bug, Home, Zap, Target, CheckCircle } from "lucide-react";
import { AbsoluteLogo } from "./absolute-logo";

// Logo Option 1: Shield with Bug (Security & Protection Theme)
export const LogoOption1 = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Shield Background */}
    <path 
      d="M10 15 L25 5 L40 15 L40 35 C40 45 25 55 25 55 S10 45 10 35 Z" 
      fill="hsl(132,48%,35%)" 
      stroke="hsl(132,48%,25%)" 
      strokeWidth="1"
    />
    {/* Bug Symbol */}
    <circle cx="25" cy="25" r="3" fill="white"/>
    <path d="M22 25 L19 22 M28 25 L31 22 M22 28 L19 31 M28 28 L31 31" stroke="white" strokeWidth="1.5"/>
    <line x1="25" y1="20" x2="25" y2="15" stroke="white" strokeWidth="1.5"/>
    <line x1="25" y1="30" x2="25" y2="35" stroke="white" strokeWidth="1.5"/>
    
    {/* Company Text */}
    <text x="55" y="25" fill="hsl(210,13%,28%)" fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif">
      ABSOLUTE
    </text>
    <text x="55" y="42" fill="hsl(132,48%,35%)" fontSize="12" fontWeight="600" fontFamily="Arial, sans-serif">
      PEST SERVICES
    </text>
    
    {/* Crossed Out Bug Effect */}
    <line x1="20" y1="20" x2="30" y2="30" stroke="red" strokeWidth="2"/>
  </svg>
);

// Logo Option 2: Modern Circular Design
export const LogoOption2 = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Circular Background */}
    <circle cx="30" cy="30" r="25" fill="hsl(207,73%,44%)" stroke="hsl(207,73%,34%)" strokeWidth="2"/>
    
    {/* House Icon */}
    <path d="M20 35 L30 20 L40 35 L38 35 L38 40 L22 40 L22 35 Z" fill="white"/>
    <rect x="26" y="35" width="8" height="5" fill="hsl(207,73%,44%)"/>
    
    {/* Protection Arc */}
    <path d="M15 30 Q30 10 45 30" stroke="hsl(132,48%,35%)" strokeWidth="3" fill="none"/>
    
    {/* Company Text */}
    <text x="65" y="25" fill="hsl(210,13%,28%)" fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif">
      ABSOLUTE
    </text>
    <text x="65" y="42" fill="hsl(207,73%,44%)" fontSize="12" fontWeight="600" fontFamily="Arial, sans-serif">
      PEST SERVICES
    </text>
  </svg>
);

// Logo Option 3: Target/Precision Theme
export const LogoOption3 = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Target Circles */}
    <circle cx="30" cy="30" r="25" fill="none" stroke="hsl(36,100%,47%)" strokeWidth="2"/>
    <circle cx="30" cy="30" r="18" fill="none" stroke="hsl(36,100%,47%)" strokeWidth="2"/>
    <circle cx="30" cy="30" r="11" fill="none" stroke="hsl(36,100%,47%)" strokeWidth="2"/>
    <circle cx="30" cy="30" r="4" fill="hsl(36,100%,47%)"/>
    
    {/* Bug in Center */}
    <circle cx="30" cy="30" r="2" fill="white"/>
    <path d="M28 30 L26 28 M32 30 L34 28 M28 32 L26 34 M32 32 L34 34" stroke="white" strokeWidth="1"/>
    
    {/* Crosshairs */}
    <line x1="5" y1="30" x2="15" y2="30" stroke="hsl(36,100%,47%)" strokeWidth="2"/>
    <line x1="45" y1="30" x2="55" y2="30" stroke="hsl(36,100%,47%)" strokeWidth="2"/>
    <line x1="30" y1="5" x2="30" y2="15" stroke="hsl(36,100%,47%)" strokeWidth="2"/>
    <line x1="30" y1="45" x2="30" y2="55" stroke="hsl(36,100%,47%)" strokeWidth="2"/>
    
    {/* Company Text */}
    <text x="65" y="25" fill="hsl(210,13%,28%)" fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif">
      ABSOLUTE
    </text>
    <text x="65" y="42" fill="hsl(36,100%,47%)" fontSize="12" fontWeight="600" fontFamily="Arial, sans-serif">
      PEST SERVICES
    </text>
  </svg>
);

// Logo Option 4: Professional Badge Style
export const LogoOption4 = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 220 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Badge Shape */}
    <path 
      d="M5 20 L15 10 L45 10 L55 20 L55 40 L45 50 L15 50 L5 40 Z" 
      fill="hsl(210,13%,28%)" 
      stroke="hsl(132,48%,35%)" 
      strokeWidth="2"
    />
    
    {/* Inner Badge */}
    <path 
      d="M10 22 L18 15 L42 15 L50 22 L50 38 L42 45 L18 45 L10 38 Z" 
      fill="white"
    />
    
    {/* Letter A */}
    <text x="30" y="37" fill="hsl(210,13%,28%)" fontSize="20" fontWeight="bold" fontFamily="Arial, sans-serif" textAnchor="middle">
      A
    </text>
    
    {/* Company Text */}
    <text x="70" y="22" fill="hsl(210,13%,28%)" fontSize="16" fontWeight="bold" fontFamily="Arial, sans-serif">
      ABSOLUTE
    </text>
    <text x="70" y="35" fill="hsl(132,48%,35%)" fontSize="11" fontWeight="600" fontFamily="Arial, sans-serif">
      PEST SERVICES
    </text>
    <text x="70" y="47" fill="hsl(210,13%,28%)" fontSize="9" fontFamily="Arial, sans-serif">
      PROFESSIONAL • RELIABLE
    </text>
  </svg>
);

// Logo Option 5: Minimalist Modern
export const LogoOption5 = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Geometric A */}
    <path d="M15 50 L30 10 L45 50 M22 35 L38 35" stroke="hsl(132,48%,35%)" strokeWidth="4" fill="none"/>
    
    {/* Dot on A */}
    <circle cx="30" cy="15" r="3" fill="hsl(36,100%,47%)"/>
    
    {/* Company Text */}
    <text x="60" y="25" fill="hsl(210,13%,28%)" fontSize="18" fontWeight="300" fontFamily="Arial, sans-serif">
      ABSOLUTE
    </text>
    <text x="60" y="42" fill="hsl(132,48%,35%)" fontSize="12" fontWeight="600" fontFamily="Arial, sans-serif">
      PEST SERVICES
    </text>
  </svg>
);

// Logo Option 6: Bug Zapper Theme
export const LogoOption6 = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Electric Grid */}
    <rect x="10" y="15" width="30" height="30" fill="none" stroke="hsl(207,73%,44%)" strokeWidth="2" rx="5"/>
    <line x1="15" y1="20" x2="35" y2="20" stroke="hsl(207,73%,44%)" strokeWidth="1"/>
    <line x1="15" y1="25" x2="35" y2="25" stroke="hsl(207,73%,44%)" strokeWidth="1"/>
    <line x1="15" y1="30" x2="35" y2="30" stroke="hsl(207,73%,44%)" strokeWidth="1"/>
    <line x1="15" y1="35" x2="35" y2="35" stroke="hsl(207,73%,44%)" strokeWidth="1"/>
    <line x1="15" y1="40" x2="35" y2="40" stroke="hsl(207,73%,44%)" strokeWidth="1"/>
    
    {/* Electric Zap */}
    <path d="M22 18 L28 25 L24 25 L30 32" stroke="hsl(36,100%,47%)" strokeWidth="2" fill="none"/>
    
    {/* Bug Getting Zapped */}
    <circle cx="26" cy="28" r="2" fill="hsl(36,100%,47%)"/>
    
    {/* Company Text */}
    <text x="55" y="25" fill="hsl(210,13%,28%)" fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif">
      ABSOLUTE
    </text>
    <text x="55" y="42" fill="hsl(207,73%,44%)" fontSize="12" fontWeight="600" fontFamily="Arial, sans-serif">
      PEST SERVICES
    </text>
  </svg>
);

export const LogoExamples = () => {
  return (
    <div className="space-y-8 p-8 bg-gray-50">
      <h2 className="text-2xl font-bold text-center mb-8">Logo Design Options</h2>
      
      <div className="grid gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border-4 border-[hsl(132,48%,35%)]">
          <h3 className="text-lg font-semibold mb-4 text-[hsl(132,48%,35%)]">⭐ NEW: Circular Badge Style (Based on Your Reference)</h3>
          <div className="flex justify-center mb-4">
            <AbsoluteLogo size="large" />
          </div>
          <p className="text-sm text-gray-600 mt-2">Circular badge design with pest silhouettes and curved text, inspired by your reference image</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Option 1: Shield Protection</h3>
          <LogoOption1 className="h-16" />
          <p className="text-sm text-gray-600 mt-2">Emphasizes security and protection with a shield design</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Option 2: Home Protection Circle</h3>
          <LogoOption2 className="h-16" />
          <p className="text-sm text-gray-600 mt-2">Modern circular design focusing on home protection</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Option 3: Precision Target</h3>
          <LogoOption3 className="h-16" />
          <p className="text-sm text-gray-600 mt-2">Target crosshairs emphasizing precision and accuracy</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Option 4: Professional Badge</h3>
          <LogoOption4 className="h-16" />
          <p className="text-sm text-gray-600 mt-2">Professional badge style with company initial</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Option 5: Minimalist Modern</h3>
          <LogoOption5 className="h-16" />
          <p className="text-sm text-gray-600 mt-2">Clean, minimal design with geometric letter A</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Option 6: Electric Zapper</h3>
          <LogoOption6 className="h-16" />
          <p className="text-sm text-gray-600 mt-2">Bug zapper theme with electric grid and lightning</p>
        </div>
      </div>
    </div>
  );
};