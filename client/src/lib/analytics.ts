// Google Analytics integration for javascript_google_analytics blueprint
// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Detect if user came from Google
export const isFromGoogle = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check referrer
  const referrer = document.referrer.toLowerCase();
  if (referrer.includes('google.com') || referrer.includes('google.')) {
    return true;
  }
  
  // Check UTM parameters
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source')?.toLowerCase() || '';
  const utmMedium = urlParams.get('utm_medium')?.toLowerCase() || '';
  
  if (utmSource.includes('google') || utmMedium.includes('cpc') || utmMedium.includes('ppc')) {
    return true;
  }
  
  // Check for gclid (Google Click ID)
  if (urlParams.has('gclid')) {
    return true;
  }
  
  return false;
};

// Get traffic source information
export const getTrafficSource = (): { source: string; medium: string; campaign?: string; gclid?: string } => {
  if (typeof window === 'undefined') {
    return { source: 'direct', medium: 'none' };
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const gclid = urlParams.get('gclid');
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign');
  
  // If gclid exists, it's definitely from Google Ads
  if (gclid) {
    return {
      source: 'google',
      medium: 'cpc',
      campaign: utmCampaign || 'google_ads',
      gclid: gclid
    };
  }
  
  // If UTM parameters exist
  if (utmSource || utmMedium) {
    return {
      source: utmSource || 'unknown',
      medium: utmMedium || 'unknown',
      campaign: utmCampaign || undefined
    };
  }
  
  // Check referrer
  const referrer = document.referrer.toLowerCase();
  if (referrer) {
    if (referrer.includes('google.com') || referrer.includes('google.')) {
      return { source: 'google', medium: 'organic' };
    }
    return { source: 'referral', medium: new URL(referrer).hostname };
  }
  
  return { source: 'direct', medium: 'none' };
};

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    return;
  }

  // Add Google Analytics script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(script2);
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url
  });
};

// Track events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  // Get traffic source information
  const trafficSource = getTrafficSource();
  const fromGoogle = isFromGoogle();
  
  // Push to dataLayer for Google Tag Manager (for Google Ads conversion tracking)
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    
    // Build event data
    const eventData: any = {
      event: action,
      event_category: category,
      event_label: label,
      value: value,
      // Always include traffic source for all events
      traffic_source: trafficSource.source,
      traffic_medium: trafficSource.medium,
    };
    
    // If from Google, add additional tracking data
    if (fromGoogle) {
      eventData.from_google = true;
      eventData.user_source = 'google';
      
      // Add campaign if available
      if (trafficSource.campaign) {
        eventData.campaign = trafficSource.campaign;
      }
      
      // Add Google Click ID if available (critical for conversion tracking)
      if (trafficSource.gclid) {
        eventData.gclid = trafficSource.gclid;
      }
    }
    
    window.dataLayer.push(eventData);
  }
  
  // Also track in Google Analytics
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    traffic_source: trafficSource.source,
    traffic_medium: trafficSource.medium,
  });
};