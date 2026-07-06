import ServiceRequestForm from './ServiceRequestForm'
import { CheckCircle2, Clock, ShieldCheck } from 'lucide-react'

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
  subheading = 'Free Quote · No Obligation',
  defaultService,
  trustItems = defaultTrustItems,
}: ConversionCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-green-900/10 bg-white shadow-2xl shadow-green-950/10">
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-slate-900 px-5 py-5 text-white sm:px-6">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-100">
          <Clock className="h-3.5 w-3.5" />
          {subheading}
        </div>
        <h2 className="text-2xl font-bold leading-tight">{heading}</h2>
        <p className="mt-2 text-sm leading-relaxed text-green-50/90">
          Tell us what is happening and where. APS will follow up quickly with the next best step.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 border-b border-green-100 bg-green-50 px-5 py-3 text-xs font-semibold text-green-900 sm:grid-cols-3 sm:px-6">
        {trustItems.map((item) => (
          <span key={item} className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-700" />
            {item}
          </span>
        ))}
      </div>

      <div className="px-5 py-5 sm:px-6">
        <ServiceRequestForm defaultService={defaultService} />
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-gray-100 bg-gray-50 px-5 py-3 text-center text-xs font-medium text-gray-600">
        <ShieldCheck className="h-4 w-4 text-green-700" />
        Licensed, insured, and trusted by PA &amp; DE homeowners
      </div>
    </div>
  )
}
