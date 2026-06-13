import { DatabaseSync } from 'node:sqlite'

export const ZERO_START_TABLE_NAMES = [
  'project_workflow_state',
  'inspiration_cards',
  'style_fingerprints',
  'title_synopsis_candidates',
  'outline_snapshots',
  'chapter_cards',
  'chapter_quality_reports',
  'submission_packages',
  'workflow_runs',
  'workflow_run_steps'
] as const

const ZERO_START_TABLE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS project_workflow_state (
    project_id TEXT PRIMARY KEY,
    workflow_phase TEXT NOT NULL DEFAULT 'created',
    approved_idea_id TEXT NOT NULL DEFAULT '',
    approved_style_id TEXT NOT NULL DEFAULT '',
    approved_synopsis_id TEXT NOT NULL DEFAULT '',
    approved_outline_snapshot_id TEXT NOT NULL DEFAULT '',
    current_volume_id TEXT NOT NULL DEFAULT '',
    current_chapter_id TEXT NOT NULL DEFAULT '',
    target_platform TEXT NOT NULL DEFAULT 'fanqie',
    target_words INTEGER NOT NULL DEFAULT 800000,
    audience TEXT NOT NULL DEFAULT 'general',
    zero_start_mode INTEGER NOT NULL DEFAULT 1,
    cloud_allowed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  ) STRICT;

  CREATE TABLE IF NOT EXISTS inspiration_cards (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    batch_id TEXT NOT NULL,
    title TEXT NOT NULL,
    one_line_hook TEXT NOT NULL,
    genre TEXT NOT NULL,
    target_words INTEGER NOT NULL,
    protagonist_design TEXT NOT NULL,
    protagonist_gap TEXT NOT NULL,
    core_conflict TEXT NOT NULL,
    opening_hooks_json TEXT NOT NULL DEFAULT '[]',
    long_term_drive TEXT NOT NULL,
    commercial_selling_points_json TEXT NOT NULL DEFAULT '[]',
    risk_notes_json TEXT NOT NULL DEFAULT '[]',
    tags_json TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'candidate',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  ) STRICT;

  CREATE TABLE IF NOT EXISTS style_fingerprints (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    source_reference_ids_json TEXT NOT NULL DEFAULT '[]',
    title TEXT NOT NULL,
    sell_point_pattern TEXT NOT NULL,
    protagonist_engine TEXT NOT NULL,
    conflict_engine TEXT NOT NULL,
    pov_rule TEXT NOT NULL,
    pacing_rule TEXT NOT NULL,
    chapter_hook_types_json TEXT NOT NULL DEFAULT '[]',
    sentence_register_json TEXT NOT NULL DEFAULT '{}',
    emotion_curve TEXT NOT NULL,
    structure_pattern TEXT NOT NULL,
    reusable_rules_json TEXT NOT NULL DEFAULT '[]',
    avoid_rules_json TEXT NOT NULL DEFAULT '[]',
    copyright_safety_note TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  ) STRICT;

  CREATE TABLE IF NOT EXISTS title_synopsis_candidates (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL DEFAULT '',
    intro_short TEXT NOT NULL,
    intro_long TEXT NOT NULL,
    selling_points_json TEXT NOT NULL DEFAULT '[]',
    tags_json TEXT NOT NULL DEFAULT '[]',
    target_platform TEXT NOT NULL DEFAULT 'fanqie',
    audience_promise TEXT NOT NULL,
    opening_expectation TEXT NOT NULL,
    risk_notes_json TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'candidate',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  ) STRICT;

  CREATE TABLE IF NOT EXISTS outline_snapshots (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    version_no INTEGER NOT NULL DEFAULT 1,
    outline_json TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT NOT NULL,
    approved_at TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  ) STRICT;

  CREATE TABLE IF NOT EXISTS chapter_cards (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    volume_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL DEFAULT '',
    chapter_no INTEGER NOT NULL,
    title TEXT NOT NULL,
    target_words INTEGER NOT NULL DEFAULT 2500,
    pov TEXT NOT NULL DEFAULT '',
    chapter_goal TEXT NOT NULL,
    core_conflict TEXT NOT NULL,
    scenes_json TEXT NOT NULL DEFAULT '[]',
    information_gain_json TEXT NOT NULL DEFAULT '[]',
    emotional_beat TEXT NOT NULL DEFAULT '',
    hook_ending TEXT NOT NULL DEFAULT '',
    continuity_requirements_json TEXT NOT NULL DEFAULT '[]',
    style_requirements_json TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'planned',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (volume_id) REFERENCES outline_volumes(id) ON DELETE CASCADE
  ) STRICT;

  CREATE TABLE IF NOT EXISTS chapter_quality_reports (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    word_count INTEGER NOT NULL DEFAULT 0,
    target_word_count INTEGER NOT NULL DEFAULT 0,
    pacing_score REAL NOT NULL DEFAULT 0,
    hook_score REAL NOT NULL DEFAULT 0,
    style_match_score REAL NOT NULL DEFAULT 0,
    continuity_score REAL NOT NULL DEFAULT 0,
    originality_risk TEXT NOT NULL DEFAULT 'low',
    ai_flavor_risk TEXT NOT NULL DEFAULT 'low',
    platform_risk_json TEXT NOT NULL DEFAULT '[]',
    issues_json TEXT NOT NULL DEFAULT '[]',
    passed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
  ) STRICT;

  CREATE TABLE IF NOT EXISTS submission_packages (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    target_platform TEXT NOT NULL DEFAULT 'fanqie',
    title TEXT NOT NULL,
    intro_short TEXT NOT NULL,
    intro_long TEXT NOT NULL,
    tags_json TEXT NOT NULL DEFAULT '[]',
    manuscript_path TEXT NOT NULL DEFAULT '',
    checklist_json TEXT NOT NULL DEFAULT '[]',
    risk_report_json TEXT NOT NULL DEFAULT '{}',
    export_format TEXT NOT NULL DEFAULT 'folder',
    created_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  ) STRICT;

  CREATE TABLE IF NOT EXISTS workflow_runs (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    workflow_name TEXT NOT NULL,
    phase TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'running',
    input_json TEXT NOT NULL DEFAULT '{}',
    output_json TEXT NOT NULL DEFAULT '{}',
    error TEXT NOT NULL DEFAULT '',
    started_at TEXT NOT NULL,
    finished_at TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  ) STRICT;

  CREATE TABLE IF NOT EXISTS workflow_run_steps (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL,
    step_name TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    input_json TEXT NOT NULL DEFAULT '{}',
    output_json TEXT NOT NULL DEFAULT '{}',
    error TEXT NOT NULL DEFAULT '',
    started_at TEXT NOT NULL DEFAULT '',
    finished_at TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (run_id) REFERENCES workflow_runs(id) ON DELETE CASCADE
  ) STRICT;
`

const ZERO_START_INDEX_SCHEMA = `
  CREATE INDEX IF NOT EXISTS idx_inspiration_cards_project_status
    ON inspiration_cards(project_id, status);

  CREATE INDEX IF NOT EXISTS idx_chapter_cards_project_volume
    ON chapter_cards(project_id, volume_id, chapter_no);
`

type ColumnSpec = {
  name: string
  definition: string
}

const ZERO_START_COLUMNS: Record<string, ColumnSpec[]> = {
  project_workflow_state: [
    { name: 'workflow_phase', definition: "TEXT NOT NULL DEFAULT 'created'" },
    { name: 'approved_idea_id', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'approved_style_id', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'approved_synopsis_id', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'approved_outline_snapshot_id', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'current_volume_id', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'current_chapter_id', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'target_platform', definition: "TEXT NOT NULL DEFAULT 'fanqie'" },
    { name: 'target_words', definition: 'INTEGER NOT NULL DEFAULT 800000' },
    { name: 'audience', definition: "TEXT NOT NULL DEFAULT 'general'" },
    { name: 'zero_start_mode', definition: 'INTEGER NOT NULL DEFAULT 1' },
    { name: 'cloud_allowed', definition: 'INTEGER NOT NULL DEFAULT 0' },
    { name: 'created_at', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'updated_at', definition: "TEXT NOT NULL DEFAULT ''" }
  ],
  inspiration_cards: [
    { name: 'batch_id', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'title', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'one_line_hook', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'genre', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'target_words', definition: 'INTEGER NOT NULL DEFAULT 0' },
    { name: 'protagonist_design', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'protagonist_gap', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'core_conflict', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'opening_hooks_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'long_term_drive', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'commercial_selling_points_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'risk_notes_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'tags_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'status', definition: "TEXT NOT NULL DEFAULT 'candidate'" },
    { name: 'created_at', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'updated_at', definition: "TEXT NOT NULL DEFAULT ''" }
  ],
  style_fingerprints: [
    { name: 'source_reference_ids_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'title', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'sell_point_pattern', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'protagonist_engine', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'conflict_engine', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'pov_rule', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'pacing_rule', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'chapter_hook_types_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'sentence_register_json', definition: "TEXT NOT NULL DEFAULT '{}'" },
    { name: 'emotion_curve', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'structure_pattern', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'reusable_rules_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'avoid_rules_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'copyright_safety_note', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'status', definition: "TEXT NOT NULL DEFAULT 'draft'" },
    { name: 'created_at', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'updated_at', definition: "TEXT NOT NULL DEFAULT ''" }
  ],
  title_synopsis_candidates: [
    { name: 'title', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'subtitle', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'intro_short', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'intro_long', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'selling_points_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'tags_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'target_platform', definition: "TEXT NOT NULL DEFAULT 'fanqie'" },
    { name: 'audience_promise', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'opening_expectation', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'risk_notes_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'status', definition: "TEXT NOT NULL DEFAULT 'candidate'" },
    { name: 'created_at', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'updated_at', definition: "TEXT NOT NULL DEFAULT ''" }
  ],
  outline_snapshots: [
    { name: 'version_no', definition: 'INTEGER NOT NULL DEFAULT 1' },
    { name: 'outline_json', definition: "TEXT NOT NULL DEFAULT '{}'" },
    { name: 'status', definition: "TEXT NOT NULL DEFAULT 'draft'" },
    { name: 'created_at', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'approved_at', definition: "TEXT NOT NULL DEFAULT ''" }
  ],
  chapter_cards: [
    { name: 'volume_id', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'chapter_id', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'chapter_no', definition: 'INTEGER NOT NULL DEFAULT 1' },
    { name: 'title', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'target_words', definition: 'INTEGER NOT NULL DEFAULT 2500' },
    { name: 'pov', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'chapter_goal', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'core_conflict', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'scenes_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'information_gain_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'emotional_beat', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'hook_ending', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'continuity_requirements_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'style_requirements_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'status', definition: "TEXT NOT NULL DEFAULT 'planned'" },
    { name: 'created_at', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'updated_at', definition: "TEXT NOT NULL DEFAULT ''" }
  ],
  chapter_quality_reports: [
    { name: 'chapter_id', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'word_count', definition: 'INTEGER NOT NULL DEFAULT 0' },
    { name: 'target_word_count', definition: 'INTEGER NOT NULL DEFAULT 0' },
    { name: 'pacing_score', definition: 'REAL NOT NULL DEFAULT 0' },
    { name: 'hook_score', definition: 'REAL NOT NULL DEFAULT 0' },
    { name: 'style_match_score', definition: 'REAL NOT NULL DEFAULT 0' },
    { name: 'continuity_score', definition: 'REAL NOT NULL DEFAULT 0' },
    { name: 'originality_risk', definition: "TEXT NOT NULL DEFAULT 'low'" },
    { name: 'ai_flavor_risk', definition: "TEXT NOT NULL DEFAULT 'low'" },
    { name: 'platform_risk_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'issues_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'passed', definition: 'INTEGER NOT NULL DEFAULT 0' },
    { name: 'created_at', definition: "TEXT NOT NULL DEFAULT ''" }
  ],
  submission_packages: [
    { name: 'target_platform', definition: "TEXT NOT NULL DEFAULT 'fanqie'" },
    { name: 'title', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'intro_short', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'intro_long', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'tags_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'manuscript_path', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'checklist_json', definition: "TEXT NOT NULL DEFAULT '[]'" },
    { name: 'risk_report_json', definition: "TEXT NOT NULL DEFAULT '{}'" },
    { name: 'export_format', definition: "TEXT NOT NULL DEFAULT 'folder'" },
    { name: 'created_at', definition: "TEXT NOT NULL DEFAULT ''" }
  ],
  workflow_runs: [
    { name: 'workflow_name', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'phase', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'status', definition: "TEXT NOT NULL DEFAULT 'running'" },
    { name: 'input_json', definition: "TEXT NOT NULL DEFAULT '{}'" },
    { name: 'output_json', definition: "TEXT NOT NULL DEFAULT '{}'" },
    { name: 'error', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'started_at', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'finished_at', definition: "TEXT NOT NULL DEFAULT ''" }
  ],
  workflow_run_steps: [
    { name: 'run_id', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'step_name', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'agent_name', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'status', definition: "TEXT NOT NULL DEFAULT 'pending'" },
    { name: 'input_json', definition: "TEXT NOT NULL DEFAULT '{}'" },
    { name: 'output_json', definition: "TEXT NOT NULL DEFAULT '{}'" },
    { name: 'error', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'started_at', definition: "TEXT NOT NULL DEFAULT ''" },
    { name: 'finished_at', definition: "TEXT NOT NULL DEFAULT ''" }
  ]
}

export function ensureZeroStartSchema(db: DatabaseSync): void {
  db.exec(ZERO_START_TABLE_SCHEMA)
  ensureZeroStartColumns(db)
  db.exec(ZERO_START_INDEX_SCHEMA)
}

export function ensureZeroStartColumns(db: DatabaseSync): void {
  for (const tableName of ZERO_START_TABLE_NAMES) {
    const columns = db.prepare(`PRAGMA table_info('${tableName}')`).all() as Array<{ name: string }>
    const columnNames = new Set(columns.map((column) => column.name))
    const specs = ZERO_START_COLUMNS[tableName] ?? []

    for (const spec of specs) {
      if (!columnNames.has(spec.name)) {
        db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${spec.name} ${spec.definition};`)
      }
    }
  }
}
