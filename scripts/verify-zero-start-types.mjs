import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  chapterCardsResultSchema,
  chapterDraftV2ResultSchema,
  chapterQualityAuditResultSchema,
  masterOutlineResultSchema,
  styleFingerprintResultSchema,
  submissionPackageResultSchema,
  titleSynopsisResultSchema,
  volumeOutlineResultSchema,
  zeroIdeaCardsResultSchema,
  zeroIdeaMergeResultSchema
} from '../electron/main/zero-start/schemas/index.ts'

const zeroStartTaskNames = [
  'zero-idea-cards',
  'zero-idea-merge',
  'style-fingerprint-normalize',
  'style-fusion-project',
  'title-synopsis-generate',
  'master-outline-generate',
  'volume-outline-generate',
  'chapter-cards-generate',
  'chapter-draft-v2',
  'chapter-quality-audit',
  'submission-package-generate'
]

const ideaCard = {
  id: 'idea-1',
  projectId: 'project-1',
  batchId: 'batch-1',
  title: '新手开局',
  oneLineHook: '一个零基础作者被迫在七天内写出投稿稿。',
  genre: 'urban',
  targetWords: 300000,
  protagonistDesign: '零基础新人',
  protagonistGap: '缺经验但有强目标',
  coreConflict: '时间压力与创作能力不足',
  openingHooks: ['七天倒计时'],
  longTermDrive: '完成可投稿作品',
  commercialSellingPoints: ['目标清晰', '强审核节点'],
  riskNotes: ['避免照搬参考作品'],
  tags: ['新人', '创作流'],
  status: 'candidate',
  createdAt: '2026-06-13T00:00:00.000Z',
  updatedAt: '2026-06-13T00:00:00.000Z'
}

const styleFingerprint = {
  id: 'style-1',
  projectId: 'project-1',
  sourceReferenceIds: ['ref-1'],
  title: '快节奏爽文指纹',
  sellPointPattern: '开篇给目标，中段连续兑现',
  protagonistEngine: '弱起点强目标',
  conflictEngine: '外部压力推动选择',
  povRule: '第三人称有限视角',
  pacingRule: '每章至少一次信息推进',
  chapterHookTypes: ['倒计时', '选择题'],
  sentenceRegister: { rhythm: 'short' },
  emotionCurve: '压力-尝试-小胜',
  structurePattern: '问题-尝试-反转-钩子',
  reusableRules: ['每章结尾留钩子'],
  avoidRules: ['不复写参考作品专名'],
  copyrightSafetyNote: '仅保留抽象规则',
  status: 'draft',
  createdAt: '2026-06-13T00:00:00.000Z',
  updatedAt: '2026-06-13T00:00:00.000Z'
}

const synopsis = {
  id: 'synopsis-1',
  projectId: 'project-1',
  title: '七天成稿',
  subtitle: '零基础作者的投稿挑战',
  introShort: '一个新人作者在七天内完成第一本可投稿小说。',
  introLong: '面对倒计时和自我怀疑，他把创作拆成可审核的每一步。',
  sellingPoints: ['强目标', '新人成长'],
  tags: ['都市', '成长'],
  targetPlatform: 'fanqie',
  audiencePromise: '低门槛、高反馈',
  openingExpectation: '第一章交代倒计时压力',
  riskNotes: ['不承诺收益'],
  status: 'candidate',
  createdAt: '2026-06-13T00:00:00.000Z',
  updatedAt: '2026-06-13T00:00:00.000Z'
}

const masterOutline = {
  id: 'outline-1',
  projectId: 'project-1',
  title: '七天成稿全书大纲',
  logline: '新人作者用审核式流水线完成投稿包。',
  theme: '把模糊目标拆成可执行小步',
  targetWords: 300000,
  volumes: [
    {
      id: 'volume-1',
      title: '起步',
      summary: '建立目标和压力。',
      targetWords: 100000,
      arcs: ['从空白到第一章'],
      keyBeats: ['倒计时', '选题', '灵感审核']
    }
  ],
  endingPromise: '完成投稿包',
  risks: ['节奏过慢'],
  status: 'draft',
  createdAt: '2026-06-13T00:00:00.000Z',
  updatedAt: '2026-06-13T00:00:00.000Z'
}

const chapterCard = {
  id: 'card-1',
  projectId: 'project-1',
  volumeId: 'volume-1',
  chapterId: 'chapter-1',
  chapterNo: 1,
  title: '倒计时开始',
  targetWords: 2500,
  pov: 'third',
  chapterGoal: '建立主角目标',
  coreConflict: '想写但不会写',
  scenes: [{ title: '书桌前', goal: '开始' }],
  informationGain: ['七天限制'],
  emotionalBeat: '焦虑转行动',
  hookEnding: '系统给出第一张灵感卡',
  continuityRequirements: ['保留七天限制'],
  styleRequirements: ['句子短促'],
  status: 'planned',
  createdAt: '2026-06-13T00:00:00.000Z',
  updatedAt: '2026-06-13T00:00:00.000Z'
}

const qualityReport = {
  id: 'quality-1',
  projectId: 'project-1',
  chapterId: 'chapter-1',
  wordCount: 2400,
  targetWordCount: 2500,
  pacingScore: 78,
  hookScore: 82,
  styleMatchScore: 76,
  continuityScore: 88,
  originalityRisk: 'low',
  aiFlavorRisk: 'low',
  platformRisk: [],
  issues: [{ severity: 'hint', message: '可以加强结尾钩子' }],
  passed: true,
  createdAt: '2026-06-13T00:00:00.000Z'
}

const submissionPackage = {
  id: 'submission-1',
  projectId: 'project-1',
  targetPlatform: 'fanqie',
  title: '七天成稿',
  introShort: '新人作者的投稿挑战。',
  introLong: '他把写作拆成可审核的流水线。',
  tags: ['都市', '成长'],
  manuscriptPath: 'submission-package/05_text.txt',
  checklist: [{ label: '前三章完成', passed: true }],
  riskReport: { copyright: 'low' },
  exportFormat: 'folder',
  createdAt: '2026-06-13T00:00:00.000Z'
}

const sampleByTaskName = {
  'zero-idea-cards': { cards: [ideaCard] },
  'zero-idea-merge': { card: { ...ideaCard, id: 'idea-merged', status: 'approved' } },
  'style-fingerprint-normalize': { fingerprint: styleFingerprint },
  'style-fusion-project': { fingerprint: { ...styleFingerprint, id: 'style-fused', status: 'approved' } },
  'title-synopsis-generate': { candidates: [synopsis] },
  'master-outline-generate': { outline: masterOutline },
  'volume-outline-generate': { volumes: masterOutline.volumes },
  'chapter-cards-generate': { cards: [chapterCard] },
  'chapter-draft-v2': {
    title: '倒计时开始',
    content: '正文内容',
    selfCheck: {
      followedChapterCard: true,
      hookIncluded: true,
      notes: ['已保留章节目标']
    }
  },
  'chapter-quality-audit': { report: qualityReport },
  'submission-package-generate': { package: submissionPackage }
}

const schemaByTaskName = {
  'zero-idea-cards': zeroIdeaCardsResultSchema,
  'zero-idea-merge': zeroIdeaMergeResultSchema,
  'style-fingerprint-normalize': styleFingerprintResultSchema,
  'style-fusion-project': styleFingerprintResultSchema,
  'title-synopsis-generate': titleSynopsisResultSchema,
  'master-outline-generate': masterOutlineResultSchema,
  'volume-outline-generate': volumeOutlineResultSchema,
  'chapter-cards-generate': chapterCardsResultSchema,
  'chapter-draft-v2': chapterDraftV2ResultSchema,
  'chapter-quality-audit': chapterQualityAuditResultSchema,
  'submission-package-generate': submissionPackageResultSchema
}

const sharedTypesSource = readFileSync('electron/main/ai/shared-types.ts', 'utf-8')
const objectSchemasSource = readFileSync('electron/main/ai/tasks/object-schemas.ts', 'utf-8')

for (const taskName of zeroStartTaskNames) {
  assert.ok(sharedTypesSource.includes(`| '${taskName}'`), `missing AiTaskName ${taskName}`)
  assert.ok(objectSchemasSource.includes(`'${taskName}'`), `missing object schema registration for ${taskName}`)
  const schema = schemaByTaskName[taskName]
  assert.ok(schema, `missing structured schema for ${taskName}`)
  schema.parse(sampleByTaskName[taskName])
}

console.log('ZeroStart task types and structured schemas verified.')
