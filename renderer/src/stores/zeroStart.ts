import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useAppStore } from '@/stores/app'
import { toIpcPayload } from '@/utils/ipcPayload'
import { ZERO_START_DEFAULT_AUDIENCE } from '@/features/zeroStart/constants'
import type {
  ChapterCard,
  ChapterQualityReport,
  InspirationCard,
  MasterOutline,
  ProjectWorkflowState,
  StyleFingerprint,
  SubmissionPackage,
  TitleSynopsisCandidate,
  ZeroStartReviewStage,
  ZeroStartWizardInput
} from '@/features/zeroStart/types'

function toNovelLength(targetLength: ZeroStartWizardInput['targetLength']): 'short' | 'long' {
  return targetLength === 'short_100k' ? 'short' : 'long'
}

function resolveGenre(input: ZeroStartWizardInput): string {
  return input.customGenre?.trim() || input.genreKey
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export const useZeroStartStore = defineStore('zeroStart', () => {
  const activeProjectId = ref('')
  const workflowStateByProject = ref<Record<string, ProjectWorkflowState>>({})
  const inspirationCardsByProject = ref<Record<string, InspirationCard[]>>({})
  const styleFingerprintsByProject = ref<Record<string, StyleFingerprint[]>>({})
  const synopsisCandidatesByProject = ref<Record<string, TitleSynopsisCandidate[]>>({})
  const masterOutlineByProject = ref<Record<string, MasterOutline | null>>({})
  const chapterCardsByProject = ref<Record<string, ChapterCard[]>>({})
  const qualityReportsByChapter = ref<Record<string, ChapterQualityReport[]>>({})
  const submissionPackageByProject = ref<Record<string, SubmissionPackage | null>>({})
  const currentStage = ref<ZeroStartReviewStage>('wizard')
  const isRunning = ref(false)
  const lastError = ref('')
  const lastSubmissionExportPath = ref('')

  const workflowState = computed(() => workflowStateByProject.value[activeProjectId.value] ?? null)
  const inspirationCards = computed(() => inspirationCardsByProject.value[activeProjectId.value] ?? [])
  const styleFingerprints = computed(() => styleFingerprintsByProject.value[activeProjectId.value] ?? [])
  const synopsisCandidates = computed(() => synopsisCandidatesByProject.value[activeProjectId.value] ?? [])
  const masterOutline = computed(() => masterOutlineByProject.value[activeProjectId.value] ?? null)
  const chapterCards = computed(() => chapterCardsByProject.value[activeProjectId.value] ?? [])
  const submissionPackage = computed(() => submissionPackageByProject.value[activeProjectId.value] ?? null)
  const latestQualityReports = computed(() =>
    Object.values(qualityReportsByChapter.value)
      .map((reports) => reports[0])
      .filter((report): report is ChapterQualityReport => Boolean(report))
  )

  function setWorkflowState(projectId: string, state?: ProjectWorkflowState | null): void {
    if (state) {
      workflowStateByProject.value = {
        ...workflowStateByProject.value,
        [projectId]: state
      }
    }
  }

  async function run<T>(operation: () => Promise<T>, fallback: string): Promise<T> {
    isRunning.value = true
    lastError.value = ''
    try {
      return await operation()
    } catch (error) {
      lastError.value = errorMessage(error, fallback)
      throw error
    } finally {
      isRunning.value = false
    }
  }

  async function hydrate(projectId: string): Promise<void> {
    activeProjectId.value = projectId
    const response = await window.characterArc.zeroGetWorkflowState(toIpcPayload({
      projectId,
      defaults: {
        audience: ZERO_START_DEFAULT_AUDIENCE
      }
    }))
    if (!response.success || !response.state) {
      throw new Error(response.error ?? '读取零基础流程状态失败')
    }
    setWorkflowState(projectId, response.state)
  }

  async function startFromWizard(input: ZeroStartWizardInput): Promise<void> {
    await run(async () => {
      const appStore = useAppStore()
      appStore.createProjectWorkspace({
        project: {
          title: `${resolveGenre(input)}新作`,
          genre: resolveGenre(input),
          novelLength: toNovelLength(input.targetLength),
          targetPlatform: input.platform
        }
      })

      const projectId = appStore.selectedProjectId
      activeProjectId.value = projectId
      appStore.openZeroStart()
      await appStore.persistWorkspace()

      const response = await window.characterArc.zeroGenerateIdeas(toIpcPayload({
        projectId,
        input,
        settings: appStore.appSettings
      }))

      if (!response.success || !response.cards) {
        throw new Error(response.error ?? '生成灵感卡失败')
      }

      inspirationCardsByProject.value = {
        ...inspirationCardsByProject.value,
        [projectId]: response.cards
      }
      setWorkflowState(projectId, response.workflowState)
      currentStage.value = 'ideas'
    }, '启动零基础流程失败')
  }

  async function generateIdeas(input: ZeroStartWizardInput): Promise<void> {
    await startFromWizard(input)
  }

  async function approveIdea(ideaId: string): Promise<void> {
    await run(async () => {
      const projectId = activeProjectId.value
      const response = await window.characterArc.zeroApproveIdea(toIpcPayload({ projectId, ideaId }))
      if (!response.success) throw new Error(response.error ?? '审核灵感卡失败')
      inspirationCardsByProject.value = {
        ...inspirationCardsByProject.value,
        [projectId]: inspirationCards.value.map((card) => ({
          ...card,
          status: card.id === ideaId ? 'approved' : card.status === 'candidate' ? 'rejected' : card.status
        }))
      }
      setWorkflowState(projectId, response.workflowState)
      currentStage.value = 'style'
    }, '审核灵感卡失败')
  }

  async function mergeIdeas(ideaIds: string[], userPreference = ''): Promise<void> {
    await run(async () => {
      const appStore = useAppStore()
      const projectId = activeProjectId.value
      const response = await window.characterArc.zeroMergeIdea(toIpcPayload({
        projectId,
        ideaIds,
        userPreference,
        settings: appStore.appSettings
      }))
      if (!response.success || !response.card) throw new Error(response.error ?? '合并灵感卡失败')
      inspirationCardsByProject.value = {
        ...inspirationCardsByProject.value,
        [projectId]: [response.card, ...inspirationCards.value]
      }
      setWorkflowState(projectId, response.workflowState)
    }, '合并灵感卡失败')
  }

  async function saveStyleFingerprint(fingerprint: StyleFingerprint, approve = true): Promise<void> {
    await run(async () => {
      const projectId = activeProjectId.value
      const response = await window.characterArc.zeroSaveStyleFingerprint(toIpcPayload({ projectId, fingerprint, approve }))
      if (!response.success || !response.fingerprint) throw new Error(response.error ?? '保存风格卡失败')
      styleFingerprintsByProject.value = {
        ...styleFingerprintsByProject.value,
        [projectId]: [response.fingerprint, ...styleFingerprints.value.filter((item) => item.id !== response.fingerprint?.id)]
      }
      setWorkflowState(projectId, response.workflowState)
      if (approve) currentStage.value = 'synopsis'
    }, '保存风格卡失败')
  }

  async function generateStyleFusion(fingerprintIds: string[] = [], userStylePreference = ''): Promise<void> {
    await run(async () => {
      const appStore = useAppStore()
      const projectId = activeProjectId.value
      const response = await window.characterArc.zeroGenerateStyleFusion(toIpcPayload({
        projectId,
        fingerprintIds,
        userStylePreference,
        settings: appStore.appSettings
      }))
      if (!response.success || !response.fingerprint) throw new Error(response.error ?? '生成融合风格卡失败')
      styleFingerprintsByProject.value = {
        ...styleFingerprintsByProject.value,
        [projectId]: [response.fingerprint, ...styleFingerprints.value.filter((item) => item.id !== response.fingerprint?.id)]
      }
      setWorkflowState(projectId, response.workflowState)
      currentStage.value = 'style'
    }, '生成融合风格卡失败')
  }

  async function generateTitleSynopsis(userPreference = ''): Promise<void> {
    await run(async () => {
      const appStore = useAppStore()
      const projectId = activeProjectId.value
      const response = await window.characterArc.zeroGenerateTitleSynopsis(toIpcPayload({
        projectId,
        userPreference,
        settings: appStore.appSettings
      }))
      if (!response.success || !response.candidates) throw new Error(response.error ?? '生成书名简介失败')
      synopsisCandidatesByProject.value = {
        ...synopsisCandidatesByProject.value,
        [projectId]: response.candidates
      }
      setWorkflowState(projectId, response.workflowState)
      currentStage.value = 'synopsis'
    }, '生成书名简介失败')
  }

  async function approveTitleSynopsis(synopsisId: string): Promise<void> {
    await run(async () => {
      const projectId = activeProjectId.value
      const response = await window.characterArc.zeroApproveTitleSynopsis(toIpcPayload({ projectId, synopsisId }))
      if (!response.success) throw new Error(response.error ?? '审核书名简介失败')
      setWorkflowState(projectId, response.workflowState)
      currentStage.value = 'outline'
    }, '审核书名简介失败')
  }

  async function generateMasterOutline(userPreference = ''): Promise<void> {
    await run(async () => {
      const appStore = useAppStore()
      const projectId = activeProjectId.value
      const response = await window.characterArc.zeroGenerateMasterOutline(toIpcPayload({
        projectId,
        userPreference,
        settings: appStore.appSettings
      }))
      if (!response.success || !response.outline) throw new Error(response.error ?? '生成大纲失败')
      masterOutlineByProject.value = {
        ...masterOutlineByProject.value,
        [projectId]: response.outline
      }
      setWorkflowState(projectId, response.workflowState)
      currentStage.value = 'outline'
    }, '生成大纲失败')
  }

  async function approveMasterOutline(outlineSnapshotId?: string): Promise<void> {
    await run(async () => {
      const projectId = activeProjectId.value
      const response = await window.characterArc.zeroApproveMasterOutline(toIpcPayload({
        projectId,
        outlineSnapshotId: outlineSnapshotId || masterOutline.value?.id || ''
      }))
      if (!response.success) throw new Error(response.error ?? '审核大纲失败')
      setWorkflowState(projectId, response.workflowState)
      currentStage.value = 'chapters'
    }, '审核大纲失败')
  }

  async function generateChapterCards(chapterCount = 5): Promise<void> {
    await run(async () => {
      const appStore = useAppStore()
      const projectId = activeProjectId.value
      const response = await window.characterArc.zeroGenerateChapterCards(toIpcPayload({
        projectId,
        chapterCount,
        settings: appStore.appSettings
      }))
      if (!response.success || !response.cards) throw new Error(response.error ?? '生成章节卡失败')
      chapterCardsByProject.value = {
        ...chapterCardsByProject.value,
        [projectId]: response.cards
      }
      setWorkflowState(projectId, response.workflowState)
      currentStage.value = 'chapters'
    }, '生成章节卡失败')
  }

  async function approveChapterCard(chapterCardId: string): Promise<void> {
    await run(async () => {
      const projectId = activeProjectId.value
      const response = await window.characterArc.zeroApproveChapterCard(toIpcPayload({ projectId, chapterCardId }))
      if (!response.success) throw new Error(response.error ?? '审核章节卡失败')
      setWorkflowState(projectId, response.workflowState)
      currentStage.value = 'draft'
    }, '审核章节卡失败')
  }

  async function generateChapterDraftV2(chapterCardId: string): Promise<void> {
    await run(async () => {
      const appStore = useAppStore()
      const projectId = activeProjectId.value
      const response = await window.characterArc.zeroGenerateChapterDraftV2(toIpcPayload({
        projectId,
        chapterCardId,
        settings: appStore.appSettings
      }))
      if (!response.success || !response.chapterId) throw new Error(response.error ?? '生成章节正文失败')
      chapterCardsByProject.value = {
        ...chapterCardsByProject.value,
        [projectId]: chapterCards.value.map((card) =>
          card.id === chapterCardId
            ? { ...card, chapterId: response.chapterId ?? card.chapterId, status: 'drafted' }
            : card
        )
      }
      setWorkflowState(projectId, response.workflowState)
      currentStage.value = 'draft'
    }, '生成章节正文失败')
  }

  async function auditChapterQuality(chapterId: string, chapterCardId?: string, content?: string): Promise<void> {
    await run(async () => {
      const appStore = useAppStore()
      const projectId = activeProjectId.value
      const response = await window.characterArc.zeroAuditChapterQuality(toIpcPayload({
        projectId,
        chapterId,
        chapterCardId,
        content,
        settings: appStore.appSettings
      }))
      if (!response.success || !response.report) throw new Error(response.error ?? '生成质量报告失败')
      qualityReportsByChapter.value = {
        ...qualityReportsByChapter.value,
        [chapterId]: [response.report, ...(qualityReportsByChapter.value[chapterId] ?? [])]
      }
    }, '生成质量报告失败')
  }

  async function generateSubmissionPackage(): Promise<void> {
    await run(async () => {
      const appStore = useAppStore()
      const projectId = activeProjectId.value
      const response = await window.characterArc.zeroGenerateSubmissionPackage(toIpcPayload({
        projectId,
        settings: appStore.appSettings,
        exportFormat: 'folder'
      }))
      if (!response.success || !response.package) throw new Error(response.error ?? '生成投稿包失败')
      submissionPackageByProject.value = {
        ...submissionPackageByProject.value,
        [projectId]: response.package
      }
      setWorkflowState(projectId, response.workflowState)
      currentStage.value = 'submission'
    }, '生成投稿包失败')
  }

  async function exportSubmissionPackage(exportFormat: 'folder' | 'txt' | 'docx' | 'json' = 'folder'): Promise<void> {
    await run(async () => {
      const projectId = activeProjectId.value
      const response = await window.characterArc.zeroExportSubmissionPackage(toIpcPayload({
        projectId,
        packageId: submissionPackage.value?.id,
        exportFormat
      }))
      if (!response.success || !response.package) throw new Error(response.error ?? '导出投稿包失败')
      submissionPackageByProject.value = {
        ...submissionPackageByProject.value,
        [projectId]: response.package
      }
      lastSubmissionExportPath.value = response.folderPath ?? response.filePath ?? ''
    }, '导出投稿包失败')
  }

  return {
    activeProjectId,
    currentStage,
    workflowState,
    workflowStateByProject,
    inspirationCards,
    inspirationCardsByProject,
    styleFingerprints,
    styleFingerprintsByProject,
    synopsisCandidates,
    synopsisCandidatesByProject,
    masterOutline,
    masterOutlineByProject,
    chapterCards,
    chapterCardsByProject,
    qualityReportsByChapter,
    latestQualityReports,
    submissionPackage,
    submissionPackageByProject,
    isRunning,
    lastError,
    lastSubmissionExportPath,
    hydrate,
    startFromWizard,
    generateIdeas,
    approveIdea,
    mergeIdeas,
    saveStyleFingerprint,
    generateStyleFusion,
    generateTitleSynopsis,
    approveTitleSynopsis,
    generateMasterOutline,
    approveMasterOutline,
    generateChapterCards,
    approveChapterCard,
    generateChapterDraftV2,
    auditChapterQuality,
    generateSubmissionPackage,
    exportSubmissionPackage
  }
})
