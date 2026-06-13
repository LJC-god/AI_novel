import type { TaskHandler, PromptBuildInput } from './base'
import { extractJsonObject } from './base'
import type { AiTaskResult, VolumeOutlineResult } from '../shared-types'
import { volumeOutlineResultSchema } from '../../zero-start/schemas'
import { buildZeroStartJsonPrompt, describeZodValidationErrors } from './zero-start-common'

const OUTPUT_CONTRACT = `{
  "volumes": [
    {
      "id": "volume-id",
      "title": "volume title",
      "summary": "volume summary",
      "targetWords": 100000,
      "arcs": ["arc"],
      "keyBeats": ["key beat"]
    }
  ]
}`

const handler: TaskHandler = {
  name: 'volume-outline-generate',
  outputType: 'json',
  defaultCapabilities: ['settings', 'workflow', 'outline', 'writing-style', 'project-skills'],
  buildPrompt(input: PromptBuildInput) {
    return buildZeroStartJsonPrompt(input, {
      agentName: 'VolumePlannerAgent',
      taskGoal: 'Generate or refine volume outlines from the approved master outline.',
      contextKeys: ['projectId', 'masterOutline', 'approvedSynopsis', 'approvedStyle', 'targetWords', 'volumeCount', 'userInstruction'],
      rules: [
        'Keep volume word counts consistent with the master outline and target length.',
        'Each volume must include arcs and keyBeats that can later expand into chapter cards.',
        'Represent risk-aware constraints inside arcs or keyBeats without adding fields outside the schema.'
      ],
      outputContract: OUTPUT_CONTRACT
    })
  },
  normalize(raw: string): AiTaskResult {
    const result: VolumeOutlineResult = volumeOutlineResultSchema.parse(extractJsonObject(raw))
    return result
  },
  validate(result: AiTaskResult): boolean {
    return volumeOutlineResultSchema.safeParse(result).success
  },
  describeValidationErrors(result: AiTaskResult): string[] {
    return describeZodValidationErrors(result, volumeOutlineResultSchema)
  },
  resolveMaxTokens(): number {
    return 6000
  }
}

export default handler
