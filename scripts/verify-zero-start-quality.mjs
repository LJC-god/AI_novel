import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const guardrailPath = 'electron/main/zero-start/services/quality-guardrails.ts'
const panelPath = 'renderer/src/features/zeroStart/components/ChapterQualityPanel.vue'

assert.ok(existsSync(guardrailPath), `missing ${guardrailPath}`)
assert.ok(existsSync(panelPath), `missing ${panelPath}`)

const guardrails = readFileSync(guardrailPath, 'utf-8')
const zeroIpc = readFileSync('electron/main/zero-start/ipc.ts', 'utf-8')
const orchestrator = readFileSync('electron/main/ai/runtime/orchestrator.ts', 'utf-8')
const zeroPage = readFileSync('renderer/src/pages/ZeroStartWizardPage.vue', 'utf-8')
const zeroStore = readFileSync('renderer/src/stores/zeroStart.ts', 'utf-8')
const panel = readFileSync(panelPath, 'utf-8')

assert.ok(guardrails.includes('applyChapterQualityGuardrails'), 'quality guardrail service must expose applyChapterQualityGuardrails')
assert.ok(guardrails.includes('continuityScore < 70'), 'guardrails must enforce continuityScore >= 70')
assert.ok(guardrails.includes('styleMatchScore < 65'), 'guardrails must enforce styleMatchScore >= 65')
assert.ok(guardrails.includes('targetWordCount * 0.7'), 'guardrails must enforce minimum 70% target word count')
assert.ok(guardrails.includes("severity === 'critical'"), 'guardrails must reject critical issues')

assert.ok(zeroIpc.includes('applyChapterQualityGuardrails'), 'chapter-quality-audit IPC must apply guardrails before persistence')
assert.ok(zeroIpc.includes('repos.qualityReports.upsert(guardedReport)'), 'guarded report must be saved')
assert.ok(orchestrator.includes("task.task === 'chapter-draft-v2'"), 'chapter-draft-v2 must trigger post-generation pipeline')

assert.ok(panel.includes('ChapterQualityReport'), 'quality panel must render typed reports')
assert.ok(panel.includes('continuityScore'), 'quality panel must show continuity score')
assert.ok(panel.includes('styleMatchScore'), 'quality panel must show style score')
assert.ok(panel.includes('originalityRisk'), 'quality panel must show originality risk')
assert.ok(zeroPage.includes('ChapterQualityPanel'), 'ZeroStart page must render quality report panel')
assert.ok(zeroStore.includes('latestQualityReports'), 'zeroStart store must expose latest quality reports')

console.log('ZeroStart chapter quality flow verified.')
