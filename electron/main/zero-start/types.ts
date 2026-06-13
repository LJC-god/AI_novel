export type ZeroStartWorkflowPhase =
  | 'created'
  | 'idea_generating'
  | 'idea_review'
  | 'idea_approved'
  | 'style_collecting'
  | 'style_review'
  | 'style_approved'
  | 'synopsis_generating'
  | 'synopsis_review'
  | 'synopsis_approved'
  | 'outline_generating'
  | 'outline_review'
  | 'outline_approved'
  | 'chapter_cards_generating'
  | 'chapter_cards_review'
  | 'drafting'
  | 'revision'
  | 'export_ready'
  | 'submitted_archive'

export type ZeroStartTargetLength = 'short_100k' | 'medium_300k' | 'long_800k' | 'super_long_1200k'

export type ZeroStartPlatform = 'fanqie' | 'qidian' | 'jinjiang' | 'qimao' | 'zhihu' | 'generic'

export type ZeroStartWizardInput = {
  genreKey: string
  customGenre?: string
  targetLength: ZeroStartTargetLength
  targetWords: number
  platform: ZeroStartPlatform
  audience: string
  tone?: string
  seedIdea?: string
  cloudAllowed: boolean
}

export type ProjectWorkflowState = {
  projectId: string
  workflowPhase: ZeroStartWorkflowPhase
  approvedIdeaId: string
  approvedStyleId: string
  approvedSynopsisId: string
  approvedOutlineSnapshotId: string
  currentVolumeId: string
  currentChapterId: string
  targetPlatform: string
  targetWords: number
  audience: string
  zeroStartMode: boolean
  cloudAllowed: boolean
  createdAt: string
  updatedAt: string
}

export type InspirationCard = {
  id: string
  projectId: string
  batchId: string
  title: string
  oneLineHook: string
  genre: string
  targetWords: number
  protagonistDesign: string
  protagonistGap: string
  coreConflict: string
  openingHooks: string[]
  longTermDrive: string
  commercialSellingPoints: string[]
  riskNotes: string[]
  tags: string[]
  status: 'candidate' | 'approved' | 'rejected' | 'merged'
  createdAt: string
  updatedAt: string
}

export type StyleFingerprint = {
  id: string
  projectId: string
  sourceReferenceIds: string[]
  title: string
  sellPointPattern: string
  protagonistEngine: string
  conflictEngine: string
  povRule: string
  pacingRule: string
  chapterHookTypes: string[]
  sentenceRegister: Record<string, unknown>
  emotionCurve: string
  structurePattern: string
  reusableRules: string[]
  avoidRules: string[]
  copyrightSafetyNote: string
  status: 'draft' | 'approved' | 'archived'
  createdAt: string
  updatedAt: string
}

export type TitleSynopsisCandidate = {
  id: string
  projectId: string
  title: string
  subtitle: string
  introShort: string
  introLong: string
  sellingPoints: string[]
  tags: string[]
  targetPlatform: string
  audiencePromise: string
  openingExpectation: string
  riskNotes: string[]
  status: 'candidate' | 'active' | 'rejected'
  createdAt: string
  updatedAt: string
}

export type MasterOutlineVolume = {
  id: string
  title: string
  summary: string
  targetWords: number
  arcs: string[]
  keyBeats: string[]
}

export type MasterOutline = {
  id: string
  projectId: string
  title: string
  logline: string
  theme: string
  targetWords: number
  volumes: MasterOutlineVolume[]
  endingPromise: string
  risks: string[]
  status: 'draft' | 'approved' | 'archived'
  createdAt: string
  updatedAt: string
}

export type OutlineSnapshot = {
  id: string
  projectId: string
  versionNo: number
  outline: Record<string, unknown>
  status: 'draft' | 'approved' | 'archived'
  createdAt: string
  approvedAt: string
}

export type ChapterCardScene = {
  title: string
  goal: string
  conflict?: string
  outcome?: string
}

export type ChapterCard = {
  id: string
  projectId: string
  volumeId: string
  chapterId: string
  chapterNo: number
  title: string
  targetWords: number
  pov: string
  chapterGoal: string
  coreConflict: string
  scenes: ChapterCardScene[]
  informationGain: string[]
  emotionalBeat: string
  hookEnding: string
  continuityRequirements: string[]
  styleRequirements: string[]
  status: 'planned' | 'approved' | 'drafted' | 'rejected'
  createdAt: string
  updatedAt: string
}

export type ChapterQualityIssue = {
  severity: 'critical' | 'warning' | 'hint'
  category?: string
  message: string
  suggestion?: string
}

export type ChapterQualityReport = {
  id: string
  projectId: string
  chapterId: string
  wordCount: number
  targetWordCount: number
  pacingScore: number
  hookScore: number
  styleMatchScore: number
  continuityScore: number
  originalityRisk: 'low' | 'medium' | 'high'
  aiFlavorRisk: 'low' | 'medium' | 'high'
  platformRisk: string[]
  issues: ChapterQualityIssue[]
  passed: boolean
  createdAt: string
}

export type SubmissionChecklistItem = {
  label: string
  passed: boolean
  detail?: string
}

export type SubmissionPackage = {
  id: string
  projectId: string
  targetPlatform: string
  title: string
  introShort: string
  introLong: string
  tags: string[]
  manuscriptPath: string
  checklist: SubmissionChecklistItem[]
  riskReport: Record<string, unknown>
  exportFormat: 'folder' | 'txt' | 'docx' | 'json'
  createdAt: string
}

export type WorkflowRun = {
  id: string
  projectId: string
  workflowName: string
  phase: string
  status: 'running' | 'success' | 'error' | 'canceled'
  input: Record<string, unknown>
  output: Record<string, unknown>
  error: string
  startedAt: string
  finishedAt: string
}

export type WorkflowRunStep = {
  id: string
  runId: string
  stepName: string
  agentName: string
  status: 'pending' | 'running' | 'success' | 'error' | 'canceled'
  input: Record<string, unknown>
  output: Record<string, unknown>
  error: string
  startedAt: string
  finishedAt: string
}

export type ZeroIdeaCardsResult = {
  cards: InspirationCard[]
}

export type ZeroIdeaMergeResult = {
  card: InspirationCard
}

export type StyleFingerprintResult = {
  fingerprint: StyleFingerprint
}

export type TitleSynopsisResult = {
  candidates: TitleSynopsisCandidate[]
}

export type MasterOutlineResult = {
  outline: MasterOutline
}

export type VolumeOutlineResult = {
  volumes: MasterOutlineVolume[]
}

export type ChapterCardsResult = {
  cards: ChapterCard[]
}

export type ChapterDraftV2Result = {
  title: string
  content: string
  selfCheck: {
    followedChapterCard: boolean
    hookIncluded: boolean
    notes: string[]
  }
}

export type ChapterQualityAuditResult = {
  report: ChapterQualityReport
}

export type SubmissionPackageResult = {
  package: SubmissionPackage
}

export type ZeroStartAiTaskResult =
  | ZeroIdeaCardsResult
  | ZeroIdeaMergeResult
  | StyleFingerprintResult
  | TitleSynopsisResult
  | MasterOutlineResult
  | VolumeOutlineResult
  | ChapterCardsResult
  | ChapterDraftV2Result
  | ChapterQualityAuditResult
  | SubmissionPackageResult
