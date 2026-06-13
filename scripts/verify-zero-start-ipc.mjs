import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const channels = [
  'characterarc:zero-workflow-state-get',
  'characterarc:zero-workflow-state-update',
  'characterarc:zero-ideas-generate',
  'characterarc:zero-idea-approve',
  'characterarc:zero-idea-merge',
  'characterarc:style-fingerprint-save',
  'characterarc:style-fusion-generate',
  'characterarc:title-synopsis-generate',
  'characterarc:title-synopsis-approve',
  'characterarc:master-outline-generate',
  'characterarc:master-outline-approve',
  'characterarc:chapter-cards-generate',
  'characterarc:chapter-card-approve',
  'characterarc:chapter-draft-v2',
  'characterarc:chapter-quality-audit',
  'characterarc:submission-package-generate',
  'characterarc:submission-package-export'
]

const preloadMethods = [
  'zeroGetWorkflowState',
  'zeroUpdateWorkflowState',
  'zeroGenerateIdeas',
  'zeroApproveIdea',
  'zeroMergeIdea',
  'zeroSaveStyleFingerprint',
  'zeroGenerateStyleFusion',
  'zeroGenerateTitleSynopsis',
  'zeroApproveTitleSynopsis',
  'zeroGenerateMasterOutline',
  'zeroApproveMasterOutline',
  'zeroGenerateChapterCards',
  'zeroApproveChapterCard',
  'zeroGenerateChapterDraftV2',
  'zeroAuditChapterQuality',
  'zeroGenerateSubmissionPackage',
  'zeroExportSubmissionPackage'
]

const ipcPath = 'electron/main/zero-start/ipc.ts'
assert.ok(existsSync(ipcPath), `missing ${ipcPath}`)

const ipcSource = readFileSync(ipcPath, 'utf-8')
const preloadSource = readFileSync('electron/preload/index.ts', 'utf-8')
const envSource = readFileSync('renderer/src/env.d.ts', 'utf-8')
const mainSource = readFileSync('electron/main/index.ts', 'utf-8')

for (const channel of channels) {
  assert.ok(ipcSource.includes(channel), `missing IPC handler ${channel}`)
  assert.ok(preloadSource.includes(channel), `preload does not invoke ${channel}`)
}

for (const method of preloadMethods) {
  assert.ok(preloadSource.includes(`${method}:`), `missing preload method ${method}`)
  assert.ok(envSource.includes(`${method}:`), `missing window.characterArc type ${method}`)
}

assert.ok(ipcSource.includes('createZeroStartRepositories'), 'zero-start IPC must use repositories')
assert.ok(ipcSource.includes('runAiTask'), 'zero-start IPC must call runAiTask')
assert.ok(ipcSource.includes('workflowRuns.upsert'), 'zero-start IPC must record workflow runs')
assert.ok(ipcSource.includes('workflowRunSteps.upsert'), 'zero-start IPC must record workflow run steps')
assert.ok(mainSource.includes('registerZeroStartIpcHandlers'), 'main process must register zero-start IPC handlers')

console.log('ZeroStart IPC and preload contract verified.')
