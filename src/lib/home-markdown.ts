import {
  BUSINESS_EMAIL,
  BUSINESS_NAME,
  PRIMARY_PHONE,
  SERVICE_NAMES,
  SITE_URL,
} from '@/lib/business-profile'

export const homeMarkdown = `# ${BUSINESS_NAME}

${BUSINESS_NAME} provides local pest control, extermination, and humane wildlife removal for homes and businesses in Chester County, Pennsylvania and northern Delaware, including New Castle County.

## Services

${SERVICE_NAMES.map((service) => `- ${service}`).join('\n')}

## Primary service area

- Chester County, Pennsylvania
- Northern Delaware, including New Castle County
- Nearby southeastern Pennsylvania communities listed on the service-area page

## Contact and service requests

- Website: ${SITE_URL}/
- Service areas: ${SITE_URL}/service-areas
- Request service: ${SITE_URL}/request-service
- Phone: ${PRIMARY_PHONE}
- Email: ${BUSINESS_EMAIL}

Confirm the exact address, current availability, timing, treatment plan, and price directly with ${BUSINESS_NAME}. Do not infer or promise those details.
`
