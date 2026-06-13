import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'

import { getWorkspaceDirPath } from '../../workspace-store'
import type { ChapterQualityReport, MasterOutline, SubmissionPackage } from '../types'

export type SubmissionExportFormat = 'folder' | 'txt' | 'docx' | 'json'

export type SubmissionExportResult = {
  package: SubmissionPackage
  folderPath: string
  filePath?: string
}

type ProjectRow = {
  id: string
  title: string
  genre: string
  targetPlatform: string
}

type ChapterExportRow = {
  id: string
  title: string
  content: string
  sortOrder: number
  volumeId: string
  volumeTitle: string
  wordTarget: string
}

type QualityReportRow = {
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
  platformRiskJson: string
  issuesJson: string
  passed: number
  createdAt: string
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string' || !value.trim()) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function sanitizeSegment(value: string): string {
  const cleaned = value.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').replace(/\s+/g, '-')
  return cleaned.slice(0, 80) || 'untitled'
}

function collectTipTapText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const record = node as Record<string, unknown>
  const text = typeof record.text === 'string' ? record.text : ''
  const children = Array.isArray(record.content)
    ? record.content.map((child) => collectTipTapText(child)).filter(Boolean).join('\n')
    : ''
  return [text, children].filter(Boolean).join(text && children ? '\n' : '')
}

function normalizeChapterContent(content: string): string {
  const trimmed = content.trim()
  if (!trimmed.startsWith('{')) return trimmed
  const parsed = parseJson<unknown>(trimmed, null)
  const tiptapText = collectTipTapText(parsed)
  return tiptapText.trim() || trimmed
}

function countTextUnits(content: string): number {
  return content.replace(/\s+/g, '').length
}

function loadProject(db: DatabaseSync, projectId: string): ProjectRow {
  const row = db.prepare(`
    SELECT
      id,
      title,
      genre,
      target_platform AS targetPlatform
    FROM projects
    WHERE id = ?
  `).get(projectId) as ProjectRow | undefined
  if (!row) throw new Error('Project not found for submission export.')
  return row
}

function loadChapters(db: DatabaseSync, projectId: string): ChapterExportRow[] {
  return db.prepare(`
    SELECT
      c.id,
      c.title,
      c.content,
      c.sort_order AS sortOrder,
      c.volume_id AS volumeId,
      c.word_target AS wordTarget,
      COALESCE(v.title, '') AS volumeTitle
    FROM chapters c
    LEFT JOIN outline_volumes v ON v.id = c.volume_id AND v.project_id = c.project_id
    WHERE c.project_id = ?
    ORDER BY c.sort_order ASC, c.rowid ASC
  `).all(projectId) as ChapterExportRow[]
}

function loadApprovedOutline(db: DatabaseSync, projectId: string): MasterOutline | Record<string, unknown> {
  const row = db.prepare(`
    SELECT outline_json AS outlineJson
    FROM outline_snapshots
    WHERE project_id = ? AND status = 'approved'
    ORDER BY version_no DESC, rowid DESC
    LIMIT 1
  `).get(projectId) as { outlineJson?: string } | undefined
  return parseJson<MasterOutline | Record<string, unknown>>(row?.outlineJson, {})
}

function loadQualityReports(db: DatabaseSync, projectId: string): ChapterQualityReport[] {
  const rows = db.prepare(`
    SELECT
      id,
      project_id AS projectId,
      chapter_id AS chapterId,
      word_count AS wordCount,
      target_word_count AS targetWordCount,
      pacing_score AS pacingScore,
      hook_score AS hookScore,
      style_match_score AS styleMatchScore,
      continuity_score AS continuityScore,
      originality_risk AS originalityRisk,
      ai_flavor_risk AS aiFlavorRisk,
      platform_risk_json AS platformRiskJson,
      issues_json AS issuesJson,
      passed,
      created_at AS createdAt
    FROM chapter_quality_reports
    WHERE project_id = ?
    ORDER BY created_at DESC, rowid DESC
  `).all(projectId) as QualityReportRow[]

  return rows.map((row) => ({
    id: row.id,
    projectId: row.projectId,
    chapterId: row.chapterId,
    wordCount: row.wordCount,
    targetWordCount: row.targetWordCount,
    pacingScore: row.pacingScore,
    hookScore: row.hookScore,
    styleMatchScore: row.styleMatchScore,
    continuityScore: row.continuityScore,
    originalityRisk: row.originalityRisk,
    aiFlavorRisk: row.aiFlavorRisk,
    platformRisk: parseJson<string[]>(row.platformRiskJson, []),
    issues: parseJson<ChapterQualityReport['issues']>(row.issuesJson, []),
    passed: Boolean(row.passed),
    createdAt: row.createdAt
  }))
}

function buildChecklistMarkdown(submissionPackage: SubmissionPackage): string {
  return [
    '# Submission checklist',
    '',
    ...submissionPackage.checklist.map((item) =>
      `- [${item.passed ? 'x' : ' '}] ${item.label}${item.detail ? ` - ${item.detail}` : ''}`
    ),
    '',
    'Manual review is still required before submitting to any platform.'
  ].join('\n')
}

function buildTitleSynopsisMarkdown(project: ProjectRow, submissionPackage: SubmissionPackage): string {
  return [
    `# ${submissionPackage.title || project.title}`,
    '',
    `Target platform: ${submissionPackage.targetPlatform || project.targetPlatform || 'generic'}`,
    `Genre: ${project.genre}`,
    '',
    '## Short synopsis',
    '',
    submissionPackage.introShort,
    '',
    '## Long synopsis',
    '',
    submissionPackage.introLong
  ].join('\n')
}

function buildChapterTocMarkdown(chapters: ChapterExportRow[]): string {
  return [
    '# Chapter table of contents',
    '',
    ...chapters.map((chapter, index) => {
      const content = normalizeChapterContent(chapter.content)
      return `- ${index + 1}. ${chapter.title} (${countTextUnits(content)} chars, ${chapter.wordTarget || 'no target'})`
    })
  ].join('\n')
}

function buildManuscriptText(project: ProjectRow, chapters: ChapterExportRow[]): string {
  const lines: string[] = [`# ${project.title}`, '']
  let activeVolumeId = ''
  for (const [index, chapter] of chapters.entries()) {
    if (chapter.volumeId && chapter.volumeId !== activeVolumeId) {
      activeVolumeId = chapter.volumeId
      if (chapter.volumeTitle) lines.push(`## ${chapter.volumeTitle}`, '')
    }
    lines.push(`Chapter ${index + 1}: ${chapter.title}`, '', normalizeChapterContent(chapter.content), '')
  }
  return lines.join('\n')
}

function buildRiskMarkdown(submissionPackage: SubmissionPackage, qualityReports: ChapterQualityReport[]): string {
  const failedReports = qualityReports.filter((report) => !report.passed)
  return [
    '# Platform and originality risk',
    '',
    'This report is a preparation aid. It does not guarantee signing, ranking, traffic, or income.',
    '',
    '## AI risk report',
    '',
    JSON.stringify(submissionPackage.riskReport, null, 2),
    '',
    '## Quality report summary',
    '',
    `- Total quality reports: ${qualityReports.length}`,
    `- Reports needing revision: ${failedReports.length}`,
    `- Critical issues: ${qualityReports.flatMap((report) => report.issues).filter((issue) => issue.severity === 'critical').length}`
  ].join('\n')
}

async function writeDocx(filePath: string, project: ProjectRow, chapters: ChapterExportRow[]): Promise<void> {
  const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import('docx')
  const children = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: project.title, bold: true, size: 36 })]
    }),
    ...chapters.flatMap((chapter, index) => [
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: `Chapter ${index + 1}: ${chapter.title}`, bold: true, size: 28 })]
      }),
      ...normalizeChapterContent(chapter.content)
        .split(/\r?\n/)
        .map((line) =>
          new Paragraph({
            spacing: { line: 360 },
            children: [new TextRun({ text: line, size: 24 })]
          })
        )
    ])
  ]

  const doc = new Document({
    creator: 'CharacterArc ZeroStart',
    title: project.title,
    sections: [{ children }]
  })
  await writeFile(filePath, await Packer.toBuffer(doc))
}

export async function exportSubmissionPackage(
  db: DatabaseSync,
  projectId: string,
  submissionPackage: SubmissionPackage,
  exportFormat: SubmissionExportFormat = 'folder'
): Promise<SubmissionExportResult> {
  const persisted = db.prepare(`
    SELECT id FROM submission_packages WHERE id = ? AND project_id = ?
  `).get(submissionPackage.id, projectId)
  if (!persisted) throw new Error('Submission package must be persisted before export.')

  const project = loadProject(db, projectId)
  const chapters = loadChapters(db, projectId)
  const outline = loadApprovedOutline(db, projectId)
  const qualityReports = loadQualityReports(db, projectId)
  const folderPath = join(
    getWorkspaceDirPath(),
    'submission-packages',
    sanitizeSegment(projectId),
    sanitizeSegment(submissionPackage.id)
  )
  await mkdir(folderPath, { recursive: true })

  const txtPath = join(folderPath, '05_manuscript.txt')
  const docxPath = join(folderPath, '05_manuscript.docx')
  const snapshotPath = join(folderPath, 'project-snapshot.json')
  const exportedPackage: SubmissionPackage = {
    ...submissionPackage,
    manuscriptPath: txtPath,
    exportFormat
  }

  const snapshot = {
    exportedAt: new Date().toISOString(),
    project,
    package: exportedPackage,
    outline,
    chapters: chapters.map((chapter, index) => ({
      id: chapter.id,
      title: chapter.title,
      order: index + 1,
      volumeId: chapter.volumeId,
      volumeTitle: chapter.volumeTitle,
      wordTarget: chapter.wordTarget,
      characterCount: countTextUnits(normalizeChapterContent(chapter.content))
    })),
    qualityReports
  }

  await writeFile(join(folderPath, '00_submission_checklist.md'), buildChecklistMarkdown(exportedPackage), 'utf-8')
  await writeFile(join(folderPath, '01_title_synopsis.md'), buildTitleSynopsisMarkdown(project, exportedPackage), 'utf-8')
  await writeFile(join(folderPath, '02_tags_selling_points.json'), JSON.stringify({
    tags: exportedPackage.tags,
    riskReport: exportedPackage.riskReport
  }, null, 2), 'utf-8')
  await writeFile(join(folderPath, '03_master_outline.json'), JSON.stringify(outline, null, 2), 'utf-8')
  await writeFile(join(folderPath, '04_chapter_toc.md'), buildChapterTocMarkdown(chapters), 'utf-8')
  await writeFile(txtPath, buildManuscriptText(project, chapters), 'utf-8')
  await writeDocx(docxPath, project, chapters)
  await writeFile(join(folderPath, '06_quality_reports.json'), JSON.stringify(qualityReports, null, 2), 'utf-8')
  await writeFile(join(folderPath, '07_platform_risk.md'), buildRiskMarkdown(exportedPackage, qualityReports), 'utf-8')
  await writeFile(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf-8')

  return {
    package: exportedPackage,
    folderPath,
    filePath: exportFormat === 'docx'
      ? docxPath
      : exportFormat === 'json'
        ? snapshotPath
        : exportFormat === 'txt'
          ? txtPath
          : undefined
  }
}
