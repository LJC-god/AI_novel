import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'

import { ensureZeroStartSchema } from '../electron/main/zero-start/schema.ts'
import { createZeroStartRepositories } from '../electron/main/zero-start/repositories/index.ts'

function tableNames(db) {
  return new Set(
    db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name)
  )
}

function columnNames(db, tableName) {
  return new Set(db.prepare(`PRAGMA table_info('${tableName}')`).all().map((row) => row.name))
}

function setupParentSchema(db) {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL
    ) STRICT;

    CREATE TABLE outline_volumes (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    ) STRICT;

    CREATE TABLE chapters (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      volume_id TEXT NOT NULL,
      title TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (volume_id) REFERENCES outline_volumes(id) ON DELETE CASCADE
    ) STRICT;
  `)
}

function verifyFreshSchema() {
  const db = new DatabaseSync(':memory:')
  setupParentSchema(db)
  ensureZeroStartSchema(db)

  const names = tableNames(db)
  for (const tableName of [
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
  ]) {
    assert.ok(names.has(tableName), `missing table ${tableName}`)
  }

  assert.ok(columnNames(db, 'project_workflow_state').has('cloud_allowed'))
  assert.ok(columnNames(db, 'style_fingerprints').has('avoid_rules_json'))
  assert.ok(columnNames(db, 'chapter_cards').has('hook_ending'))
  assert.ok(columnNames(db, 'workflow_run_steps').has('agent_name'))

  const indexes = new Set(
    db.prepare("SELECT name FROM sqlite_master WHERE type = 'index'").all().map((row) => row.name)
  )
  assert.ok(indexes.has('idx_inspiration_cards_project_status'))
  assert.ok(indexes.has('idx_chapter_cards_project_volume'))
}

function verifyPartialTableMigration() {
  const db = new DatabaseSync(':memory:')
  setupParentSchema(db)
  db.exec(`
    CREATE TABLE style_fingerprints (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL
    ) STRICT;
  `)

  ensureZeroStartSchema(db)

  const columns = columnNames(db, 'style_fingerprints')
  assert.ok(columns.has('avoid_rules_json'), 'partial style_fingerprints table was not migrated')
  assert.ok(columns.has('copyright_safety_note'), 'partial style_fingerprints table lacks safety note')
}

function verifyRepositoryCrudAndCascade() {
  const db = new DatabaseSync(':memory:')
  setupParentSchema(db)
  ensureZeroStartSchema(db)
  db.prepare("INSERT INTO projects (id, title) VALUES ('project-1', 'Legacy Project')").run()
  db.prepare("INSERT INTO outline_volumes (id, project_id, title) VALUES ('volume-1', 'project-1', 'Volume 1')").run()
  db.prepare("INSERT INTO chapters (id, project_id, volume_id, title) VALUES ('chapter-1', 'project-1', 'volume-1', 'Chapter 1')").run()

  const repos = createZeroStartRepositories(db)
  const state = repos.workflowState.getOrCreate('project-1', {
    targetPlatform: 'fanqie',
    targetWords: 300000,
    audience: 'newbie',
    cloudAllowed: false
  })
  assert.equal(state.workflowPhase, 'created')
  assert.equal(state.targetWords, 300000)

  repos.inspirationCards.upsert({
    id: 'idea-1',
    projectId: 'project-1',
    batchId: 'batch-1',
    title: 'A small spark',
    oneLineHook: 'A rookie author finds a dangerous idea.',
    genre: 'urban',
    targetWords: 300000,
    protagonistDesign: 'New writer',
    protagonistGap: 'No experience',
    coreConflict: 'Market pressure',
    openingHooks: ['deadline'],
    longTermDrive: 'Finish the book',
    commercialSellingPoints: ['clear hook'],
    riskNotes: ['avoid imitation'],
    tags: ['newbie'],
    status: 'candidate',
    createdAt: '2026-06-13T00:00:00.000Z',
    updatedAt: '2026-06-13T00:00:00.000Z'
  })
  repos.inspirationCards.setStatus('idea-1', 'project-1', 'approved')

  const cards = repos.inspirationCards.listByProject('project-1')
  assert.equal(cards.length, 1)
  assert.equal(cards[0].status, 'approved')
  assert.notEqual(cards[0].updatedAt, '2026-06-13T00:00:00.000Z')
  assert.deepEqual(cards[0].openingHooks, ['deadline'])

  repos.chapterCards.upsert({
    id: 'card-1',
    projectId: 'project-1',
    volumeId: 'volume-1',
    chapterId: 'chapter-1',
    chapterNo: 1,
    title: 'Start',
    targetWords: 2500,
    pov: 'third',
    chapterGoal: 'Open the workflow',
    coreConflict: 'Blank page',
    scenes: [{ title: 'Desk', goal: 'Begin' }],
    informationGain: ['workflow exists'],
    emotionalBeat: 'hope',
    hookEnding: 'A new button appears.',
    continuityRequirements: ['keep project state'],
    styleRequirements: ['plain'],
    status: 'planned',
    createdAt: '2026-06-13T00:00:00.000Z',
    updatedAt: '2026-06-13T00:00:00.000Z'
  })
  assert.equal(repos.chapterCards.listByProject('project-1')[0].hookEnding, 'A new button appears.')

  db.prepare("DELETE FROM projects WHERE id = 'project-1'").run()
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM inspiration_cards").get().count, 0)
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM chapter_cards").get().count, 0)
}

verifyFreshSchema()
verifyPartialTableMigration()
verifyRepositoryCrudAndCascade()
console.log('ZeroStart schema and repository verification passed.')
