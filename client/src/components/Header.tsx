import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AbsoluteLogoSimple } from "@/components/absolute-logo";
import QuoteRequestModal from "@/components/quote-request-modal";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    if (window.location.pathname !== '/') {
      window.location.href = '/#' + sectionId;
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
            <AbsoluteLogoSimple />
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <button onClick={() => scrollToSection('home')} className="text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium">Home</button>
            <button onClick={() => scrollToSection('services')} className="text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium">Services</button>
            <button onClick={() => scrollToSection('areas')} className="text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium">Service Areas</button>
            <button onClick={() => window.location.href = '/service-areas'} className="text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium">Coverage Areas</button>
            <button onClick={() => window.location.href = '/blog'} className="text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium">Blog</button>
            <button onClick={() => scrollToSection('about')} className="text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium">About</button>
            <button onClick={() => scrollToSection('contact')} className="text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium">Contact</button>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-sm text-[hsl(210,13%,28%)]">24/7 Emergency Service</span>
              <span className="text-lg font-semibold text-[hsl(132,48%,35%)]">484-643-2225</span>
            </div>
            <QuoteRequestModal>
              <Button className="bg-[hsl(36,100%,47%)] text-white hover:bg-[hsl(36,100%,37%)] font-medium">
                Get Quote
              </Button>
            </QuoteRequestModal>
          </div>

          <button 
            className="md:hidden text-[hsl(210,13%,28%)]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            <button onClick={() => scrollToSection('home')} className="block w-full text-left text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium py-2">Home</button>
            <button onClick={() => scrollToSection('services')} className="block w-full text-left text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium py-2">Services</button>
            <button onClick={() => scrollToSection('areas')} className="block w-full text-left text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium py-2">Service Areas</button>
            <button onClick={() => window.location.href = '/service-areas'} className="block w-full text-left text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium py-2">Coverage Areas</button>
            <button onClick={() => window.location.href = '/blog'} className="block w-full text-left text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium py-2">Blog</button>
            <button onClick={() => scrollToSection('about')} className="block w-full text-left text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium py-2">About</button>
            <button onClick={() => scrollToSection('contact')} className="block w-full text-left text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium py-2">Contact</button>
            <div className="pt-2 border-t">
              <a href="tel:484-643-2225" className="block text-[hsl(132,48%,35%)] font-semibold py-2">Call: 484-643-2225</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
