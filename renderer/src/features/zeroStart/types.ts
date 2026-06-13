export type {
  ChapterCard,
  ChapterDraftV2Request,
  ChapterDraftV2Response,
  ChapterQualityAuditRequest,
  ChapterQualityReport,
  InspirationCard,
  MasterOutline,
  ProjectWorkflowState,
  StyleFingerprint,
  SubmissionPackage,
  SubmissionPackageRequest,
  TitleSynopsisCandidate,
  ZeroStartWizardInput
} from '@shared/zero-start-ipc-types'

export type ZeroStartTargetLength = 'short_100k' | 'medium_300k' | 'long_800k' | 'super_long_1200k'

export type ZeroStartPlatform = 'fanqie' | 'qidian' | 'jinjiang' | 'qimao' | 'zhihu' | 'generic'

export type ZeroStartReviewStage =
  | 'wizard'
  | 'ideas'
  | 'style'
  | 'synopsis'
  | 'outline'
  | 'chapters'
  | 'draft'
  | 'submission'
