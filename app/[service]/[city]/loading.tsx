export default function Loading() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-green-800 via-green-900 to-emerald-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="bg-white/10 rounded h-4 w-64 animate-pulse" />
          <div className="bg-white/10 rounded h-10 w-96 animate-pulse" />
          <div className="bg-white/10 rounded h-5 w-full max-w-xl animate-pulse" />
          <div className="flex gap-3 mt-6">
            <div className="bg-white/10 rounded h-12 w-48 animate-pulse" />
            <div className="bg-white/10 rounded h-12 w-44 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-200 rounded h-8 w-72 animate-pulse" />
            <div className="space-y-3">
              <div className="bg-gray-200 rounded h-4 w-full animate-pulse" />
              <div className="bg-gray-200 rounded h-4 w-5/6 animate-pulse" />
              <div className="bg-gray-200 rounded h-4 w-4/5 animate-pulse" />
            </div>
            <div className="bg-gray-200 rounded h-8 w-64 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded h-16 animate-pulse" />
              ))}
            </div>
          </div>
          <aside className="space-y-6">
            <div className="bg-gray-200 rounded-2xl h-96 animate-pulse" />
            <div className="bg-gray-200 rounded-xl h-40 animate-pulse" />
            <div className="bg-gray-200 rounded-xl h-40 animate-pulse" />
          </aside>
        </div>
      </div>
    </div>
  )
}
