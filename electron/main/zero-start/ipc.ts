import { ipcMain } from 'electron'
import { randomUUID } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'

import type {
  AiRunMeta,
  AiTaskName,
  AiTaskPayload,
  ChapterCardsResult,
  ChapterDraftV2Result,
  ChapterQualityAuditResult,
  MasterOutline,
  MasterOutlineResult,
  StyleFingerprintResult,
  SubmissionPackageResult,
  TitleSynopsisResult,
  VolumeOutlineResult,
  ZeroIdeaCardsResult,
  ZeroIdeaMergeResult
} from '../ai/shared-types'
import { runAiTask } from '../ai/runtime'
import { createZeroStartRepositories } from './repositories'
import type {
  ChapterCard,
  ChapterQualityReport,
  InspirationCard,
  MasterOutlineVolume,
  ProjectWorkflowState,
  StyleFingerprint,
  SubmissionPackage,
  TitleSynopsisCandidate,
  WorkflowRun,
  WorkflowRunStep
} from './types'
import type {
  ChapterCardApproveRequest,
  ChapterCardsRequest,
  ChapterDraftV2Request,
  ChapterQualityAuditRequest,
  MasterOutlineApproveRequest,
  MasterOutlineRequest,
  StyleFingerprintSaveRequest,
  StyleFusionRequest,
  SubmissionPackageExportRequest,
  SubmissionPackageRequest,
  TitleSynopsisApproveRequest,
  TitleSynopsisRequest,
  ZeroIdeaApproveRequest,
  ZeroIdeaMergeRequest,
  ZeroIdeasGenerateRequest,
  ZeroWorkflowStateGetRequest,
  ZeroWorkflowStateUpdateRequest
} from '../../shared/zero-start-ipc-types'

type ZeroStartIpcDeps = {
  ensureWorkspaceDb: () => Promise<DatabaseSync>
}

type TrackedTaskOptions = {
  db: DatabaseSync
  projectId: string
  task: AiTaskName
  settings: AiTaskPayload['settings']
  context: Record<string, unknown>
  workflowName: string
  phase: string
  agentName: string
}

type TrackedTaskResult<T> = {
  result: T
  aiRunMeta: AiRunMeta
}

function now(): string {
  return new Date().toISOString()
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${randomUUID().slice(0, 8)}`
}

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {}
}

function requiredString(source: Record<string, unknown>, key: string): string {
  const value = String(source[key] ?? '').trim()
  if (!value) {
    throw new Error(`缺少必要参数：${key}`)
  }
  return value
}

function optionalString(source: Record<string, unknown>, key: string): string {
  return String(source[key] ?? '').trim()
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : []
}

function numberOrUndefined(value: unknown): number | undefined {
  const numeric = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numeric) ? numeric : undefined
}

function getAiRunMeta(error: unknown): AiRunMeta | undefined {
  if (error && typeof error === 'object' && 'aiRunMeta' in error) {
    return (error as { aiRunMeta?: AiRunMeta }).aiRunMeta
  }
  return undefined
}

async function runTrackedZeroTask<T>(options: TrackedTaskOptions): Promise<TrackedTaskResult<T>> {
  const repos = createZeroStartRepositories(options.db)
  const startedAt = now()
  const runId = createId('workflow-run')
  const stepId = createId('workflow-step')

  const runRecord: WorkflowRun = {
    id: runId,
    projectId: options.projectId,
    workflowName: options.workflowName,
    phase: options.phase,
    status: 'running',
    input: { task: options.task, context: options.context },
    output: {},
    error: '',
    startedAt,
    finishedAt: ''
  }
  const stepRecord: WorkflowRunStep = {
    id: stepId,
    runId,
    stepName: options.task,
    agentName: options.agentName,
    status: 'running',
    input: options.context,
    output: {},
    error: '',
    startedAt,
    finishedAt: ''
  }

  repos.workflowRuns.upsert(runRecord)
  repos.workflowRunSteps.upsert(stepRecord)

  try {
    const response = await runAiTask({
      task: options.task,
      settings: options.settings,
      context: { ...options.context, projectId: options.projectId },
      clientKey: options.task
    })
    const finishedAt = now()
    repos.workflowRunSteps.upsert({
      ...stepRecord,
      status: 'success',
      output: { result: response.result, aiRunMeta: response.meta },
      finishedAt
    })
    repos.workflowRuns.upsert({
      ...runRecord,
      status: 'success',
      output: { result: response.result, aiRunMeta: response.meta },
      finishedAt
    })
    return {
      result: response.result as T,
      aiRunMeta: response.meta
    }
  } catch (error) {
    const finishedAt = now()
    const message = toErrorMessage(error, 'ZeroStart AI 任务失败')
    const aiRunMeta = getAiRunMeta(error)
    repos.workflowRunSteps.upsert({
      ...stepRecord,
      status: 'error',
      output: aiRunMeta ? { aiRunMeta } : {},
      error: message,
      finishedAt
    })
    repos.workflowRuns.upsert({
      ...runRecord,
      status: 'error',
      output: aiRunMeta ? { aiRunMeta } : {},
      error: message,
      finishedAt
    })
    throw error
  }
}

function syncOutlineVolumes(db: DatabaseSync, projectId: string, volumes: MasterOutlineVolume[]): void {
  const stmt = db.prepare(`
    INSERT INTO outline_volumes (id, project_id, title, word_target, summary, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      word_target = excluded.word_target,
      summary = excluded.summary,
      sort_order = excluded.sort_order
  `)

  volumes.forEach((volume, index) => {
    stmt.run(volume.id, projectId, volume.title, `${volume.targetWords}字`, volume.summary, index)
  })
}

function upsertDraftChapter(db: DatabaseSync, projectId: string, card: ChapterCard, draft: ChapterDraftV2Result): string {
  const chapterId = card.chapterId || createId('chapter')
  db.prepare(`
    INSERT INTO chapters (id, project_id, volume_id, title, summary, status, word_target, content, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      status = excluded.status,
      word_target = excluded.word_target,
      content = excluded.content,
      sort_order = excluded.sort_order
  `).run(
    chapterId,
    projectId,
    card.volumeId,
    draft.title || card.title,
    card.chapterGoal,
    'draft',
    `约 ${card.targetWords} 字`,
    draft.content,
    card.chapterNo
  )
  return chapterId
}

function latestByProject<T extends { createdAt?: string }>(items: T[]): T | null {
  return items[0] ?? null
}

function getApprovedIdea(cards: InspirationCard[], state: ProjectWorkflowState): InspirationCard | null {
  return cards.find((card) => card.id === state.approvedIdeaId)
    ?? cards.find((card) => card.status === 'approved')
    ?? null
}

function getApprovedStyle(styles: StyleFingerprint[], state: ProjectWorkflowState): StyleFingerprint | null {
  return styles.find((style) => style.id === state.approvedStyleId)
    ?? styles.find((style) => style.status === 'approved')
    ?? null
}

function getApprovedSynopsis(candidates: TitleSynopsisCandidate[], state: ProjectWorkflowState): TitleSynopsisCandidate | null {
  return candidates.find((candidate) => candidate.id === state.approvedSynopsisId)
    ?? candidates.find((candidate) => candidate.status === 'active')
    ?? null
}

function toResponseError(error: unknown, fallback: string): { success: false; error: string; aiRunMeta?: AiRunMeta } {
  const aiRunMeta = getAiRunMeta(error)
  return {
    success: false,
    error: toErrorMessage(error, fallback),
    ...(aiRunMeta ? { aiRunMeta } : {})
  }
}

export function registerZeroStartIpcHandlers(deps: ZeroStartIpcDeps): void {
  ipcMain.handle('characterarc:zero-workflow-state-get', async (_event, payload: ZeroWorkflowStateGetRequest | unknown) => {
    try {
      const request = asRecord(payload)
      const projectId = requiredString(request, 'projectId')
      const db = await deps.ensureWorkspaceDb()
      const state = createZeroStartRepositories(db).workflowState.getOrCreate(
        projectId,
        asRecord(request.defaults) as Partial<Pick<ProjectWorkflowState, 'targetPlatform' | 'targetWords' | 'audience' | 'cloudAllowed'>>
      )
      return { success: true, state }
    } catch (error) {
      return toResponseError(error, '读取零基础流程状态失败')
    }
  })

  ipcMain.handle('characterarc:zero-workflow-state-update', async (_event, payload: ZeroWorkflowStateUpdateRequest | unknown) => {
    try {
      const request = asRecord(payload)
      const projectId = requiredString(request, 'projectId')
      const patch = asRecord(request.patch) as Partial<ProjectWorkflowState>
      const db = await deps.ensureWorkspaceDb()
      const repos = createZeroStartRepositories(db)
      repos.workflowState.getOrCreate(projectId)
      const state = repos.workflowState.update(projectId, patch)
      return { success: true, state }
    } catch (error) {
      return toResponseError(error, '更新零基础流程状态失败')
    }
  })

  ipcMain.handle('characterarc:zero-ideas-generate', async (_event, payload: ZeroIdeasGenerateRequest | unknown) => {
    try {
      const request = asRecord(payload) as ZeroIdeasGenerateRequest
      const projectId = requiredString(asRecord(payload), 'projectId')
      const db = await deps.ensureWorkspaceDb()
      const repos = createZeroStartRepositories(db)
      repos.workflowState.getOrCreate(projectId, {
        targetPlatform: request.input.platform,
        targetWords: request.input.targetWords,
        audience: request.input.audience,
        cloudAllowed: request.input.cloudAllowed
      })
      const tracked = await runTrackedZeroTask<ZeroIdeaCardsResult>({
        db,
        projectId,
        task: 'zero-idea-cards',
        settings: request.settings,
        workflowName: 'zero-start',
        phase: 'idea_generating',
        agentName: 'IdeationAgent',
        context: {
          wizardInput: request.input,
          batchId: createId('idea-batch'),
          genreKey: request.input.genreKey,
          customGenre: request.input.customGenre ?? '',
          targetWords: request.input.targetWords,
          targetPlatform: request.input.platform,
          audience: request.input.audience,
          tone: request.input.tone ?? '',
          seedIdea: request.input.seedIdea ?? '',
          existingIdeaCards: repos.inspirationCards.listByProject(projectId)
        }
      })
      tracked.result.cards.forEach((card) => repos.inspirationCards.upsert(card))
      const workflowState = repos.workflowState.update(projectId, { workflowPhase: 'idea_review' })
      return { success: true, cards: tracked.result.cards, workflowState, aiRunMeta: tracked.aiRunMeta }
    } catch (error) {
      return toResponseError(error, '生成灵感卡失败')
    }
  })

  ipcMain.handle('characterarc:zero-idea-approve', async (_event, payload: ZeroIdeaApproveRequest | unknown) => {
    try {
      const request = asRecord(payload)
      const projectId = requiredString(request, 'projectId')
      const ideaId = requiredString(request, 'ideaId')
      const db = await deps.ensureWorkspaceDb()
      const repos = createZeroStartRepositories(db)
      const card = repos.inspirationCards.get(ideaId, projectId)
      if (!card) throw new Error('灵感卡不存在')
      for (const item of repos.inspirationCards.listByProject(projectId)) {
        repos.inspirationCards.setStatus(item.id, projectId, item.id === ideaId ? 'approved' : item.status === 'candidate' ? 'rejected' : item.status)
      }
      const workflowState = repos.workflowState.update(projectId, {
        workflowPhase: 'idea_approved',
        approvedIdeaId: ideaId,
        targetWords: card.targetWords
      })
      return { success: true, card: { ...card, status: 'approved' }, workflowState }
    } catch (error) {
      return toResponseError(error, '审核灵感卡失败')
    }
  })

  ipcMain.handle('characterarc:zero-idea-merge', async (_event, payload: ZeroIdeaMergeRequest | unknown) => {
    try {
      const request = asRecord(payload) as ZeroIdeaMergeRequest
      const projectId = requiredString(asRecord(payload), 'projectId')
      const db = await deps.ensureWorkspaceDb()
      const repos = createZeroStartRepositories(db)
      const selectedIdeaCards = stringList(request.ideaIds).map((id) => repos.inspirationCards.get(id, projectId)).filter((item): item is InspirationCard => Boolean(item))
      const tracked = await runTrackedZeroTask<ZeroIdeaMergeResult>({
        db,
        projectId,
        task: 'zero-idea-merge',
        settings: request.settings,
        workflowName: 'zero-start',
        phase: 'idea_review',
        agentName: 'IdeaEditorAgent',
        context: {
          selectedIdeaCards,
          userPreference: request.userPreference ?? '',
          workflowState: repos.workflowState.getOrCreate(projectId)
        }
      })
      repos.inspirationCards.upsert(tracked.result.card)
      const workflowState = repos.workflowState.update(projectId, { workflowPhase: 'idea_review' })
      return { success: true, card: tracked.result.card, workflowState, aiRunMeta: tracked.aiRunMeta }
    } catch (error) {
      return toResponseError(error, '合并灵感卡失败')
    }
  })

  ipcMain.handle('characterarc:style-fingerprint-save', async (_event, payload: StyleFingerprintSaveRequest | unknown) => {
    try {
      const request = asRecord(payload) as StyleFingerprintSaveRequest
      const projectId = requiredString(asRecord(payload), 'projectId')
      const fingerprint = request.fingerprint
      const db = await deps.ensureWorkspaceDb()
      const repos = createZeroStartRepositories(db)
      repos.styleFingerprints.upsert(fingerprint)
      const workflowState = repos.workflowState.update(projectId, request.approve || fingerprint.status === 'approved'
        ? { workflowPhase: 'style_approved', approvedStyleId: fingerprint.id }
        : { workflowPhase: 'style_review' })
      return { success: true, fingerprint, workflowState }
    } catch (error) {
      return toResponseError(error, '保存风格卡失败')
    }
  })

  ipcMain.handle('characterarc:style-fusion-generate', async (_event, payload: StyleFusionRequest | unknown) => {
    try {
      const request = asRecord(payload) as StyleFusionRequest
      const projectId = requiredString(asRecord(payload), 'projectId')
      const db = await deps.ensureWorkspaceDb()
      const repos = createZeroStartRepositories(db)
      const state = repos.workflowState.getOrCreate(projectId)
      const styleFingerprints = (request.fingerprintIds?.length
        ? request.fingerprintIds.map((id) => repos.styleFingerprints.get(id, projectId)).filter((item): item is StyleFingerprint => Boolean(item))
        : repos.styleFingerprints.listByProject(projectId))
      const tracked = await runTrackedZeroTask<StyleFingerprintResult>({
        db,
        projectId,
        task: 'style-fusion-project',
        settings: request.settings,
        workflowName: 'zero-start',
        phase: 'style_review',
        agentName: 'StyleFusionAgent',
        context: {
          approvedIdea: getApprovedIdea(repos.inspirationCards.listByProject(projectId), state),
          styleFingerprints,
          userStylePreference: request.userStylePreference ?? '',
          workflowState: state
        }
      })
      repos.styleFingerprints.upsert(tracked.result.fingerprint)
      const workflowState = repos.workflowState.update(projectId, { workflowPhase: 'style_review' })
      return { success: true, fingerprint: tracked.result.fingerprint, workflowState, aiRunMeta: tracked.aiRunMeta }
    } catch (error) {
      return toResponseError(error, '生成融合风格卡失败')
    }
  })

  ipcMain.handle('characterarc:title-synopsis-generate', async (_event, payload: TitleSynopsisRequest | unknown) => {
    try {
      const request = asRecord(payload) as TitleSynopsisRequest
      const projectId = requiredString(asRecord(payload), 'projectId')
      const db = await deps.ensureWorkspaceDb()
      const repos = createZeroStartRepositories(db)
      const state = repos.workflowState.getOrCreate(projectId)
      const tracked = await runTrackedZeroTask<TitleSynopsisResult>({
        db,
        projectId,
        task: 'title-synopsis-generate',
        settings: request.settings,
        workflowName: 'zero-start',
        phase: 'synopsis_generating',
        agentName: 'TitleSynopsisAgent',
        context: {
          approvedIdea: getApprovedIdea(repos.inspirationCards.listByProject(projectId), state),
          approvedStyle: getApprovedStyle(repos.styleFingerprints.listByProject(projectId), state),
          targetPlatform: state.targetPlatform,
          audience: state.audience,
          targetWords: state.targetWords,
          userPreference: request.userPreference ?? ''
        }
      })
      tracked.result.candidates.forEach((candidate) => repos.synopsisCandidates.upsert(candidate))
      const workflowState = repos.workflowState.update(projectId, { workflowPhase: 'synopsis_review' })
      return { success: true, candidates: tracked.result.candidates, workflowState, aiRunMeta: tracked.aiRunMeta }
    } catch (error) {
      return toResponseError(error, '生成书名简介失败')
    }
  })

  ipcMain.handle('characterarc:title-synopsis-approve', async (_event, payload: TitleSynopsisApproveRequest | unknown) => {
    try {
      const request = asRecord(payload)
      const projectId = requiredString(request, 'projectId')
      const synopsisId = requiredString(request, 'synopsisId')
      const db = await deps.ensureWorkspaceDb()
      const repos = createZeroStartRepositories(db)
      const candidate = repos.synopsisCandidates.get(synopsisId, projectId)
      if (!candidate) throw new Error('书名简介候选不存在')
      for (const item of repos.synopsisCandidates.listByProject(projectId)) {
        repos.synopsisCandidates.setStatus(item.id, projectId, item.id === synopsisId ? 'active' : item.status === 'candidate' ? 'rejected' : item.status)
      }
      const workflowState = repos.workflowState.update(projectId, { workflowPhase: 'synopsis_approved', approvedSynopsisId: synopsisId })
      return { success: true, candidate: { ...candidate, status: 'active' }, workflowState }
    } catch (error) {
      return toResponseError(error, '审核书名简介失败')
    }
  })

  ipcMain.handle('characterarc:master-outline-generate', async (_event, payload: MasterOutlineRequest | unknown) => {
    try {
      const request = asRecord(payload) as MasterOutlineRequest
      const projectId = requiredString(asRecord(payload), 'projectId')
      const db = await deps.ensureWorkspaceDb()
      const repos = createZeroStartRepositories(db)
      const state = repos.workflowState.getOrCreate(projectId)
      const tracked = await runTrackedZeroTask<MasterOutlineResult>({
        db,
        projectId,
        task: 'master-outline-generate',
        settings: request.settings,
        workflowName: 'zero-start',
        phase: 'outline_generating',
        agentName: 'OutlineArchitectAgent',
        context: {
          approvedIdea: getApprovedIdea(repos.inspirationCards.listByProject(projectId), state),
          approvedStyle: getApprovedStyle(repos.styleFingerprints.listByProject(projectId), state),
          approvedSynopsis: getApprovedSynopsis(repos.synopsisCandidates.listByProject(projectId), state),
          targetWords: state.targetWords,
          targetPlatform: state.targetPlatform,
          audience: state.audience,
          userPreference: request.userPreference ?? ''
        }
      })
      const outline = tracked.result.outline
      syncOutlineVolumes(db, projectId, outline.volumes)
      const versionNo = repos.outlineSnapshots.listByProject(projectId).length + 1
      repos.outlineSnapshots.upsert({
        id: outline.id,
        projectId,
        versionNo,
        outline: outline as unknown as Record<string, unknown>,
        status: 'draft',
        createdAt: now(),
        approvedAt: ''
      })
      const workflowState = repos.workflowState.update(projectId, {
        workflowPhase: 'outline_review',
        currentVolumeId: outline.volumes[0]?.id ?? ''
      })
      return { success: true, outline, outlineSnapshotId: outline.id, workflowState, aiRunMeta: tracked.aiRunMeta }
    } catch (error) {
      return toResponseError(error, '生成全书大纲失败')
    }
  })

  ipcMain.handle('characterarc:master-outline-approve', async (_event, payload: MasterOutlineApproveRequest | unknown) => {
    try {
      const request = asRecord(payload)
      const projectId = requiredString(request, 'projectId')
      const outlineSnapshotId = requiredString(request, 'outlineSnapshotId')
      const db = await deps.ensureWorkspaceDb()
      const repos = createZeroStartRepositories(db)
      const snapshot = repos.outlineSnapshots.get(outlineSnapshotId, projectId)
      if (!snapshot) throw new Error('大纲快照不存在')
      db.prepare('UPDATE outline_snapshots SET status = ?, approved_at = ? WHERE id = ? AND project_id = ?')
        .run('approved', now(), outlineSnapshotId, projectId)
      const outline = snapshot.outline as unknown as MasterOutline
      syncOutlineVolumes(db, projectId, outline.volumes ?? [])
      const workflowState = repos.workflowState.update(projectId, {
        workflowPhase: 'outline_approved',
        approvedOutlineSnapshotId: outlineSnapshotId,
        currentVolumeId: outline.volumes?.[0]?.id ?? ''
      })
      return { success: true, outlineSnapshotId, workflowState }
    } catch (error) {
      return toResponseError(error, '审核全书大纲失败')
    }
  })

  ipcMain.handle('characterarc:chapter-cards-generate', async (_event, payload: ChapterCardsRequest | unknown) => {
    try {
      const request = asRecord(payload) as ChapterCardsRequest
      const projectId = requiredString(asRecord(payload), 'projectId')
      const db = await deps.ensureWorkspaceDb()
      const repos = createZeroStartRepositories(db)
      const state = repos.workflowState.getOrCreate(projectId)
      const outlineSnapshot = state.approvedOutlineSnapshotId
        ? repos.outlineSnapshots.get(state.approvedOutlineSnapshotId, projectId)
        : latestByProject(repos.outlineSnapshots.listByProject(projectId))
      const tracked = await runTrackedZeroTask<ChapterCardsResult>({
        db,
        projectId,
        task: 'chapter-cards-generate',
        settings: request.settings,
        workflowName: 'zero-start',
        phase: 'chapter_cards_generating',
        agentName: 'ChapterCardAgent',
        context: {
          volumeId: request.volumeId || state.currentVolumeId,
          masterOutline: outlineSnapshot?.outline ?? {},
          approvedStyle: getApprovedStyle(repos.styleFingerprints.listByProject(projectId), state),
          approvedSynopsis: getApprovedSynopsis(repos.synopsisCandidates.listByProject(projectId), state),
          startChapterNo: request.startChapterNo ?? 1,
          chapterCount: request.chapterCount ?? 5,
          userInstruction: request.userInstruction ?? '',
          existingChapterCards: repos.chapterCards.listByProject(projectId)
        }
      })
      tracked.result.cards.forEach((card) => repos.chapterCards.upsert(card))
      const workflowState = repos.workflowState.update(projectId, {
        workflowPhase: 'chapter_cards_review',
        currentVolumeId: tracked.result.cards[0]?.volumeId ?? state.currentVolumeId
      })
      return { success: true, cards: tracked.result.cards, workflowState, aiRunMeta: tracked.aiRunMeta }
    } catch (error) {
      return toResponseError(error, '生成章节卡失败')
    }
  })

  ipcMain.handle('characterarc:chapter-card-approve', async (_event, payload: ChapterCardApproveRequest | unknown) => {
    try {
      const request = asRecord(payload)
      const projectId = requiredString(request, 'projectId')
      const chapterCardId = requiredString(request, 'chapterCardId')
      const db = await deps.ensureWorkspaceDb()
      const repos = createZeroStartRepositories(db)
      const card = repos.chapterCards.get(chapterCardId, projectId)
      if (!card) throw new Error('章节卡不存在')
      repos.chapterCards.setStatus(chapterCardId, projectId, 'approved')
      const workflowState = repos.workflowState.update(projectId, {
        workflowPhase: 'drafting',
        currentVolumeId: card.volumeId,
        currentChapterId: card.chapterId
      })
      return { success: true, card: { ...card, status: 'approved' }, workflowState }
    } catch (error) {
      return toResponseError(error, '审核章节卡失败')
    }
  })

  ipcMain.handle('characterarc:chapter-draft-v2', async (_event, payload: ChapterDraftV2Request | unknown) => {
    try {
      const request = asRecord(payload) as ChapterDraftV2Request
      const projectId = requiredString(asRecord(payload), 'projectId')
      const db = await deps.ensureWorkspaceDb()
      const repos = createZeroStartRepositories(db)
      const state = repos.workflowState.getOrCreate(projectId)
      const card = repos.chapterCards.get(request.chapterCardId, projectId)
      if (!card) throw new Error('章节卡不存在')
      const tracked = await runTrackedZeroTask<ChapterDraftV2Result>({
        db,
        projectId,
        task: 'chapter-draft-v2',
        settings: request.settings,
        workflowName: 'zero-start',
        phase: 'drafting',
        agentName: 'DraftWriterAgent',
        context: {
          chapterId: card.chapterId,
          chapterCard: card,
          approvedStyle: getApprovedStyle(repos.styleFingerprints.listByProject(projectId), state),
          storyMemory: {},
          targetWords: card.targetWords,
          revisionInstruction: request.revisionInstruction ?? ''
        }
      })
      const chapterId = upsertDraftChapter(db, projectId, card, tracked.result)
      repos.chapterCards.upsert({ ...card, chapterId, status: 'drafted', updatedAt: now() })
      const workflowState = repos.workflowState.update(projectId, { workflowPhase: 'revision', currentChapterId: chapterId })
      return {
        success: true,
        chapterId,
        title: tracked.result.title,
        content: tracked.result.content,
        draft: tracked.result,
        workflowState,
        aiRunMeta: tracked.aiRunMeta
      }
    } catch (error) {
      return toResponseError(error, '生成章节正文失败')
    }
  })

  ipcMain.handle('characterarc:chapter-quality-audit', async (_event, payload: ChapterQualityAuditRequest | unknown) => {
    try {
      const request = asRecord(payload) as ChapterQualityAuditRequest
      const projectId = requiredString(asRecord(payload), 'projectId')
      const chapterId = requiredString(asRecord(payload), 'chapterId')
      const db = await deps.ensureWorkspaceDb()
      const repos = createZeroStartRepositories(db)
      const state = repos.workflowState.getOrCreate(projectId)
      const chapterCard = request.chapterCardId ? repos.chapterCards.get(request.chapterCardId, projectId) : null
      const tracked = await runTrackedZeroTask<ChapterQualityAuditResult>({
        db,
        projectId,
        task: 'chapter-quality-audit',
        settings: request.settings,
        workflowName: 'zero-start',
        phase: 'revision',
        agentName: 'ContinuityAuditorAgent',
        context: {
          chapterId,
          chapterCard,
          chapterDraft: request.content ?? '',
          approvedStyle: getApprovedStyle(repos.styleFingerprints.listByProject(projectId), state),
          targetPlatform: state.targetPlatform,
          targetWordCount: chapterCard?.targetWords ?? 0
        }
      })
      repos.qualityReports.upsert(tracked.result.report)
      return { success: true, report: tracked.result.report, aiRunMeta: tracked.aiRunMeta }
    } catch (error) {
      return toResponseError(error, '生成质量报告失败')
    }
  })

  ipcMain.handle('characterarc:submission-package-generate', async (_event, payload: SubmissionPackageRequest | unknown) => {
    try {
      const request = asRecord(payload) as SubmissionPackageRequest
      const projectId = requiredString(asRecord(payload), 'projectId')
      const db = await deps.ensureWorkspaceDb()
      const repos = createZeroStartRepositories(db)
      const state = repos.workflowState.getOrCreate(projectId)
      const tracked = await runTrackedZeroTask<SubmissionPackageResult>({
        db,
        projectId,
        task: 'submission-package-generate',
        settings: request.settings,
        workflowName: 'zero-start',
        phase: 'export_ready',
        agentName: 'SubmissionAgent',
        context: {
          targetPlatform: state.targetPlatform,
          approvedSynopsis: getApprovedSynopsis(repos.synopsisCandidates.listByProject(projectId), state),
          approvedStyle: getApprovedStyle(repos.styleFingerprints.listByProject(projectId), state),
          masterOutline: state.approvedOutlineSnapshotId ? repos.outlineSnapshots.get(state.approvedOutlineSnapshotId, projectId)?.outline ?? {} : {},
          qualityReports: repos.qualityReports.listByProject(projectId),
          exportFormat: request.exportFormat ?? 'folder',
          manuscriptPath: request.manuscriptPath ?? '',
          userInstruction: request.userInstruction ?? ''
        }
      })
      repos.submissionPackages.upsert(tracked.result.package)
      const workflowState = repos.workflowState.update(projectId, { workflowPhase: 'export_ready' })
      return { success: true, package: tracked.result.package, workflowState, aiRunMeta: tracked.aiRunMeta }
    } catch (error) {
      return toResponseError(error, '生成投稿包失败')
    }
  })

  ipcMain.handle('characterarc:submission-package-export', async (_event, payload: SubmissionPackageExportRequest | unknown) => {
    try {
      const request = asRecord(payload)
      const projectId = requiredString(request, 'projectId')
      const packageId = optionalString(request, 'packageId')
      const db = await deps.ensureWorkspaceDb()
      const repos = createZeroStartRepositories(db)
      const packages = repos.submissionPackages.listByProject(projectId)
      const submissionPackage = packageId
        ? packages.find((item) => item.id === packageId)
        : packages[0]
      if (!submissionPackage) throw new Error('投稿包不存在')
      return { success: true, package: submissionPackage as SubmissionPackage }
    } catch (error) {
      return toResponseError(error, '导出投稿包失败')
    }
  })
}
