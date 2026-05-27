import ServiceRequestForm from './ServiceRequestForm'

interface ConversionCardProps {
  heading?: string
  subheading?: string
  defaultService?: string
  trustItems?: string[]
}

const defaultTrustItems = [
  'Response within 1–2 hours',
  'Licensed & insured in PA & DE',
  'No commitment required',
]

export default function ConversionCard({
  heading = 'Get a Free Estimate Today',
  subheading = 'Free Inspection · No Obligation',
  defaultService,
  trustItems = defaultTrustItems,
}: ConversionCardProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-green-700 shadow-xl overflow-hidden">
      {/* Header bar */}
      <div className="bg-green-700 px-6 py-4">
        <p className="text-green-200 text-xs font-bold uppercase tracking-widest mb-1">
          {subheading}
        </p>
        <h2 className="text-white font-bold text-xl leading-tight">{heading}</h2>
      </div>

      {/* Trust strip */}
      <div className="bg-green-50 border-b border-green-100 px-6 py-2 flex flex-wrap gap-x-4 gap-y-1">
        {trustItems.map((item) => (
          <span key={item} className="text-xs text-green-800 font-medium flex items-center gap-1">
            ✓ {item}
          </span>
        ))}
      </div>

      {/* Form body */}
      <div className="px-6 py-6">
        <ServiceRequestForm defaultService={defaultService} />
      </div>

      {/* Social proof footer */}
      <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 text-center">
        <p className="text-xs text-gray-500">⭐⭐⭐⭐⭐ Trusted by 500+ PA &amp; DE homeowners</p>
      </div>
    </div>
  )
}
