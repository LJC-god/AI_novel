import { DatabaseSync } from 'node:sqlite'
import type {
  ChapterCard,
  ChapterQualityReport,
  InspirationCard,
  OutlineSnapshot,
  ProjectWorkflowState,
  StyleFingerprint,
  SubmissionPackage,
  TitleSynopsisCandidate,
  WorkflowRun,
  WorkflowRunStep
} from '../types'

type DbValue = string | number | null

type FieldKind = 'json' | 'boolean'

type FieldSpec = {
  key: string
  column: string
  kind?: FieldKind
}

type ProjectScopedRecord = {
  id: string
  projectId: string
  status?: string
}

function now(): string {
  return new Date().toISOString()
}

function stringifyJson(value: unknown, fallback: unknown): string {
  try {
    return JSON.stringify(value ?? fallback)
  } catch {
    return JSON.stringify(fallback)
  }
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string' || !value.trim()) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function toDbValue(record: Record<string, unknown>, field: FieldSpec): DbValue {
  const value = record[field.key]

  if (field.kind === 'json') {
    const fallback = field.column.endsWith('_json') && field.column.includes('risk_report') ? {} : []
    return stringifyJson(value, fallback)
  }

  if (field.kind === 'boolean') {
    return value ? 1 : 0
  }

  if (typeof value === 'number') return value
  if (typeof value === 'string') return value
  if (value == null) return ''
  return String(value)
}

function fromDbValue(row: Record<string, unknown>, field: FieldSpec): unknown {
  const value = row[field.column]

  if (field.kind === 'json') {
    const fallback = field.column.includes('risk_report') || field.column === 'outline_json' || field.column === 'input_json' || field.column === 'output_json' || field.column === 'sentence_register_json' ? {} : []
    return parseJson(value, fallback)
  }

  if (field.kind === 'boolean') {
    return Boolean(value)
  }

  return value
}

function mapRow<T>(row: Record<string, unknown> | undefined, fields: FieldSpec[]): T | null {
  if (!row) return null

  const record: Record<string, unknown> = {}
  for (const field of fields) {
    record[field.key] = fromDbValue(row, field)
  }
  return record as T
}

function upsertRecord<T extends Record<string, unknown>>(
  db: DatabaseSync,
  tableName: string,
  fields: FieldSpec[],
  conflictColumns: string[],
  record: T
): void {
  const columns = fields.map((field) => field.column)
  const placeholders = columns.map(() => '?').join(', ')
  const updateColumns = columns.filter((column) => !conflictColumns.includes(column))
  const updateSql = updateColumns.map((column) => `${column} = excluded.${column}`).join(', ')
  const sql = `
    INSERT INTO ${tableName} (${columns.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT(${conflictColumns.join(', ')}) DO UPDATE SET ${updateSql}
  `
  db.prepare(sql).run(...fields.map((field) => toDbValue(record, field)))
}

function createProjectScopedRepository<T extends ProjectScopedRecord>(
  db: DatabaseSync,
  tableName: string,
  fields: FieldSpec[],
  orderBy: string
) {
  return {
    upsert(record: T): void {
      upsertRecord(db, tableName, fields, ['id'], record)
    },
    get(id: string, projectId: string): T | null {
      const row = db.prepare(`SELECT * FROM ${tableName} WHERE id = ? AND project_id = ?`).get(id, projectId) as
        | Record<string, unknown>
        | undefined
      return mapRow<T>(row, fields)
    },
    listByProject(projectId: string): T[] {
      const rows = db.prepare(`SELECT * FROM ${tableName} WHERE project_id = ? ORDER BY ${orderBy}`).all(projectId) as Array<
        Record<string, unknown>
      >
      return rows.map((row) => mapRow<T>(row, fields)).filter((item): item is T => Boolean(item))
    },
    setStatus(id: string, projectId: string, status: string): void {
      db.prepare(`UPDATE ${tableName} SET status = ?, updated_at = ? WHERE id = ? AND project_id = ?`).run(
        status,
        now(),
        id,
        projectId
      )
    },
    deleteById(id: string, projectId: string): void {
      db.prepare(`DELETE FROM ${tableName} WHERE id = ? AND project_id = ?`).run(id, projectId)
    },
    deleteByProject(projectId: string): void {
      db.prepare(`DELETE FROM ${tableName} WHERE project_id = ?`).run(projectId)
    }
  }
}

const WORKFLOW_STATE_FIELDS: FieldSpec[] = [
  { key: 'projectId', column: 'project_id' },
  { key: 'workflowPhase', column: 'workflow_phase' },
  { key: 'approvedIdeaId', column: 'approved_idea_id' },
  { key: 'approvedStyleId', column: 'approved_style_id' },
  { key: 'approvedSynopsisId', column: 'approved_synopsis_id' },
  { key: 'approvedOutlineSnapshotId', column: 'approved_outline_snapshot_id' },
  { key: 'currentVolumeId', column: 'current_volume_id' },
  { key: 'currentChapterId', column: 'current_chapter_id' },
  { key: 'targetPlatform', column: 'target_platform' },
  { key: 'targetWords', column: 'target_words' },
  { key: 'audience', column: 'audience' },
  { key: 'zeroStartMode', column: 'zero_start_mode', kind: 'boolean' },
  { key: 'cloudAllowed', column: 'cloud_allowed', kind: 'boolean' },
  { key: 'createdAt', column: 'created_at' },
  { key: 'updatedAt', column: 'updated_at' }
]

const INSPIRATION_CARD_FIELDS: FieldSpec[] = [
  { key: 'id', column: 'id' },
  { key: 'projectId', column: 'project_id' },
  { key: 'batchId', column: 'batch_id' },
  { key: 'title', column: 'title' },
  { key: 'oneLineHook', column: 'one_line_hook' },
  { key: 'genre', column: 'genre' },
  { key: 'targetWords', column: 'target_words' },
  { key: 'protagonistDesign', column: 'protagonist_design' },
  { key: 'protagonistGap', column: 'protagonist_gap' },
  { key: 'coreConflict', column: 'core_conflict' },
  { key: 'openingHooks', column: 'opening_hooks_json', kind: 'json' },
  { key: 'longTermDrive', column: 'long_term_drive' },
  { key: 'commercialSellingPoints', column: 'commercial_selling_points_json', kind: 'json' },
  { key: 'riskNotes', column: 'risk_notes_json', kind: 'json' },
  { key: 'tags', column: 'tags_json', kind: 'json' },
  { key: 'status', column: 'status' },
  { key: 'createdAt', column: 'created_at' },
  { key: 'updatedAt', column: 'updated_at' }
]

const STYLE_FINGERPRINT_FIELDS: FieldSpec[] = [
  { key: 'id', column: 'id' },
  { key: 'projectId', column: 'project_id' },
  { key: 'sourceReferenceIds', column: 'source_reference_ids_json', kind: 'json' },
  { key: 'title', column: 'title' },
  { key: 'sellPointPattern', column: 'sell_point_pattern' },
  { key: 'protagonistEngine', column: 'protagonist_engine' },
  { key: 'conflictEngine', column: 'conflict_engine' },
  { key: 'povRule', column: 'pov_rule' },
  { key: 'pacingRule', column: 'pacing_rule' },
  { key: 'chapterHookTypes', column: 'chapter_hook_types_json', kind: 'json' },
  { key: 'sentenceRegister', column: 'sentence_register_json', kind: 'json' },
  { key: 'emotionCurve', column: 'emotion_curve' },
  { key: 'structurePattern', column: 'structure_pattern' },
  { key: 'reusableRules', column: 'reusable_rules_json', kind: 'json' },
  { key: 'avoidRules', column: 'avoid_rules_json', kind: 'json' },
  { key: 'copyrightSafetyNote', column: 'copyright_safety_note' },
  { key: 'status', column: 'status' },
  { key: 'createdAt', column: 'created_at' },
  { key: 'updatedAt', column: 'updated_at' }
]

const SYNOPSIS_FIELDS: FieldSpec[] = [
  { key: 'id', column: 'id' },
  { key: 'projectId', column: 'project_id' },
  { key: 'title', column: 'title' },
  { key: 'subtitle', column: 'subtitle' },
  { key: 'introShort', column: 'intro_short' },
  { key: 'introLong', column: 'intro_long' },
  { key: 'sellingPoints', column: 'selling_points_json', kind: 'json' },
  { key: 'tags', column: 'tags_json', kind: 'json' },
  { key: 'targetPlatform', column: 'target_platform' },
  { key: 'audiencePromise', column: 'audience_promise' },
  { key: 'openingExpectation', column: 'opening_expectation' },
  { key: 'riskNotes', column: 'risk_notes_json', kind: 'json' },
  { key: 'status', column: 'status' },
  { key: 'createdAt', column: 'created_at' },
  { key: 'updatedAt', column: 'updated_at' }
]

const OUTLINE_SNAPSHOT_FIELDS: FieldSpec[] = [
  { key: 'id', column: 'id' },
  { key: 'projectId', column: 'project_id' },
  { key: 'versionNo', column: 'version_no' },
  { key: 'outline', column: 'outline_json', kind: 'json' },
  { key: 'status', column: 'status' },
  { key: 'createdAt', column: 'created_at' },
  { key: 'approvedAt', column: 'approved_at' }
]

const CHAPTER_CARD_FIELDS: FieldSpec[] = [
  { key: 'id', column: 'id' },
  { key: 'projectId', column: 'project_id' },
  { key: 'volumeId', column: 'volume_id' },
  { key: 'chapterId', column: 'chapter_id' },
  { key: 'chapterNo', column: 'chapter_no' },
  { key: 'title', column: 'title' },
  { key: 'targetWords', column: 'target_words' },
  { key: 'pov', column: 'pov' },
  { key: 'chapterGoal', column: 'chapter_goal' },
  { key: 'coreConflict', column: 'core_conflict' },
  { key: 'scenes', column: 'scenes_json', kind: 'json' },
  { key: 'informationGain', column: 'information_gain_json', kind: 'json' },
  { key: 'emotionalBeat', column: 'emotional_beat' },
  { key: 'hookEnding', column: 'hook_ending' },
  { key: 'continuityRequirements', column: 'continuity_requirements_json', kind: 'json' },
  { key: 'styleRequirements', column: 'style_requirements_json', kind: 'json' },
  { key: 'status', column: 'status' },
  { key: 'createdAt', column: 'created_at' },
  { key: 'updatedAt', column: 'updated_at' }
]

const QUALITY_REPORT_FIELDS: FieldSpec[] = [
  { key: 'id', column: 'id' },
  { key: 'projectId', column: 'project_id' },
  { key: 'chapterId', column: 'chapter_id' },
  { key: 'wordCount', column: 'word_count' },
  { key: 'targetWordCount', column: 'target_word_count' },
  { key: 'pacingScore', column: 'pacing_score' },
  { key: 'hookScore', column: 'hook_score' },
  { key: 'styleMatchScore', column: 'style_match_score' },
  { key: 'continuityScore', column: 'continuity_score' },
  { key: 'originalityRisk', column: 'originality_risk' },
  { key: 'aiFlavorRisk', column: 'ai_flavor_risk' },
  { key: 'platformRisk', column: 'platform_risk_json', kind: 'json' },
  { key: 'issues', column: 'issues_json', kind: 'json' },
  { key: 'passed', column: 'passed', kind: 'boolean' },
  { key: 'createdAt', column: 'created_at' }
]

const SUBMISSION_PACKAGE_FIELDS: FieldSpec[] = [
  { key: 'id', column: 'id' },
  { key: 'projectId', column: 'project_id' },
  { key: 'targetPlatform', column: 'target_platform' },
  { key: 'title', column: 'title' },
  { key: 'introShort', column: 'intro_short' },
  { key: 'introLong', column: 'intro_long' },
  { key: 'tags', column: 'tags_json', kind: 'json' },
  { key: 'manuscriptPath', column: 'manuscript_path' },
  { key: 'checklist', column: 'checklist_json', kind: 'json' },
  { key: 'riskReport', column: 'risk_report_json', kind: 'json' },
  { key: 'exportFormat', column: 'export_format' },
  { key: 'createdAt', column: 'created_at' }
]

const WORKFLOW_RUN_FIELDS: FieldSpec[] = [
  { key: 'id', column: 'id' },
  { key: 'projectId', column: 'project_id' },
  { key: 'workflowName', column: 'workflow_name' },
  { key: 'phase', column: 'phase' },
  { key: 'status', column: 'status' },
  { key: 'input', column: 'input_json', kind: 'json' },
  { key: 'output', column: 'output_json', kind: 'json' },
  { key: 'error', column: 'error' },
  { key: 'startedAt', column: 'started_at' },
  { key: 'finishedAt', column: 'finished_at' }
]

const WORKFLOW_RUN_STEP_FIELDS: FieldSpec[] = [
  { key: 'id', column: 'id' },
  { key: 'runId', column: 'run_id' },
  { key: 'stepName', column: 'step_name' },
  { key: 'agentName', column: 'agent_name' },
  { key: 'status', column: 'status' },
  { key: 'input', column: 'input_json', kind: 'json' },
  { key: 'output', column: 'output_json', kind: 'json' },
  { key: 'error', column: 'error' },
  { key: 'startedAt', column: 'started_at' },
  { key: 'finishedAt', column: 'finished_at' }
]

export function createProjectWorkflowStateRepository(db: DatabaseSync) {
  return {
    upsert(record: ProjectWorkflowState): void {
      upsertRecord(db, 'project_workflow_state', WORKFLOW_STATE_FIELDS, ['project_id'], record as unknown as Record<string, unknown>)
    },
    get(projectId: string): ProjectWorkflowState | null {
      const row = db.prepare(`SELECT * FROM project_workflow_state WHERE project_id = ?`).get(projectId) as
        | Record<string, unknown>
        | undefined
      return mapRow<ProjectWorkflowState>(row, WORKFLOW_STATE_FIELDS)
    },
    getOrCreate(
      projectId: string,
      defaults: Partial<Pick<ProjectWorkflowState, 'targetPlatform' | 'targetWords' | 'audience' | 'cloudAllowed'>> = {}
    ): ProjectWorkflowState {
      const existing = this.get(projectId)
      if (existing) return existing

      const timestamp = now()
      const record: ProjectWorkflowState = {
        projectId,
        workflowPhase: 'created',
        approvedIdeaId: '',
        approvedStyleId: '',
        approvedSynopsisId: '',
        approvedOutlineSnapshotId: '',
        currentVolumeId: '',
        currentChapterId: '',
        targetPlatform: defaults.targetPlatform ?? 'fanqie',
        targetWords: defaults.targetWords ?? 800000,
        audience: defaults.audience ?? 'general',
        zeroStartMode: true,
        cloudAllowed: defaults.cloudAllowed ?? false,
        createdAt: timestamp,
        updatedAt: timestamp
      }
      this.upsert(record)
      return record
    },
    update(projectId: string, patch: Partial<ProjectWorkflowState>): ProjectWorkflowState | null {
      const current = this.get(projectId)
      if (!current) return null
      const next: ProjectWorkflowState = { ...current, ...patch, projectId, updatedAt: now() }
      this.upsert(next)
      return next
    }
  }
}

export function createWorkflowRunStepRepository(db: DatabaseSync) {
  return {
    upsert(record: WorkflowRunStep): void {
      upsertRecord(db, 'workflow_run_steps', WORKFLOW_RUN_STEP_FIELDS, ['id'], record as unknown as Record<string, unknown>)
    },
    get(id: string, runId: string): WorkflowRunStep | null {
      const row = db.prepare(`SELECT * FROM workflow_run_steps WHERE id = ? AND run_id = ?`).get(id, runId) as
        | Record<string, unknown>
        | undefined
      return mapRow<WorkflowRunStep>(row, WORKFLOW_RUN_STEP_FIELDS)
    },
    listByRun(runId: string): WorkflowRunStep[] {
      const rows = db.prepare(`SELECT * FROM workflow_run_steps WHERE run_id = ? ORDER BY started_at ASC, rowid ASC`).all(runId) as Array<
        Record<string, unknown>
      >
      return rows.map((row) => mapRow<WorkflowRunStep>(row, WORKFLOW_RUN_STEP_FIELDS)).filter((item): item is WorkflowRunStep => Boolean(item))
    },
    deleteByRun(runId: string): void {
      db.prepare(`DELETE FROM workflow_run_steps WHERE run_id = ?`).run(runId)
    }
  }
}

export function createZeroStartRepositories(db: DatabaseSync) {
  return {
    workflowState: createProjectWorkflowStateRepository(db),
    inspirationCards: createProjectScopedRepository<InspirationCard>(db, 'inspiration_cards', INSPIRATION_CARD_FIELDS, 'created_at ASC, rowid ASC'),
    styleFingerprints: createProjectScopedRepository<StyleFingerprint>(db, 'style_fingerprints', STYLE_FINGERPRINT_FIELDS, 'created_at ASC, rowid ASC'),
    synopsisCandidates: createProjectScopedRepository<TitleSynopsisCandidate>(db, 'title_synopsis_candidates', SYNOPSIS_FIELDS, 'created_at ASC, rowid ASC'),
    outlineSnapshots: createProjectScopedRepository<OutlineSnapshot>(db, 'outline_snapshots', OUTLINE_SNAPSHOT_FIELDS, 'version_no ASC, rowid ASC'),
    chapterCards: createProjectScopedRepository<ChapterCard>(db, 'chapter_cards', CHAPTER_CARD_FIELDS, 'volume_id ASC, chapter_no ASC, rowid ASC'),
    qualityReports: createProjectScopedRepository<ChapterQualityReport>(db, 'chapter_quality_reports', QUALITY_REPORT_FIELDS, 'created_at DESC, rowid DESC'),
    submissionPackages: createProjectScopedRepository<SubmissionPackage>(db, 'submission_packages', SUBMISSION_PACKAGE_FIELDS, 'created_at DESC, rowid DESC'),
    workflowRuns: createProjectScopedRepository<WorkflowRun>(db, 'workflow_runs', WORKFLOW_RUN_FIELDS, 'started_at DESC, rowid DESC'),
    workflowRunSteps: createWorkflowRunStepRepository(db)
  }
}
