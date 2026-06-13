import type { TaskHandler, PromptBuildInput } from './base'
import { extractJsonObject } from './base'
import type { AiTaskResult, ChapterDraftV2Result } from '../shared-types'
import { chapterDraftV2ResultSchema } from '../../zero-start/schemas'
import { buildZeroStartJsonPrompt, describeZodValidationErrors } from './zero-start-common'

const OUTPUT_CONTRACT = `{
  "title": "chapter title",
  "content": "full chapter prose",
  "selfCheck": {
    "followedChapterCard": true,
    "hookIncluded": true,
    "notes": ["self-check note, including style risks or avoid-rule reminders"]
  }
}`

const handler: TaskHandler = {
  name: 'chapter-draft-v2',
  outputType: 'json',
  maxSkills: 6,
  defaultCapabilities: ['settings', 'workflow', 'outline', 'chapters', 'worldview', 'characters', 'relations', 'writing-style', 'project-skills'],
  buildPrompt(input: PromptBuildInput) {
    return buildZeroStartJsonPrompt(input, {
      agentName: 'DraftWriterAgent',
      taskGoal: 'Draft one chapter from an approved chapter card while preserving continuity and style requirements.',
      contextKeys: ['projectId', 'chapterId', 'chapterCard', 'approvedStyle', 'masterOutline', 'storyMemory', 'characters', 'worldviewEntries', 'previousChapterSummary', 'targetWords', 'revisionInstruction'],
      rules: [
        'The content field must contain the full prose draft and no markdown wrapper.',
        'Do not add an in-story explanation of the workflow or AI process.',
        'selfCheck.notes must mention important risks, style requirements, or avoid-rule constraints checked after drafting.'
      ],
      outputContract: OUTPUT_CONTRACT
    })
  },
  normalize(raw: string): AiTaskResult {
    const result: ChapterDraftV2Result = chapterDraftV2ResultSchema.parse(extractJsonObject(raw))
    return result
  },
  validate(result: AiTaskResult): boolean {
    return chapterDraftV2ResultSchema.safeParse(result).success
  },
  describeValidationErrors(result: AiTaskResult): string[] {
    return describeZodValidationErrors(result, chapterDraftV2ResultSchema)
  },
  resolveMaxTokens(): number {
    return 9000
  }
}

export default handler
