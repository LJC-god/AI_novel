import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const tasks = [
  ['zero-idea-cards', 'zeroIdeaCards', 'zeroIdeaCardsResultSchema'],
  ['zero-idea-merge', 'zeroIdeaMerge', 'zeroIdeaMergeResultSchema'],
  ['style-fingerprint-normalize', 'styleFingerprintNormalize', 'styleFingerprintResultSchema'],
  ['style-fusion-project', 'styleFusionProject', 'styleFingerprintResultSchema'],
  ['title-synopsis-generate', 'titleSynopsisGenerate', 'titleSynopsisResultSchema'],
  ['master-outline-generate', 'masterOutlineGenerate', 'masterOutlineResultSchema'],
  ['volume-outline-generate', 'volumeOutlineGenerate', 'volumeOutlineResultSchema'],
  ['chapter-cards-generate', 'chapterCardsGenerate', 'chapterCardsResultSchema'],
  ['chapter-draft-v2', 'chapterDraftV2', 'chapterDraftV2ResultSchema'],
  ['chapter-quality-audit', 'chapterQualityAudit', 'chapterQualityAuditResultSchema'],
  ['submission-package-generate', 'submissionPackageGenerate', 'submissionPackageResultSchema']
]

const taskDir = join('electron', 'main', 'ai', 'tasks')
const indexSource = readFileSync(join(taskDir, 'index.ts'), 'utf-8')
const objectSchemasSource = readFileSync(join(taskDir, 'object-schemas.ts'), 'utf-8')

for (const [taskName, importName, schemaName] of tasks) {
  const fileName = `${taskName}.ts`
  const filePath = join(taskDir, fileName)

  assert.ok(existsSync(filePath), `missing handler file ${filePath}`)

  const source = readFileSync(filePath, 'utf-8')
  assert.ok(source.includes(`name: '${taskName}'`), `${fileName} must declare task name ${taskName}`)
  assert.ok(source.includes("outputType: 'json'"), `${fileName} must use JSON output`)
  assert.ok(source.includes('buildPrompt('), `${fileName} must implement buildPrompt`)
  assert.ok(source.includes('normalize('), `${fileName} must implement normalize`)
  assert.ok(source.includes('validate('), `${fileName} must implement validate`)
  assert.ok(source.includes('describeValidationErrors('), `${fileName} must implement describeValidationErrors`)
  assert.ok(source.includes(schemaName), `${fileName} must validate with ${schemaName}`)

  assert.ok(
    indexSource.includes(`import ${importName} from './${taskName}'`),
    `tasks/index.ts must import ${taskName}`
  )
  assert.ok(indexSource.includes(`register(${importName})`), `tasks/index.ts must register ${taskName}`)
  assert.ok(objectSchemasSource.includes(`'${taskName}'`), `object-schemas.ts must expose schema for ${taskName}`)
}

console.log('ZeroStart AI task handlers verified.')
