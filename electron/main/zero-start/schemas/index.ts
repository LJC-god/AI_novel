import { z } from 'zod'

export const zeroStartWorkflowPhaseSchema = z.enum([
  'created',
  'idea_generating',
  'idea_review',
  'idea_approved',
  'style_collecting',
  'style_review',
  'style_approved',
  'synopsis_generating',
  'synopsis_review',
  'synopsis_approved',
  'outline_generating',
  'outline_review',
  'outline_approved',
  'chapter_cards_generating',
  'chapter_cards_review',
  'drafting',
  'revision',
  'export_ready',
  'submitted_archive'
])

export const zeroStartWizardInputSchema = z.object({
  genreKey: z.string(),
  customGenre: z.string().optional(),
  targetLength: z.enum(['short_100k', 'medium_300k', 'long_800k', 'super_long_1200k']),
  targetWords: z.number().int().positive(),
  platform: z.enum(['fanqie', 'qidian', 'jinjiang', 'qimao', 'zhihu', 'generic']),
  audience: z.string(),
  tone: z.string().optional(),
  seedIdea: z.string().optional(),
  cloudAllowed: z.boolean()
})

export const projectWorkflowStateSchema = z.object({
  projectId: z.string(),
  workflowPhase: zeroStartWorkflowPhaseSchema,
  approvedIdeaId: z.string(),
  approvedStyleId: z.string(),
  approvedSynopsisId: z.string(),
  approvedOutlineSnapshotId: z.string(),
  currentVolumeId: z.string(),
  currentChapterId: z.string(),
  targetPlatform: z.string(),
  targetWords: z.number().int().nonnegative(),
  audience: z.string(),
  zeroStartMode: z.boolean(),
  cloudAllowed: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export const inspirationCardSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  batchId: z.string(),
  title: z.string(),
  oneLineHook: z.string(),
  genre: z.string(),
  targetWords: z.number().int().positive(),
  protagonistDesign: z.string(),
  protagonistGap: z.string(),
  coreConflict: z.string(),
  openingHooks: z.array(z.string()),
  longTermDrive: z.string(),
  commercialSellingPoints: z.array(z.string()),
  riskNotes: z.array(z.string()),
  tags: z.array(z.string()),
  status: z.enum(['candidate', 'approved', 'rejected', 'merged']),
  createdAt: z.string(),
  updatedAt: z.string()
})

export const styleFingerprintSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  sourceReferenceIds: z.array(z.string()),
  title: z.string(),
  sellPointPattern: z.string(),
  protagonistEngine: z.string(),
  conflictEngine: z.string(),
  povRule: z.string(),
  pacingRule: z.string(),
  chapterHookTypes: z.array(z.string()),
  sentenceRegister: z.record(z.string(), z.unknown()),
  emotionCurve: z.string(),
  structurePattern: z.string(),
  reusableRules: z.array(z.string()),
  avoidRules: z.array(z.string()),
  copyrightSafetyNote: z.string(),
  status: z.enum(['draft', 'approved', 'archived']),
  createdAt: z.string(),
  updatedAt: z.string()
})

export const titleSynopsisCandidateSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  subtitle: z.string(),
  introShort: z.string(),
  introLong: z.string(),
  sellingPoints: z.array(z.string()),
  tags: z.array(z.string()),
  targetPlatform: z.string(),
  audiencePromise: z.string(),
  openingExpectation: z.string(),
  riskNotes: z.array(z.string()),
  status: z.enum(['candidate', 'active', 'rejected']),
  createdAt: z.string(),
  updatedAt: z.string()
})

export const masterOutlineVolumeSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  targetWords: z.number().int().positive(),
  arcs: z.array(z.string()),
  keyBeats: z.array(z.string())
})

export const masterOutlineSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  logline: z.string(),
  theme: z.string(),
  targetWords: z.number().int().positive(),
  volumes: z.array(masterOutlineVolumeSchema),
  endingPromise: z.string(),
  risks: z.array(z.string()),
  status: z.enum(['draft', 'approved', 'archived']),
  createdAt: z.string(),
  updatedAt: z.string()
})

export const chapterCardSceneSchema = z.object({
  title: z.string(),
  goal: z.string(),
  conflict: z.string().optional(),
  outcome: z.string().optional()
})

export const chapterCardSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  volumeId: z.string(),
  chapterId: z.string(),
  chapterNo: z.number().int().positive(),
  title: z.string(),
  targetWords: z.number().int().positive(),
  pov: z.string(),
  chapterGoal: z.string(),
  coreConflict: z.string(),
  scenes: z.array(chapterCardSceneSchema),
  informationGain: z.array(z.string()),
  emotionalBeat: z.string(),
  hookEnding: z.string(),
  continuityRequirements: z.array(z.string()),
  styleRequirements: z.array(z.string()),
  status: z.enum(['planned', 'approved', 'drafted', 'rejected']),
  createdAt: z.string(),
  updatedAt: z.string()
})

export const chapterQualityIssueSchema = z.object({
  severity: z.enum(['critical', 'warning', 'hint']),
  category: z.string().optional(),
  message: z.string(),
  suggestion: z.string().optional()
})

export const chapterQualityReportSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  chapterId: z.string(),
  wordCount: z.number().int().nonnegative(),
  targetWordCount: z.number().int().nonnegative(),
  pacingScore: z.number(),
  hookScore: z.number(),
  styleMatchScore: z.number(),
  continuityScore: z.number(),
  originalityRisk: z.enum(['low', 'medium', 'high']),
  aiFlavorRisk: z.enum(['low', 'medium', 'high']),
  platformRisk: z.array(z.string()),
  issues: z.array(chapterQualityIssueSchema),
  passed: z.boolean(),
  createdAt: z.string()
})

export const submissionChecklistItemSchema = z.object({
  label: z.string(),
  passed: z.boolean(),
  detail: z.string().optional()
})

export const submissionPackageSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  targetPlatform: z.string(),
  title: z.string(),
  introShort: z.string(),
  introLong: z.string(),
  tags: z.array(z.string()),
  manuscriptPath: z.string(),
  checklist: z.array(submissionChecklistItemSchema),
  riskReport: z.record(z.string(), z.unknown()),
  exportFormat: z.enum(['folder', 'txt', 'docx', 'json']),
  createdAt: z.string()
})

export const workflowRunSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  workflowName: z.string(),
  phase: z.string(),
  status: z.enum(['running', 'success', 'error', 'canceled']),
  input: z.record(z.string(), z.unknown()),
  output: z.record(z.string(), z.unknown()),
  error: z.string(),
  startedAt: z.string(),
  finishedAt: z.string()
})

export const workflowRunStepSchema = z.object({
  id: z.string(),
  runId: z.string(),
  stepName: z.string(),
  agentName: z.string(),
  status: z.enum(['pending', 'running', 'success', 'error', 'canceled']),
  input: z.record(z.string(), z.unknown()),
  output: z.record(z.string(), z.unknown()),
  error: z.string(),
  startedAt: z.string(),
  finishedAt: z.string()
})

export const zeroIdeaCardsResultSchema = z.object({
  cards: z.array(inspirationCardSchema)
})

export const zeroIdeaMergeResultSchema = z.object({
  card: inspirationCardSchema
})

export const styleFingerprintResultSchema = z.object({
  fingerprint: styleFingerprintSchema
})

export const titleSynopsisResultSchema = z.object({
  candidates: z.array(titleSynopsisCandidateSchema)
})

export const masterOutlineResultSchema = z.object({
  outline: masterOutlineSchema
})

export const volumeOutlineResultSchema = z.object({
  volumes: z.array(masterOutlineVolumeSchema)
})

export const chapterCardsResultSchema = z.object({
  cards: z.array(chapterCardSchema)
})

export const chapterDraftV2ResultSchema = z.object({
  title: z.string(),
  content: z.string(),
  selfCheck: z.object({
    followedChapterCard: z.boolean(),
    hookIncluded: z.boolean(),
    notes: z.array(z.string())
  })
})

export const chapterQualityAuditResultSchema = z.object({
  report: chapterQualityReportSchema
})

export const submissionPackageResultSchema = z.object({
  package: submissionPackageSchema
})
