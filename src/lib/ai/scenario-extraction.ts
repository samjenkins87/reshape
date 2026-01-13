import Anthropic from '@anthropic-ai/sdk'

export interface ExtractedScenario {
  name: string
  fte: number
  staffCost: number
  revenue: number
  avgSalary: number
  aiInvestment: number
  description: string
  confidence: Record<string, 'high' | 'medium' | 'low'>
  assumptions: string[]
}

export interface SuggestedParameters {
  reductionPercentage: number
  timelineMonths: 6 | 12 | 18 | 24
  rationale: string
}

export interface ScenarioExtractionResult {
  success: boolean
  scenario: ExtractedScenario
  suggestedParameters: SuggestedParameters
  missingFields?: string[]
  error?: string
}

const SYSTEM_PROMPT = `You are an expert at extracting business scenario data from descriptions and documents for workforce transformation modeling.

Your task is to extract the following fields:
- Organization/scenario name
- Total FTE (full-time equivalent headcount)
- Total annual staff cost (in local currency, typically AUD/NZD)
- Annual revenue
- Average salary per employee
- Planned AI/automation investment

Also recommend transformation parameters:
- Suggested FTE reduction percentage (5-60%)
- Suggested timeline (exactly one of: 6, 12, 18, or 24 months)
- Brief rationale for these recommendations

Base your recommendations on:
- Stated goals (aggressive cost cutting → higher %, shorter timeline)
- Organization size (larger orgs 1000+ need longer timelines like 18-24 months)
- Industry context (media/creative typically 15-30% reduction potential)
- Risk tolerance implied in their description
- Current market conditions and AI maturity

If a value isn't explicitly stated, make reasonable inferences based on:
- Industry benchmarks (media/advertising: avg salary $100-120K AUD)
- Standard ratios (staff costs typically 45-55% of revenue in professional services)
- Headcount × avg salary = total staff cost (validate this relationship)
- AI investment typically 2-5% of annual staff cost savings target

Return your confidence level for each extracted field:
- "high" = explicitly stated in the input
- "medium" = derived from other stated values
- "low" = inferred from industry benchmarks

List any assumptions you made.

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanations outside the JSON.`

const USER_PROMPT_TEMPLATE = `Scenario Description:
{description}

{documentSection}

Extract the scenario parameters and return as JSON in this exact format:
{
  "scenario": {
    "name": "string",
    "fte": number,
    "staffCost": number,
    "revenue": number,
    "avgSalary": number,
    "aiInvestment": number,
    "description": "brief summary of the scenario",
    "confidence": {
      "name": "high|medium|low",
      "fte": "high|medium|low",
      "staffCost": "high|medium|low",
      "revenue": "high|medium|low",
      "avgSalary": "high|medium|low",
      "aiInvestment": "high|medium|low"
    },
    "assumptions": ["assumption 1", "assumption 2"]
  },
  "suggestedParameters": {
    "reductionPercentage": number (5-60),
    "timelineMonths": 6|12|18|24,
    "rationale": "string explaining the recommendation"
  }
}`

export async function extractScenarioFromText(
  description: string,
  documentText?: string
): Promise<ScenarioExtractionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return {
      success: false,
      scenario: getEmptyScenario(),
      suggestedParameters: getDefaultParameters(),
      error: 'ANTHROPIC_API_KEY not configured'
    }
  }

  const client = new Anthropic({ apiKey })

  const documentSection = documentText
    ? `Uploaded Document Contents:\n${documentText.slice(0, 50000)}`
    : 'No documents uploaded.'

  const userPrompt = USER_PROMPT_TEMPLATE
    .replace('{description}', description)
    .replace('{documentSection}', documentSection)

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
      system: SYSTEM_PROMPT
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Parse the JSON response
    const parsed = JSON.parse(content.text)

    // Validate required fields
    const missingFields: string[] = []
    if (!parsed.scenario.fte || parsed.scenario.fte <= 0) missingFields.push('fte')
    if (!parsed.scenario.revenue || parsed.scenario.revenue <= 0) missingFields.push('revenue')

    // Ensure timeline is valid
    const validTimelines = [6, 12, 18, 24]
    if (!validTimelines.includes(parsed.suggestedParameters.timelineMonths)) {
      parsed.suggestedParameters.timelineMonths = 12
    }

    // Ensure reduction is in range
    if (parsed.suggestedParameters.reductionPercentage < 5) {
      parsed.suggestedParameters.reductionPercentage = 5
    } else if (parsed.suggestedParameters.reductionPercentage > 60) {
      parsed.suggestedParameters.reductionPercentage = 60
    }

    return {
      success: true,
      scenario: parsed.scenario,
      suggestedParameters: parsed.suggestedParameters,
      missingFields: missingFields.length > 0 ? missingFields : undefined
    }
  } catch (error) {
    console.error('Scenario extraction error:', error)
    return {
      success: false,
      scenario: getEmptyScenario(),
      suggestedParameters: getDefaultParameters(),
      error: error instanceof Error ? error.message : 'Failed to extract scenario'
    }
  }
}

function getEmptyScenario(): ExtractedScenario {
  return {
    name: '',
    fte: 0,
    staffCost: 0,
    revenue: 0,
    avgSalary: 0,
    aiInvestment: 0,
    description: '',
    confidence: {
      name: 'low',
      fte: 'low',
      staffCost: 'low',
      revenue: 'low',
      avgSalary: 'low',
      aiInvestment: 'low'
    },
    assumptions: []
  }
}

function getDefaultParameters(): SuggestedParameters {
  return {
    reductionPercentage: 20,
    timelineMonths: 12,
    rationale: 'Default recommendation'
  }
}
