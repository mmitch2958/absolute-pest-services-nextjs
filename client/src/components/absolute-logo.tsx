interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const AbsoluteLogo = ({ className = "", size = 'medium' }: LogoProps) => {
  const dimensions = {
    small: { width: 120, height: 120, fontSize: 12, strokeWidth: 2 },
    medium: { width: 160, height: 160, fontSize: 16, strokeWidth: 2.5 },
    large: { width: 200, height: 200, fontSize: 20, strokeWidth: 3 }
  };

  const { width, height, fontSize, strokeWidth } = dimensions[size];
  const center = width / 2;
  const radius = width * 0.35;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Circle */}
      <circle 
        cx={center} 
        cy={center} 
        r={width * 0.48} 
        fill="none" 
        stroke="hsl(132,48%,35%)" 
        strokeWidth={strokeWidth}
      />
      
      {/* Inner Circle */}
      <circle 
        cx={center} 
        cy={center} 
        r={radius} 
        fill="white" 
        stroke="hsl(132,48%,35%)" 
        strokeWidth={strokeWidth * 0.8}
      />

      {/* Cross Lines */}
      <line 
        x1={center - radius * 0.7} 
        y1={center - radius * 0.7} 
        x2={center + radius * 0.7} 
        y2={center + radius * 0.7} 
        stroke="hsl(132,48%,35%)" 
        strokeWidth={strokeWidth * 0.6}
      />
      <line 
        x1={center - radius * 0.7} 
        y1={center + radius * 0.7} 
        x2={center + radius * 0.7} 
        y2={center - radius * 0.7} 
        stroke="hsl(132,48%,35%)" 
        strokeWidth={strokeWidth * 0.6}
      />

      {/* Pest Silhouettes */}
      
      {/* Top: Ant */}
      <g transform={`translate(${center}, ${center - radius * 0.5}) scale(${size === 'small' ? 0.6 : size === 'large' ? 1.2 : 1})`}>
        <ellipse cx="0" cy="-2" rx="3" ry="2" fill="black"/>
        <ellipse cx="0" cy="2" rx="4" ry="3" fill="black"/>
        <ellipse cx="0" cy="8" rx="3" ry="4" fill="black"/>
        <line x1="-4" y1="0" x2="-7" y2="-3" stroke="black" strokeWidth="1"/>
        <line x1="4" y1="0" x2="7" y2="-3" stroke="black" strokeWidth="1"/>
        <line x1="-3" y1="5" x2="-6" y2="3" stroke="black" strokeWidth="1"/>
        <line x1="3" y1="5" x2="6" y2="3" stroke="black" strokeWidth="1"/>
        <line x1="-2" y1="10" x2="-5" y2="8" stroke="black" strokeWidth="1"/>
        <line x1="2" y1="10" x2="5" y2="8" stroke="black" strokeWidth="1"/>
      </g>

      {/* Right: Wasp/Fly */}
      <g transform={`translate(${center + radius * 0.5}, ${center}) scale(${size === 'small' ? 0.6 : size === 'large' ? 1.2 : 1})`}>
        <ellipse cx="0" cy="0" rx="6" ry="3" fill="black"/>
        <ellipse cx="0" cy="0" rx="4" ry="2" fill="hsl(36,100%,47%)"/>
        <ellipse cx="-8" cy="-2" rx="4" ry="1.5" fill="black" opacity="0.3"/>
        <ellipse cx="-8" cy="2" rx="4" ry="1.5" fill="black" opacity="0.3"/>
        <line x1="-6" y1="0" x2="-10" y2="-2" stroke="black" strokeWidth="1"/>
        <line x1="-6" y1="0" x2="-10" y2="2" stroke="black" strokeWidth="1"/>
      </g>

      {/* Bottom: Spider */}
      <g transform={`translate(${center}, ${center + radius * 0.5}) scale(${size === 'small' ? 0.6 : size === 'large' ? 1.2 : 1})`}>
        <ellipse cx="0" cy="0" rx="4" ry="6" fill="black"/>
        <circle cx="0" cy="-3" r="3" fill="black"/>
        <line x1="-4" y1="-2" x2="-8" y2="-6" stroke="black" strokeWidth="1.5"/>
        <line x1="4" y1="-2" x2="8" y2="-6" stroke="black" strokeWidth="1.5"/>
        <line x1="-4" y1="0" x2="-8" y2="-2" stroke="black" strokeWidth="1.5"/>
        <line x1="4" y1="0" x2="8" y2="-2" stroke="black" strokeWidth="1.5"/>
        <line x1="-4" y1="2" x2="-8" y2="6" stroke="black" strokeWidth="1.5"/>
        <line x1="4" y1="2" x2="8" y2="6" stroke="black" strokeWidth="1.5"/>
        <line x1="-3" y1="4" x2="-6" y2="8" stroke="black" strokeWidth="1.5"/>
        <line x1="3" y1="4" x2="6" y2="8" stroke="black" strokeWidth="1.5"/>
      </g>

      {/* Left: Mouse/Rat */}
      <g transform={`translate(${center - radius * 0.5}, ${center}) scale(${size === 'small' ? 0.6 : size === 'large' ? 1.2 : 1})`}>
        <ellipse cx="0" cy="0" rx="6" ry="4" fill="black"/>
        <circle cx="4" cy="-2" r="2.5" fill="black"/>
        <circle cx="6" cy="-3" r="1" fill="black"/>
        <path d="M-6 0 Q-10 -2 -12 0 Q-10 2 -6 0" fill="black"/>
        <line x1="7" y1="-2" x2="9" y2="-4" stroke="black" strokeWidth="1"/>
        <line x1="7" y1="-1" x2="9" y2="-2" stroke="black" strokeWidth="1"/>
        <line x1="7" y1="0" x2="9" y2="0" stroke="black" strokeWidth="1"/>
      </g>

      {/* Curved Text */}
      <defs>
        <path id="topCurve" d={`M ${center - radius * 1.3} ${center} A ${radius * 1.3} ${radius * 1.3} 0 0 1 ${center + radius * 1.3} ${center}`}/>
        <path id="bottomCurve" d={`M ${center + radius * 1.3} ${center} A ${radius * 1.3} ${radius * 1.3} 0 0 1 ${center - radius * 1.3} ${center}`}/>
      </defs>
      
      <text fontSize={fontSize} fontWeight="bold" fontFamily="Arial, sans-serif" fill="hsl(132,48%,35%)">
        <textPath href="#topCurve" startOffset="50%" textAnchor="middle">
          ABSOLUTE
        </textPath>
      </text>
      
      <text fontSize={fontSize} fontWeight="bold" fontFamily="Arial, sans-serif" fill="hsl(132,48%,35%)">
        <textPath href="#bottomCurve" startOffset="50%" textAnchor="middle">
          PEST SERVICES
        </textPath>
      </text>
    </svg>
  );
};

// Simplified version for headers/smaller spaces
export const AbsoluteLogoSimple = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center space-x-3 ${className}`}>
    <AbsoluteLogo size="small" />
    <div className="flex flex-col">
      <span className="text-lg font-bold text-[hsl(210,13%,28%)]">ABSOLUTE</span>
      <span className="text-sm font-semibold text-[hsl(132,48%,35%)]">PEST SERVICES</span>
    </div>
  </div>
);