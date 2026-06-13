import type { ChapterQualityIssue, ChapterQualityReport } from '../types'

function createIssue(category: string, message: string, suggestion: string): ChapterQualityIssue {
  return {
    severity: 'warning',
    category,
    message,
    suggestion
  }
}

function hasIssue(issues: ChapterQualityIssue[], category: string, message: string): boolean {
  return issues.some((issue) => issue.category === category && issue.message === message)
}

function appendIssue(
  issues: ChapterQualityIssue[],
  category: string,
  message: string,
  suggestion: string
): ChapterQualityIssue[] {
  if (hasIssue(issues, category, message)) return issues
  return [...issues, createIssue(category, message, suggestion)]
}

export function applyChapterQualityGuardrails(report: ChapterQualityReport): ChapterQualityReport {
  let issues = [...report.issues]

  if (report.continuityScore < 70) {
    issues = appendIssue(
      issues,
      'continuity',
      'Continuity score is below the PRD pass line.',
      'Review character state, timeline, props, and foreshadowing before continuing.'
    )
  }

  if (report.styleMatchScore < 65) {
    issues = appendIssue(
      issues,
      'style',
      'Style match score is below the PRD pass line.',
      'Revise the chapter against the approved project style fingerprint and avoid rules.'
    )
  }

  if (report.targetWordCount > 0 && report.wordCount < report.targetWordCount * 0.7) {
    issues = appendIssue(
      issues,
      'word-count',
      'Chapter word count is below 70% of the target.',
      'Expand missing scenes, emotional beats, or conflict turns before approving the chapter.'
    )
  }

  const hasCriticalIssue = issues.some((issue) => issue.severity === 'critical')
  const passesHardRules =
    report.continuityScore >= 70
    && report.styleMatchScore >= 65
    && !hasCriticalIssue
    && (report.targetWordCount <= 0 || report.wordCount >= report.targetWordCount * 0.7)

  return {
    ...report,
    issues,
    passed: report.passed && passesHardRules
  }
}
