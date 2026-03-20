import logoImage from "@assets/Gemini_Generated_Image_79kk5t79kk5t79kk_1773967516916.png";

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const AbsoluteLogo = ({ className = "", size = 'medium' }: LogoProps) => {
  const dimensions = {
    small: { width: 60, height: 60 },
    medium: { width: 80, height: 80 },
    large: { width: 120, height: 120 }
  };

  const { width, height } = dimensions[size];

  return (
    <img
      src={logoImage}
      alt="Absolute Pest Services"
      width={width}
      height={height}
      className={`object-contain ${className}`}
    />
  );
};

export const AbsoluteLogoSimple = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center ${className}`}>
    <img
      src={logoImage}
      alt="Absolute Pest Services"
      className="h-20 w-auto object-contain"
    />
  </div>
);
