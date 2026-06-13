import type { TaskHandler, PromptBuildInput } from './base'
import { extractJsonObject } from './base'
import type { AiTaskResult, ZeroIdeaMergeResult } from '../shared-types'
import { zeroIdeaMergeResultSchema } from '../../zero-start/schemas'
import { buildZeroStartJsonPrompt, describeZodValidationErrors } from './zero-start-common'

const OUTPUT_CONTRACT = `{
  "card": {
    "id": "merged-card-id",
    "projectId": "project-id",
    "batchId": "batch-id",
    "title": "approved or merged idea title",
    "oneLineHook": "merged hook",
    "genre": "genre",
    "targetWords": 300000,
    "protagonistDesign": "merged protagonist design",
    "protagonistGap": "growth gap",
    "coreConflict": "core conflict",
    "openingHooks": ["opening hook"],
    "longTermDrive": "long-term drive",
    "commercialSellingPoints": ["selling point"],
    "riskNotes": ["risk note"],
    "tags": ["tag"],
    "status": "merged",
    "createdAt": "ISO-8601 timestamp",
    "updatedAt": "ISO-8601 timestamp"
  }
}`

const handler: TaskHandler = {
  name: 'zero-idea-merge',
  outputType: 'json',
  defaultCapabilities: ['settings', 'workflow', 'inspiration', 'writing-style', 'project-skills'],
  buildPrompt(input: PromptBuildInput) {
    return buildZeroStartJsonPrompt(input, {
      agentName: 'IdeaEditorAgent',
      taskGoal: 'Merge selected inspiration cards and user preferences into one reviewable idea card.',
      contextKeys: ['projectId', 'batchId', 'selectedIdeaCards', 'userPreference', 'wizardInput', 'targetWords', 'targetPlatform', 'audience'],
      rules: [
        'Do not simply concatenate cards; resolve contradictions into one coherent premise.',
        'Preserve the strongest hook and commercial promise from the selected cards.',
        'The merged card must include riskNotes and use status merged unless context explicitly asks for approved.'
      ],
      outputContract: OUTPUT_CONTRACT
    })
  },
  normalize(raw: string): AiTaskResult {
    const result: ZeroIdeaMergeResult = zeroIdeaMergeResultSchema.parse(extractJsonObject(raw))
    return result
  },
  validate(result: AiTaskResult): boolean {
    return zeroIdeaMergeResultSchema.safeParse(result).success
  },
  describeValidationErrors(result: AiTaskResult): string[] {
    return describeZodValidationErrors(result, zeroIdeaMergeResultSchema)
  },
  resolveMaxTokens(): number {
    return 4500
  }
}

export default handler
