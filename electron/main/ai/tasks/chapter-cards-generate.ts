import type { TaskHandler, PromptBuildInput } from './base'
import { extractJsonObject } from './base'
import type { AiTaskResult, ChapterCardsResult } from '../shared-types'
import { chapterCardsResultSchema } from '../../zero-start/schemas'
import { buildZeroStartJsonPrompt, describeZodValidationErrors } from './zero-start-common'

const OUTPUT_CONTRACT = `{
  "cards": [
    {
      "id": "chapter-card-id",
      "projectId": "project-id",
      "volumeId": "volume-id",
      "chapterId": "chapter-id",
      "chapterNo": 1,
      "title": "chapter title",
      "targetWords": 2500,
      "pov": "point of view",
      "chapterGoal": "chapter goal",
      "coreConflict": "core conflict",
      "scenes": [
        {
          "title": "scene title",
          "goal": "scene goal",
          "conflict": "scene conflict",
          "outcome": "scene outcome"
        }
      ],
      "informationGain": ["new information"],
      "emotionalBeat": "emotional beat",
      "hookEnding": "ending hook",
      "continuityRequirements": ["continuity requirement"],
      "styleRequirements": ["style or avoid-rule requirement"],
      "status": "planned",
      "createdAt": "ISO-8601 timestamp",
      "updatedAt": "ISO-8601 timestamp"
    }
  ]
}`

const handler: TaskHandler = {
  name: 'chapter-cards-generate',
  outputType: 'json',
  defaultCapabilities: ['settings', 'workflow', 'outline', 'chapters', 'writing-style', 'project-skills'],
  buildPrompt(input: PromptBuildInput) {
    return buildZeroStartJsonPrompt(input, {
      agentName: 'ChapterCardAgent',
      taskGoal: 'Generate chapter cards that bridge the approved outline and later prose drafting.',
      contextKeys: ['projectId', 'volumeId', 'masterOutline', 'volumeOutline', 'approvedStyle', 'approvedSynopsis', 'startChapterNo', 'chapterCount', 'storyMemory', 'existingChapterCards'],
      rules: [
        'Each card must be concrete enough for a writer task: goal, conflict, scenes, information gain, and hook ending are mandatory.',
        'continuityRequirements must include needed prior facts and unresolved hooks.',
        'styleRequirements must include applicable style rules and avoid-rule reminders.'
      ],
      outputContract: OUTPUT_CONTRACT
    })
  },
  normalize(raw: string): AiTaskResult {
    const result: ChapterCardsResult = chapterCardsResultSchema.parse(extractJsonObject(raw))
    return result
  },
  validate(result: AiTaskResult): boolean {
    return chapterCardsResultSchema.safeParse(result).success
  },
  describeValidationErrors(result: AiTaskResult): string[] {
    return describeZodValidationErrors(result, chapterCardsResultSchema)
  },
  resolveMaxTokens(): number {
    return 7000
  }
}

export default handler
