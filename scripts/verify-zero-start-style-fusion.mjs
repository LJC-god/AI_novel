import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const panelPath = 'renderer/src/features/zeroStart/components/ReferenceStyleFingerprintPanel.vue'
assert.ok(existsSync(panelPath), `missing ${panelPath}`)

const panelSource = readFileSync(panelPath, 'utf-8')
const deconstructionSource = readFileSync('renderer/src/pages/DeconstructionLibraryPage.vue', 'utf-8')
const zeroStoreSource = readFileSync('renderer/src/stores/zeroStart.ts', 'utf-8')
const zeroIpcSource = readFileSync('electron/main/zero-start/ipc.ts', 'utf-8')
const chapterDraftHandler = readFileSync('electron/main/ai/tasks/chapter-draft-v2.ts', 'utf-8')
const chapterCardsHandler = readFileSync('electron/main/ai/tasks/chapter-cards-generate.ts', 'utf-8')

assert.ok(panelSource.includes('ReferenceWorkItem'), 'reference style panel must consume imported reference works')
assert.ok(panelSource.includes('styleRules'), 'reference style panel must reuse existing style rules')
assert.ok(panelSource.includes('avoidRules'), 'reference style panel must keep copyright avoid rules')
assert.ok(panelSource.includes('save-fingerprint'), 'reference style panel must emit save-fingerprint')
assert.ok(panelSource.includes('generate-fusion'), 'reference style panel must emit generate-fusion')

assert.ok(deconstructionSource.includes('ReferenceStyleFingerprintPanel'), 'deconstruction page must render style fingerprint panel')
assert.ok(deconstructionSource.includes('zeroStartStore.saveStyleFingerprint'), 'deconstruction page must save style fingerprints')
assert.ok(deconstructionSource.includes('zeroStartStore.generateStyleFusion'), 'deconstruction page must generate fused project style')
assert.ok(deconstructionSource.includes('appStore.referenceWorks'), 'deconstruction page must reuse imported reference works')

assert.ok(zeroStoreSource.includes('zeroSaveStyleFingerprint'), 'zeroStart store must call style fingerprint save IPC')
assert.ok(zeroStoreSource.includes('zeroGenerateStyleFusion'), 'zeroStart store must call style fusion IPC')
assert.ok(zeroIpcSource.includes("task: 'style-fusion-project'"), 'zero-start IPC must call style-fusion-project')
assert.ok(zeroIpcSource.includes('approvedStyle: getApprovedStyle'), 'zero-start IPC must inject approved style into downstream tasks')
assert.ok(chapterDraftHandler.includes('approvedStyle'), 'chapter-draft-v2 prompt must include approved style context')
assert.ok(chapterCardsHandler.includes('approvedStyle'), 'chapter cards prompt must include approved style context')

console.log('ZeroStart style fusion integration verified.')
