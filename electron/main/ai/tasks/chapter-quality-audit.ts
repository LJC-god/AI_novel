import type { TaskHandler, PromptBuildInput } from './base'
import { extractJsonObject } from './base'
import type { AiTaskResult, ChapterQualityAuditResult } from '../shared-types'
import { chapterQualityAuditResultSchema } from '../../zero-start/schemas'
import { buildZeroStartJsonPrompt, describeZodValidationErrors } from './zero-start-common'

const OUTPUT_CONTRACT = `{
  "report": {
    "id": "quality-report-id",
    "projectId": "project-id",
    "chapterId": "chapter-id",
    "wordCount": 2500,
    "targetWordCount": 2500,
    "pacingScore": 80,
    "hookScore": 80,
    "styleMatchScore": 80,
    "continuityScore": 80,
    "originalityRisk": "low",
    "aiFlavorRisk": "low",
    "platformRisk": ["platform risk"],
    "issues": [
      {
        "severity": "warning",
        "category": "pacing",
        "message": "issue message",
        "suggestion": "actionable suggestion"
      }
    ],
    "passed": true,
    "createdAt": "ISO-8601 timestamp"
  }
}`

const handler: TaskHandler = {
  name: 'chapter-quality-audit',
  outputType: 'json',
  defaultCapabilities: ['settings', 'workflow', 'chapters', 'analysis', 'worldview', 'characters', 'relations', 'writing-style'],
  buildPrompt(input: PromptBuildInput) {
    return buildZeroStartJsonPrompt(input, {
      agentName: 'ContinuityAuditorAgent',
      taskGoal: 'Audit a generated chapter for pacing, hook strength, style match, continuity, originality, AI flavor, and platform risk.',
      contextKeys: ['projectId', 'chapterId', 'chapterCard', 'chapterDraft', 'approvedStyle', 'storyMemory', 'targetPlatform', 'targetWordCount', 'previousChapterSummary'],
      rules: [
        'Scores should be numeric and calibrated from 0 to 100.',
        'passed must be false if a critical issue or high originality/platform risk exists.',
        'Every issue must include an actionable suggestion.'
      ],
      outputContract: OUTPUT_CONTRACT
    })
  },
  normalize(raw: string): AiTaskResult {
    const result: ChapterQualityAuditResult = chapterQualityAuditResultSchema.parse(extractJsonObject(raw))
    return result
  },
  validate(result: AiTaskResult): boolean {
    return chapterQualityAuditResultSchema.safeParse(result).success
  },
  describeValidationErrors(result: AiTaskResult): string[] {
    return describeZodValidationErrors(result, chapterQualityAuditResultSchema)
  },
  resolveMaxTokens(): number {
    return 5500
  }
}

export default handler
