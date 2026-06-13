import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const servicePath = 'electron/main/zero-start/services/submission-export-service.ts'
assert.ok(existsSync(servicePath), `missing ${servicePath}`)

const service = readFileSync(servicePath, 'utf-8')
const zeroIpc = readFileSync('electron/main/zero-start/ipc.ts', 'utf-8')
const zeroStore = readFileSync('renderer/src/stores/zeroStart.ts', 'utf-8')
const panel = readFileSync('renderer/src/features/zeroStart/components/SubmissionPackagePanel.vue', 'utf-8')
const preload = readFileSync('electron/preload/index.ts', 'utf-8')

assert.ok(service.includes('exportSubmissionPackage'), 'service must expose exportSubmissionPackage')
assert.ok(service.includes('00_submission_checklist.md'), 'service must write checklist markdown')
assert.ok(service.includes('05_manuscript.txt'), 'service must write manuscript txt')
assert.ok(service.includes('05_manuscript.docx'), 'service must write manuscript docx')
assert.ok(service.includes('project-snapshot.json'), 'service must write project snapshot json')
assert.ok(service.includes('chapter_quality_reports'), 'service must include quality reports')
assert.ok(service.includes('submission_packages'), 'service must use submission package data')
assert.ok(service.includes('Document') && service.includes('Packer.toBuffer'), 'service must generate docx output')

assert.ok(zeroIpc.includes('exportSubmissionPackage'), 'submission-package-export IPC must call export service')
assert.ok(zeroIpc.includes('repos.submissionPackages.upsert(exported.package)'), 'exported package path must be persisted')
assert.ok(preload.includes('zeroExportSubmissionPackage'), 'preload must expose export IPC')
assert.ok(zeroStore.includes('exportSubmissionPackage'), 'zeroStart store must expose export action')
assert.ok(panel.includes('export-package'), 'submission panel must emit export-package')

console.log('ZeroStart submission export verified.')
