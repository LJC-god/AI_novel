import type { TaskHandler, PromptBuildInput } from './base'
import { extractJsonObject } from './base'
import type { AiTaskResult, TitleSynopsisResult } from '../shared-types'
import { titleSynopsisResultSchema } from '../../zero-start/schemas'
import { buildZeroStartJsonPrompt, describeZodValidationErrors } from './zero-start-common'

const OUTPUT_CONTRACT = `{
  "candidates": [
    {
      "id": "synopsis-id",
      "projectId": "project-id",
      "title": "book title",
      "subtitle": "optional subtitle",
      "introShort": "short platform intro",
      "introLong": "long synopsis",
      "sellingPoints": ["selling point"],
      "tags": ["tag"],
      "targetPlatform": "fanqie",
      "audiencePromise": "reader promise",
      "openingExpectation": "first-chapter expectation",
      "riskNotes": ["risk note"],
      "status": "candidate",
      "createdAt": "ISO-8601 timestamp",
      "updatedAt": "ISO-8601 timestamp"
    }
  ]
}`

const handler: TaskHandler = {
  name: 'title-synopsis-generate',
  outputType: 'json',
  defaultCapabilities: ['settings', 'workflow', 'inspiration', 'writing-style', 'project-skills'],
  buildPrompt(input: PromptBuildInput) {
    return buildZeroStartJsonPrompt(input, {
      agentName: 'TitleSynopsisAgent',
      taskGoal: 'Generate title and synopsis candidates from the approved idea and project style for human review.',
      contextKeys: ['projectId', 'approvedIdea', 'approvedStyle', 'targetPlatform', 'audience', 'targetWords', 'userPreference'],
      rules: [
        'Return 3 to 5 distinct candidates with different title strategies.',
        'Every candidate must include riskNotes for platform promise, originality, or scope control.',
        'Do not promise income, signing, traffic, or guaranteed platform success.'
      ],
      outputContract: OUTPUT_CONTRACT
    })
  },
  normalize(raw: string): AiTaskResult {
    const result: TitleSynopsisResult = titleSynopsisResultSchema.parse(extractJsonObject(raw))
    return result
  },
  validate(result: AiTaskResult): boolean {
    return titleSynopsisResultSchema.safeParse(result).success
  },
  describeValidationErrors(result: AiTaskResult): string[] {
    return describeZodValidationErrors(result, titleSynopsisResultSchema)
  },
  resolveMaxTokens(): number {
    return 5500
  }
}

export default handler
