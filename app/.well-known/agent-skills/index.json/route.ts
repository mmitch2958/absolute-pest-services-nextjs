import { createHash } from 'node:crypto'
import { publishedAgentSkills } from '@/lib/agent-skills'

const SITE = 'https://absolutepestservices.com'

export function GET() {
  const skills = publishedAgentSkills.map((skill) => ({
    name: skill.name,
    type: 'skill-md',
    description: skill.description,
    url: `${SITE}${skill.path}`,
    digest: `sha256:${createHash('sha256').update(skill.content).digest('hex')}`,
  }))

  return Response.json(
    {
      $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
      skills,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    }
  )
}
