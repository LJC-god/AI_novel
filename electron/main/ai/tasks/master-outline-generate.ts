import type { TaskHandler, PromptBuildInput } from './base'
import { extractJsonObject } from './base'
import type { AiTaskResult, MasterOutlineResult } from '../shared-types'
import { masterOutlineResultSchema } from '../../zero-start/schemas'
import { buildZeroStartJsonPrompt, describeZodValidationErrors } from './zero-start-common'

const OUTPUT_CONTRACT = `{
  "outline": {
    "id": "outline-id",
    "projectId": "project-id",
    "title": "master outline title",
    "logline": "one sentence story promise",
    "theme": "theme",
    "targetWords": 300000,
    "volumes": [
      {
        "id": "volume-id",
        "title": "volume title",
        "summary": "volume summary",
        "targetWords": 100000,
        "arcs": ["arc"],
        "keyBeats": ["key beat"]
      }
    ],
    "endingPromise": "ending promise",
    "risks": ["outline risk"],
    "status": "draft",
    "createdAt": "ISO-8601 timestamp",
    "updatedAt": "ISO-8601 timestamp"
  }
}`

const handler: TaskHandler = {
  name: 'master-outline-generate',
  outputType: 'json',
  defaultCapabilities: ['settings', 'workflow', 'outline', 'inspiration', 'writing-style', 'project-skills'],
  buildPrompt(input: PromptBuildInput) {
    return buildZeroStartJsonPrompt(input, {
      agentName: 'OutlineArchitectAgent',
      taskGoal: 'Generate a whole-book master outline from the approved synopsis, idea, and style.',
      contextKeys: ['projectId', 'approvedIdea', 'approvedStyle', 'approvedSynopsis', 'targetWords', 'targetPlatform', 'audience', 'existingOutline'],
      rules: [
        'The outline must fit the target length and split word count realistically across volumes.',
        'Each volume must have concrete arcs and key beats, not generic mood labels.',
        'risks must identify pacing, originality, platform, or execution risks.'
      ],
      outputContract: OUTPUT_CONTRACT
    })
  },
  normalize(raw: string): AiTaskResult {
    const result: MasterOutlineResult = masterOutlineResultSchema.parse(extractJsonObject(raw))
    return result
  },
  validate(result: AiTaskResult): boolean {
    return masterOutlineResultSchema.safeParse(result).success
  },
  describeValidationErrors(result: AiTaskResult): string[] {
    return describeZodValidationErrors(result, masterOutlineResultSchema)
  },
  resolveMaxTokens(): number {
    return 7000
  }
}

export default handler
