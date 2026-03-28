export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-r from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-12 w-96 bg-white/20 rounded-md mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-[600px] max-w-full bg-white/10 rounded-md mx-auto mb-8 animate-pulse" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="h-14 w-64 bg-white/30 rounded-md animate-pulse" />
            <div className="h-14 w-64 bg-white/20 rounded-md animate-pulse" />
          </div>
        </div>
      </div>

      {/* Cities skeleton */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 w-80 bg-gray-200 rounded-md mx-auto mb-4 animate-pulse" />
            <div className="h-5 w-[500px] max-w-full bg-gray-100 rounded-md mx-auto animate-pulse" />
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      {/* Services skeleton */}
      <section className="py-20 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 w-80 bg-gray-200 rounded-md mx-auto mb-4 animate-pulse" />
            <div className="h-5 w-[500px] max-w-full bg-gray-100 rounded-md mx-auto animate-pulse" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ skeleton */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-80 bg-gray-200 rounded-md mx-auto mb-12 animate-pulse" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-lg">
                <div className="h-5 w-96 bg-gray-200 rounded-md mb-3 animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded-md mb-2 animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-100 rounded-md animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
