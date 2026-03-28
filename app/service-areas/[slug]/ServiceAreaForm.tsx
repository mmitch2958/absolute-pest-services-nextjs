'use client'

import ServiceRequestForm from '@/components/forms/ServiceRequestForm'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  phoneNumber: string
}

export default function ServiceAreaForm({ phoneNumber }: Props) {
  return (
    <Card className="bg-white shadow-xl">
      <CardContent className="p-6">
        <ServiceRequestForm />
      </CardContent>
    </Card>
  )
}
