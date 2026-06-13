import type { TaskHandler, PromptBuildInput } from './base'
import { extractJsonObject } from './base'
import type { AiTaskResult, StyleFingerprintResult } from '../shared-types'
import { styleFingerprintResultSchema } from '../../zero-start/schemas'
import { buildZeroStartJsonPrompt, describeZodValidationErrors } from './zero-start-common'

const OUTPUT_CONTRACT = `{
  "fingerprint": {
    "id": "project-style-id",
    "projectId": "project-id",
    "sourceReferenceIds": ["reference-id"],
    "title": "project style fingerprint title",
    "sellPointPattern": "fused selling-point pattern",
    "protagonistEngine": "project protagonist engine",
    "conflictEngine": "project conflict engine",
    "povRule": "project pov rule",
    "pacingRule": "project pacing rule",
    "chapterHookTypes": ["hook type"],
    "sentenceRegister": { "rhythm": "specific rule" },
    "emotionCurve": "project emotion curve",
    "structurePattern": "project structure pattern",
    "reusableRules": ["project writing rule"],
    "avoidRules": ["what must not be copied or imitated"],
    "copyrightSafetyNote": "copyright safety note",
    "status": "draft",
    "createdAt": "ISO-8601 timestamp",
    "updatedAt": "ISO-8601 timestamp"
  }
}`

const handler: TaskHandler = {
  name: 'style-fusion-project',
  outputType: 'json',
  defaultCapabilities: ['settings', 'workflow', 'analysis', 'writing-style', 'project-skills'],
  buildPrompt(input: PromptBuildInput) {
    return buildZeroStartJsonPrompt(input, {
      agentName: 'StyleFusionAgent',
      taskGoal: 'Fuse approved or candidate style fingerprints into one project-level style fingerprint.',
      contextKeys: ['projectId', 'approvedIdea', 'styleFingerprints', 'userStylePreference', 'targetPlatform', 'audience', 'targetWords'],
      rules: [
        'Favor compatibility with the approved idea over blind averaging of reference styles.',
        'Resolve conflicts between style cards into explicit reusableRules and avoidRules.',
        'The result must remain abstract and copyright-safe.'
      ],
      outputContract: OUTPUT_CONTRACT
    })
  },
  normalize(raw: string): AiTaskResult {
    const result: StyleFingerprintResult = styleFingerprintResultSchema.parse(extractJsonObject(raw))
    return result
  },
  validate(result: AiTaskResult): boolean {
    return styleFingerprintResultSchema.safeParse(result).success
  },
  describeValidationErrors(result: AiTaskResult): string[] {
    return describeZodValidationErrors(result, styleFingerprintResultSchema)
  },
  resolveMaxTokens(): number {
    return 5500
  }
}

export default handler
