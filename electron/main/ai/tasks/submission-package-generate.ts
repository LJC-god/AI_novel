import type { TaskHandler, PromptBuildInput } from './base'
import { extractJsonObject } from './base'
import type { AiTaskResult, SubmissionPackageResult } from '../shared-types'
import { submissionPackageResultSchema } from '../../zero-start/schemas'
import { buildZeroStartJsonPrompt, describeZodValidationErrors } from './zero-start-common'

const OUTPUT_CONTRACT = `{
  "package": {
    "id": "submission-package-id",
    "projectId": "project-id",
    "targetPlatform": "fanqie",
    "title": "book title",
    "introShort": "short intro",
    "introLong": "long intro",
    "tags": ["tag"],
    "manuscriptPath": "relative/path/to/manuscript.txt",
    "checklist": [
      {
        "label": "checklist item",
        "passed": true,
        "detail": "detail"
      }
    ],
    "riskReport": {
      "copyright": "low",
      "originality": "low",
      "platform": "notes"
    },
    "exportFormat": "folder",
    "createdAt": "ISO-8601 timestamp"
  }
}`

const handler: TaskHandler = {
  name: 'submission-package-generate',
  outputType: 'json',
  maxSkills: 6,
  defaultCapabilities: ['settings', 'workflow', 'chapters', 'analysis', 'import-export', 'writing-style'],
  buildPrompt(input: PromptBuildInput) {
    return buildZeroStartJsonPrompt(input, {
      agentName: 'SubmissionAgent',
      taskGoal: 'Prepare a platform submission package checklist and metadata from approved project materials.',
      contextKeys: ['projectId', 'targetPlatform', 'approvedSynopsis', 'approvedStyle', 'masterOutline', 'chapters', 'qualityReports', 'exportFormat', 'manuscriptPath', 'userInstruction'],
      rules: [
        'Do not claim guaranteed signing, traffic, ranking, or income.',
        'checklist must cover title, synopsis, tags, first chapters, manuscript completeness, originality risk, and platform suitability.',
        'riskReport must summarize originality, copyright, AI-flavor, and platform risks.'
      ],
      outputContract: OUTPUT_CONTRACT
    })
  },
  normalize(raw: string): AiTaskResult {
    const result: SubmissionPackageResult = submissionPackageResultSchema.parse(extractJsonObject(raw))
    return result
  },
  validate(result: AiTaskResult): boolean {
    return submissionPackageResultSchema.safeParse(result).success
  },
  describeValidationErrors(result: AiTaskResult): string[] {
    return describeZodValidationErrors(result, submissionPackageResultSchema)
  },
  resolveMaxTokens(): number {
    return 6000
  }
}

export default handler
