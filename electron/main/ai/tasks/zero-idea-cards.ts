import type { TaskHandler, PromptBuildInput } from './base'
import { extractJsonObject } from './base'
import type { AiTaskResult, ZeroIdeaCardsResult } from '../shared-types'
import { zeroIdeaCardsResultSchema } from '../../zero-start/schemas'
import { buildZeroStartJsonPrompt, describeZodValidationErrors } from './zero-start-common'

const OUTPUT_CONTRACT = `{
  "cards": [
    {
      "id": "idea-card-id",
      "projectId": "project-id",
      "batchId": "batch-id",
      "title": "candidate title",
      "oneLineHook": "one sentence hook",
      "genre": "genre key or custom genre",
      "targetWords": 300000,
      "protagonistDesign": "protagonist setup",
      "protagonistGap": "clear newbie-friendly growth gap",
      "coreConflict": "core conflict",
      "openingHooks": ["opening hook"],
      "longTermDrive": "long-term reader drive",
      "commercialSellingPoints": ["selling point"],
      "riskNotes": ["copyright, platform, or execution risk"],
      "tags": ["tag"],
      "status": "candidate",
      "createdAt": "ISO-8601 timestamp",
      "updatedAt": "ISO-8601 timestamp"
    }
  ]
}`

const handler: TaskHandler = {
  name: 'zero-idea-cards',
  outputType: 'json',
  defaultCapabilities: ['settings', 'workflow', 'inspiration', 'writing-style', 'project-skills'],
  buildPrompt(input: PromptBuildInput) {
    return buildZeroStartJsonPrompt(input, {
      agentName: 'IdeationAgent',
      taskGoal: 'Generate 5 to 8 beginner-friendly novel inspiration cards for human review.',
      contextKeys: ['projectId', 'batchId', 'wizardInput', 'genreKey', 'customGenre', 'targetWords', 'targetPlatform', 'audience', 'tone', 'seedIdea', 'existingIdeaCards'],
      rules: [
        'Each card must be distinct in premise, protagonist engine, opening hook, and commercial selling point.',
        'Every card must include riskNotes for copyright safety, platform suitability, or execution difficulty.',
        'Keep the cards actionable for a zero-background writer; avoid vague themes without concrete conflict.'
      ],
      outputContract: OUTPUT_CONTRACT
    })
  },
  normalize(raw: string): AiTaskResult {
    const result: ZeroIdeaCardsResult = zeroIdeaCardsResultSchema.parse(extractJsonObject(raw))
    return result
  },
  validate(result: AiTaskResult): boolean {
    return zeroIdeaCardsResultSchema.safeParse(result).success
  },
  describeValidationErrors(result: AiTaskResult): string[] {
    return describeZodValidationErrors(result, zeroIdeaCardsResultSchema)
  },
  resolveMaxTokens(): number {
    return 6000
  }
}

export default handler
