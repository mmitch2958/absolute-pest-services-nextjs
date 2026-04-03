import { Star, ExternalLink } from 'lucide-react'

// ─── UPDATE THESE with real reviews copied from the Google Business Profile ──
// To get the Leave-a-Review link: Go to Google Maps → search "Absolute Pest Services West Grove PA"
// → click "Share" → "Copy link". Or ask Google support for your Place ID review link.
const GOOGLE_REVIEW_URL =
  'https://search.google.com/local/writereview?placeid=ChIJxxxxxxxxxxxxxxxxxxxxxxxx'
  // ↑ Replace ChIJxxx... with your actual Google Place ID

const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/place/Absolute+Pest+Services/@39.8221,-75.8274,17z'

// ─── Replace review text/names with real ones from your Google listing ────────
const reviews = [
  {
    name: 'Mike T.',
    date: 'March 2025',
    rating: 5,
    text: 'Quick response, professional service. They removed a family of raccoons from our attic and sealed everything up so they couldn\'t get back in. Highly recommend for anyone dealing with wildlife.',
  },
  {
    name: 'Sarah L.',
    date: 'February 2025',
    rating: 5,
    text: 'Found termites the week before our home settlement. Absolute Pest Services came out the same day, treated the property, and provided all the documentation we needed. Literally saved our home sale.',
  },
  {
    name: 'James K.',
    date: 'January 2025',
    rating: 5,
    text: 'Had a bad bed bug situation after a trip. They came out fast, explained exactly what they\'d do, and treated the whole house. Haven\'t seen a bug since. Worth every penny.',
  },
  {
    name: 'Donna R.',
    date: 'December 2024',
    rating: 5,
    text: 'Called about a wasp nest right outside our back door. They were out the same afternoon, removed the nest, and treated the area. Tech was friendly and professional. Great local company.',
  },
  {
    name: 'Chris M.',
    date: 'November 2024',
    rating: 5,
    text: 'Used them for a rodent problem in our garage. Set traps, found the entry points, sealed everything. Follow-up visit a week later to make sure the problem was gone. Great communication throughout.',
  },
  {
    name: 'Amy S.',
    date: 'October 2024',
    rating: 5,
    text: 'Have been using Absolute Pest Services for two years for our quarterly pest control. Always on time, always thorough, and they actually explain what they\'re doing and why. Real pros.',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  )
}

export default function GoogleReviews() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-12">
          {/* Google G icon */}
          <div className="inline-flex items-center gap-2 mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-lg font-semibold text-gray-500">Google Reviews</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            What Our Customers Are Saying
          </h2>

          {/* Aggregate rating display */}
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-sm border border-gray-100 mb-3">
            <span className="text-3xl font-bold text-gray-900">5.0</span>
            <div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Based on Google Reviews</p>
            </div>
          </div>

          <div className="block">
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
            >
              See all reviews on Google
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar circle with initials */}
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-800 font-bold text-sm">
                      {review.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                    <p className="text-xs text-gray-400">{review.date}</p>
                  </div>
                </div>
                {/* Google G mark */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <StarRating rating={review.rating} />
              <p className="text-gray-600 text-sm leading-relaxed mt-3 flex-1">
                &ldquo;{review.text}&rdquo;
              </p>
            </div>
          ))}
        </div>

        {/* Leave a review CTA */}
        <div className="bg-white rounded-2xl border border-green-100 p-8 text-center shadow-sm">
          <div className="flex justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={22} className="text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Happy with Our Service?
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Your review helps other homeowners in Chester &amp; Delaware County find trusted pest
            control. It only takes 60 seconds and means a lot to our small, family-owned team.
          </p>
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="white"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white"/>
            </svg>
            Leave Us a Google Review
          </a>
          <p className="text-xs text-gray-400 mt-3">Opens Google — no account needed on mobile</p>
        </div>

      </div>
    </section>
  )
}
