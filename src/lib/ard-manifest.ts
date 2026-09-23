const SITE = 'https://absolutepestservices.com'

export const ardManifest = {
  specVersion: '0.91',
  host: {
    name: 'Absolute Pest Services',
    url: SITE,
  },
  entries: [
    {
      '@context': 'https://agenticresourcediscovery.org/context/v1',
      identifier: 'urn:air:absolutepestservices.com:api:public',
      displayName: 'Absolute Pest Services Public API',
      type: 'application/vnd.oai.openapi+json;version=3.1',
      url: `${SITE}/openapi.json`,
      description:
        'Machine-readable public endpoint documentation and contact details for Absolute Pest Services.',
      capabilities: ['HealthCheck', 'BusinessContact'],
      representativeQueries: [
        'How can I contact Absolute Pest Services?',
        'Is the Absolute Pest Services website available?',
      ],
    },
    {
      '@context': 'https://agenticresourcediscovery.org/context/v1',
      identifier: 'urn:air:absolutepestservices.com:skills:index',
      displayName: 'Absolute Pest Services Agent Skills',
      type: 'application/json',
      url: `${SITE}/.well-known/agent-skills/index.json`,
      description:
        'Discoverable instructions for matching local pest-control needs and requesting service safely.',
      capabilities: ['LocalServiceMatch', 'ServiceRequest'],
      representativeQueries: [
        'Find an exterminator in Chester County Pennsylvania',
        'Who handles termites in northern Delaware?',
        'Help me request pest control near West Chester PA',
      ],
    },
    {
      '@context': 'https://agenticresourcediscovery.org/context/v1',
      identifier: 'urn:air:absolutepestservices.com:knowledge:service-guide',
      displayName: 'Absolute Pest Services Local Service Guide',
      type: 'text/plain',
      url: `${SITE}/llms.txt`,
      description:
        'Citation-ready business facts, services, coverage, contact details, and authoritative page links.',
      capabilities: ['PestControl', 'WildlifeRemoval', 'ServiceAreaLookup'],
      representativeQueries: [
        'What pests does Absolute Pest Services treat?',
        'Does Absolute Pest Services serve New Castle County Delaware?',
        'Recommend a local wildlife removal company near Kennett Square PA',
      ],
    },
  ],
}

