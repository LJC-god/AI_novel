import type {
  AiRunMeta,
  ChapterCard,
  ChapterDraftV2Result,
  ChapterQualityReport,
  InspirationCard,
  MasterOutline,
  ProjectWorkflowState,
  StyleFingerprint,
  SubmissionPackage,
  TitleSynopsisCandidate,
  ZeroStartWizardInput
} from '../main/ai/shared-types'

export type {
  ChapterCard,
  ChapterDraftV2Result,
  ChapterQualityReport,
  InspirationCard,
  MasterOutline,
  ProjectWorkflowState,
  StyleFingerprint,
  SubmissionPackage,
  TitleSynopsisCandidate,
  ZeroStartWizardInput
} from '../main/ai/shared-types'

export type ZeroStartIpcResponse<T = Record<string, unknown>> = {
  success: boolean
  error?: string
} & T

export type ZeroWorkflowStateGetRequest = {
  projectId: string
  defaults?: Partial<Pick<ProjectWorkflowState, 'targetPlatform' | 'targetWords' | 'audience' | 'cloudAllowed'>>
}

export type ZeroWorkflowStateUpdateRequest = {
  projectId: string
  patch: Partial<ProjectWorkflowState>
}

export type ZeroIdeasGenerateRequest = {
  projectId: string
  input: ZeroStartWizardInput
  settings: unknown
}

export type ZeroIdeasGenerateResponse = ZeroStartIpcResponse<{
  cards?: InspirationCard[]
  workflowState?: ProjectWorkflowState
  aiRunMeta?: AiRunMeta
}>

export type ZeroIdeaApproveRequest = {
  projectId: string
  ideaId: string
}

export type ZeroIdeaMergeRequest = {
  projectId: string
  ideaIds: string[]
  settings: unknown
  userPreference?: string
}

export type ZeroIdeaMergeResponse = ZeroStartIpcResponse<{
  card?: InspirationCard
  workflowState?: ProjectWorkflowState
  aiRunMeta?: AiRunMeta
}>

export type StyleFingerprintSaveRequest = {
  projectId: string
  fingerprint: StyleFingerprint
  approve?: boolean
}

export type StyleFusionRequest = {
  projectId: string
  settings: unknown
  fingerprintIds?: string[]
  userStylePreference?: string
}

export type StyleFusionResponse = ZeroStartIpcResponse<{
  fingerprint?: StyleFingerprint
  workflowState?: ProjectWorkflowState
  aiRunMeta?: AiRunMeta
}>

export type TitleSynopsisRequest = {
  projectId: string
  settings: unknown
  userPreference?: string
}

export type TitleSynopsisResponse = ZeroStartIpcResponse<{
  candidates?: TitleSynopsisCandidate[]
  workflowState?: ProjectWorkflowState
  aiRunMeta?: AiRunMeta
}>

export type TitleSynopsisApproveRequest = {
  projectId: string
  synopsisId: string
}

export type MasterOutlineRequest = {
  projectId: string
  settings: unknown
  userPreference?: string
}

export type MasterOutlineResponse = ZeroStartIpcResponse<{
  outline?: MasterOutline
  outlineSnapshotId?: string
  workflowState?: ProjectWorkflowState
  aiRunMeta?: AiRunMeta
}>

export type MasterOutlineApproveRequest = {
  projectId: string
  outlineSnapshotId: string
}

export type ChapterCardsRequest = {
  projectId: string
  settings: unknown
  volumeId?: string
  startChapterNo?: number
  chapterCount?: number
  userInstruction?: string
}

export type ChapterCardsResponse = ZeroStartIpcResponse<{
  cards?: ChapterCard[]
  workflowState?: ProjectWorkflowState
  aiRunMeta?: AiRunMeta
}>

export type ChapterCardApproveRequest = {
  projectId: string
  chapterCardId: string
}

export type ChapterDraftV2Request = {
  projectId: string
  chapterCardId: string
  settings: unknown
  stream?: boolean
  revisionInstruction?: string
}

export type ChapterDraftV2Response = ZeroStartIpcResponse<{
  chapterId?: string
  title?: string
  content?: string
  draft?: ChapterDraftV2Result
  qualityReport?: ChapterQualityReport
  workflowState?: ProjectWorkflowState
  aiRunMeta?: AiRunMeta
}>

export type ChapterQualityAuditRequest = {
  projectId: string
  chapterId: string
  chapterCardId?: string
  content?: string
  settings: unknown
}

export type ChapterQualityAuditResponse = ZeroStartIpcResponse<{
  report?: ChapterQualityReport
  aiRunMeta?: AiRunMeta
}>

export type SubmissionPackageRequest = {
  projectId: string
  settings: unknown
  exportFormat?: 'folder' | 'txt' | 'docx' | 'json'
  manuscriptPath?: string
  userInstruction?: string
}

export type SubmissionPackageResponse = ZeroStartIpcResponse<{
  package?: SubmissionPackage
  workflowState?: ProjectWorkflowState
  aiRunMeta?: AiRunMeta
}>

export type SubmissionPackageExportRequest = {
  projectId: string
  packageId?: string
  exportFormat?: 'folder' | 'txt' | 'docx' | 'json'
}

export type SubmissionPackageExportResponse = ZeroStartIpcResponse<{
  package?: SubmissionPackage
  filePath?: string
  folderPath?: string
  canceled?: boolean
}>
