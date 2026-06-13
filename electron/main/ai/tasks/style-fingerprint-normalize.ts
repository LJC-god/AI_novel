import type { TaskHandler, PromptBuildInput } from './base'
import { extractJsonObject } from './base'
import type { AiTaskResult, StyleFingerprintResult } from '../shared-types'
import { styleFingerprintResultSchema } from '../../zero-start/schemas'
import { buildZeroStartJsonPrompt, describeZodValidationErrors } from './zero-start-common'

const OUTPUT_CONTRACT = `{
  "fingerprint": {
    "id": "style-fingerprint-id",
    "projectId": "project-id",
    "sourceReferenceIds": ["reference-id"],
    "title": "abstract style card title",
    "sellPointPattern": "abstract commercial pattern",
    "protagonistEngine": "protagonist drive pattern",
    "conflictEngine": "conflict pattern",
    "povRule": "point-of-view rule",
    "pacingRule": "pacing rule",
    "chapterHookTypes": ["hook type"],
    "sentenceRegister": { "rhythm": "short and concrete" },
    "emotionCurve": "emotion curve",
    "structurePattern": "structure pattern",
    "reusableRules": ["abstract reusable rule"],
    "avoidRules": ["copyright-safe avoid rule"],
    "copyrightSafetyNote": "copyright safety note",
    "status": "draft",
    "createdAt": "ISO-8601 timestamp",
    "updatedAt": "ISO-8601 timestamp"
  }
}`

const handler: TaskHandler = {
  name: 'style-fingerprint-normalize',
  outputType: 'json',
  defaultCapabilities: ['settings', 'analysis', 'writing-style', 'import-export', 'project-skills'],
  buildPrompt(input: PromptBuildInput) {
    return buildZeroStartJsonPrompt(input, {
      agentName: 'DeconstructionAgent',
      taskGoal: 'Normalize deconstruction notes into one copyright-safe abstract style fingerprint.',
      contextKeys: ['projectId', 'sourceReferenceIds', 'referenceNotes', 'styleChunks', 'analysisResult', 'targetPlatform', 'audience'],
      rules: [
        'Only preserve abstract writing rules, pacing patterns, structure patterns, and reader promise patterns.',
        'Do not preserve character names, unique scenes, exact phrasing, or protected plot expression.',
        'avoidRules and copyrightSafetyNote are mandatory and must be specific.'
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
