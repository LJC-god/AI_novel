import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const requiredFiles = [
  'renderer/src/stores/zeroStart.ts',
  'renderer/src/pages/ZeroStartWizardPage.vue',
  'renderer/src/features/zeroStart/types.ts',
  'renderer/src/features/zeroStart/constants.ts',
  'renderer/src/features/zeroStart/composables/useZeroWorkflow.ts',
  'renderer/src/features/zeroStart/components/ZeroStartWizard.vue',
  'renderer/src/features/zeroStart/components/IdeaCardGrid.vue',
  'renderer/src/features/zeroStart/components/IdeaReviewPanel.vue',
  'renderer/src/features/zeroStart/components/StyleFingerprintPanel.vue',
  'renderer/src/features/zeroStart/components/StyleFusionPanel.vue',
  'renderer/src/features/zeroStart/components/TitleSynopsisReviewPanel.vue',
  'renderer/src/features/zeroStart/components/MasterOutlineReviewPanel.vue',
  'renderer/src/features/zeroStart/components/ChapterCardBoard.vue',
  'renderer/src/features/zeroStart/components/SubmissionPackagePanel.vue'
]

for (const file of requiredFiles) {
  assert.ok(existsSync(file), `missing ${file}`)
}

const appStoreSource = readFileSync('renderer/src/stores/app.ts', 'utf-8')
const appSource = readFileSync('renderer/src/App.vue', 'utf-8')
const projectCenterSource = readFileSync('renderer/src/pages/ProjectCenter.vue', 'utf-8')
const zeroStoreSource = readFileSync('renderer/src/stores/zeroStart.ts', 'utf-8')
const zeroPageSource = readFileSync('renderer/src/pages/ZeroStartWizardPage.vue', 'utf-8')

assert.ok(appStoreSource.includes("'zero-start'"), 'app store currentView must include zero-start')
assert.ok(appStoreSource.includes('openZeroStart'), 'app store must expose openZeroStart')
assert.ok(appSource.includes('ZeroStartWizardPage'), 'App.vue must render ZeroStartWizardPage')
assert.ok(projectCenterSource.includes('openZeroStart'), 'ProjectCenter create action must open zero-start flow')

for (const method of [
  'zeroGenerateIdeas',
  'zeroApproveIdea',
  'zeroGenerateTitleSynopsis',
  'zeroGenerateMasterOutline',
  'zeroGenerateChapterCards',
  'zeroGenerateChapterDraftV2',
  'zeroGenerateSubmissionPackage'
]) {
  assert.ok(zeroStoreSource.includes(method), `zeroStart store must call ${method}`)
}

for (const token of ['ZeroStartWizard', 'IdeaReviewPanel', 'TitleSynopsisReviewPanel', 'MasterOutlineReviewPanel', 'ChapterCardBoard', 'SubmissionPackagePanel']) {
  assert.ok(zeroPageSource.includes(token), `ZeroStartWizardPage must include ${token}`)
}

const componentDir = 'renderer/src/features/zeroStart/components'
for (const name of ['IdeaCardGrid.vue', 'TitleSynopsisReviewPanel.vue', 'MasterOutlineReviewPanel.vue', 'ChapterCardBoard.vue', 'SubmissionPackagePanel.vue']) {
  const source = readFileSync(join(componentDir, name), 'utf-8')
  assert.ok(source.includes('defineEmits') || source.includes('defineModel'), `${name} must expose user review actions`)
}

console.log('ZeroStart frontend flow contract verified.')
