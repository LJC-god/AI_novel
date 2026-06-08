import type { TaskHandler, PromptBuildInput } from './base'
import { extractJsonObject } from './base'
import type { AiTaskResult, NovelOrchestratorPhase, NovelOrchestratorResult } from '../shared-types'

const PHASES: NovelOrchestratorPhase[] = [
  'deconstruct',
  'inspiration',
  'premise',
  'master-outline',
  'story-assets',
  'volume-outline',
  'chapter-outline',
  'draft',
  'audit'
]

const PHASE_LABELS: Record<NovelOrchestratorPhase, string> = {
  deconstruct: '拆书与参考分析',
  inspiration: '灵感池选择',
  premise: '立项与核心卖点',
  'master-outline': '总大纲与卷大纲',
  'story-assets': '世界观 / 角色 / 关系资产',
  'volume-outline': '分卷细化',
  'chapter-outline': '章大纲',
  draft: '章节正文',
  audit: '审稿修复'
}

function normalizePhase(value: unknown): NovelOrchestratorPhase {
  const candidate = String(value ?? '').trim() as NovelOrchestratorPhase
  return PHASES.includes(candidate) ? candidate : 'inspiration'
}

function stringList(value: unknown, fallback: string[] = []): string[] {
  return Array.isArray(value)
    ? value.map((item) => String(item ?? '').trim()).filter(Boolean).slice(0, 8)
    : fallback
}

function truncate(value: unknown, maxLength: number): string {
  const text = String(value ?? '').trim()
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

function formatRecords(source: unknown, fields: string[], maxItems: number): string {
  if (!Array.isArray(source)) return '暂无'
  const lines = source.slice(0, maxItems).map((item, index) => {
    const record = item as Record<string, unknown>
    const body = fields
      .map((field) => truncate(record[field], 120))
      .filter(Boolean)
      .join(' / ')
    return `${index + 1}. ${body}`
  }).filter((line) => !line.endsWith('. '))
  return lines.length ? lines.join('\n') : '暂无'
}

const handler: TaskHandler = {
  name: 'novel-orchestrator',
  outputType: 'json',
  maxSkills: 6,
  defaultCapabilities: ['settings', 'workflow', 'worldview', 'characters', 'relations', 'outline', 'inspiration', 'analysis', 'project-skills'],
  buildPrompt(input: PromptBuildInput) {
    const { context, capabilityPreamble, skillsBlock, knowledgeBlock } = input
    const requestedPhase = String(context.orchestratorPhase ?? 'auto')
    const activeModelRole = String(context.orchestratorModelRole ?? context.modelRole ?? 'orchestrator')
    const previousPhase = String(context.previousOrchestratorPhase ?? '')
    const previousStatus = String(context.previousOrchestratorStatus ?? '')
    const selectedInspirationTitle = String(context.selectedInspirationTitle ?? '')
    const modelRoles = String(context.modelRoles ?? '').trim() || [
      '拆书/审稿：强推理或长上下文模型',
      '灵感池：快速低成本模型',
      '大纲/设定：强推理模型',
      '正文/润色：中文表达能力强的模型',
      '结构化写入：JSON 稳定性高的模型'
    ].join('\n')

    return {
      system: `${capabilityPreamble.system}\n\n你是 CharacterArc 的小说创作总控 Agent。你不直接越过用户确认写完整本书，而是把小说创作拆成可确认、可回滚、可由多模型协作的阶段计划。请只返回 JSON，不要 Markdown。`,
      user: `${capabilityPreamble.user}

请根据当前项目状态和用户请求，输出小说创作总控方案。

用户请求：
${String(context.userPrompt ?? '')}

用户指定阶段：${requestedPhase}
本次执行模型角色：${activeModelRole}
上一总控阶段：${previousPhase || '暂无'}
上一阶段状态：${previousStatus || '暂无'}
已选择灵感：${selectedInspirationTitle || '暂无'}

项目：
- 标题：${String(context.projectTitle ?? '')}
- 题材：${String(context.projectGenre ?? '')}
- 长短篇：${String(context.projectNovelLength ?? '')}
- 目标字数：${String(context.projectWordCount ?? '')}
- 目标平台：${String(context.projectPlatform ?? '未指定')}
- 写作风格：${String(context.writingStylePrompt ?? '暂无')}

已有参考作品：
${formatRecords(context.referenceWorks, ['title', 'source', 'notes'], 8)}

已有灵感：
${formatRecords(context.inspirationEntries, ['type', 'title', 'content'], 8)}

已有世界观：
${formatRecords(context.worldviewEntries, ['type', 'title', 'content'], 8)}

已有角色：
${formatRecords(context.characters, ['name', 'role', 'description'], 8)}

已有大纲：
${formatRecords(context.outlineItems, ['title', 'conflict', 'summary'], 10)}

已有分卷：
${formatRecords(context.outlineVolumes, ['title', 'summary', 'wordTarget'], 6)}

已有流程文档：
${formatRecords(context.workflowDocuments, ['title', 'content'], 6)}

检索到的知识：
${truncate(knowledgeBlock, 1800) || '暂无'}

当前可用 workflow skills：
${truncate(skillsBlock, 2200) || '暂无'}

多模型协作偏好：
${modelRoles}

阶段定义：
- deconstruct：拆书、扫榜、参考分析
- inspiration：生成可选灵感池，等待用户选择类型/长短篇/字数/平台
- premise：用户选中灵感后，生成立项、核心卖点、故事承诺
- master-outline：生成总大纲和卷大纲，等待用户确认
- story-assets：总大纲确认后，生成世界观、角色、人物关系、伏笔台账等结构资产
- volume-outline：细化某一卷目标、冲突链和阶段高潮
- chapter-outline：生成某一卷的章大纲
- draft：按章大纲开始正文
- audit：审稿、修复、一致性检查

决策规则：
0. 如果“用户指定阶段”不是 auto，优先按该阶段输出；只有该阶段明显与用户请求冲突时才自行纠正，并在 notes 中说明。
1. 如果当前阶段是 deconstruct，只做参考作品/榜单/题材结构分析：在 summary、assetPlan、notes、nextPrompts 中输出可迁移规律、风险和下一步提问；不要直接替用户选定灵感，inspirationOptions 可以为空。
2. 如果当前阶段不是 deconstruct，且用户还没有选择灵感，优先输出 inspirationOptions。
3. 如果用户已经确认灵感但没有总大纲，输出 premise 或 master-outline。
4. 如果用户确认了总大纲，输出 story-assets。
5. 如果用户要求第一卷章大纲，输出 chapter-outline，并把 outlinePlan 设为章节计划。
6. 任何会写入世界观、角色、大纲、章节正文的动作都必须 confirmationRequired=true。
7. 如果当前阶段需要用户选择灵感，inspirationOptions 和 inspirationDrafts 都要给出。
8. 如果当前阶段是总大纲/卷大纲，outlinePlan 和 volumeDrafts 都要给出。
9. 如果当前阶段是结构资产，worldviewDrafts、characterDrafts、assetPlan 都要给出。
10. 如果当前阶段是第一卷章大纲，chapterOutlineDrafts 必须给出 8-20 条。
11. 你可以说明本次已由“本次执行模型角色”处理；不要假装已经并行调用其他模型。modelRoles 字段用于给出后续阶段的分工建议。

返回 JSON 字段：
{
  "phase":"",
  "phaseLabel":"",
  "summary":"",
  "recommendedNextAction":"",
  "confirmationRequired":true,
  "confirmationQuestion":"",
  "inspirationOptions":[{"title":"","type":"","length":"","targetWords":"","platform":"","hook":"","risk":""}],
  "inspirationDrafts":[{"type":"","title":"","content":"","tags":[""]}],
  "outlinePlan":[{"title":"","scope":"","purpose":"","conflict":""}],
  "worldviewDrafts":[{"type":"","title":"","content":""}],
  "characterDrafts":[{"name":"","role":"","description":"","tags":[""]}],
  "volumeDrafts":[{"title":"","wordTarget":"","summary":""}],
  "chapterOutlineDrafts":[{"title":"","wordTarget":"","conflict":"","summary":""}],
  "assetPlan":[{"assetType":"","title":"","purpose":"","dependsOnConfirmation":true}],
  "modelRoles":[{"role":"","suggestedModelClass":"","reason":""}],
  "nextPrompts":[""],
  "notes":[""]
}`
    }
  },
  normalize(raw: string): AiTaskResult {
    const parsed = extractJsonObject(raw) as Partial<NovelOrchestratorResult>
    const phase = normalizePhase(parsed.phase)
    const arrayOfRecords = <T extends Record<string, unknown>>(
      value: unknown,
      mapper: (record: Record<string, unknown>) => T
    ): T[] => Array.isArray(value)
      ? value.slice(0, 12).map((item) => mapper(item as Record<string, unknown>))
      : []

    return {
      phase,
      phaseLabel: String(parsed.phaseLabel ?? '').trim() || PHASE_LABELS[phase],
      summary: String(parsed.summary ?? '').trim() || '已根据当前项目状态生成下一步总控方案。',
      recommendedNextAction: String(parsed.recommendedNextAction ?? '').trim() || '请先确认本阶段方案，再进入下一阶段。',
      confirmationRequired: parsed.confirmationRequired !== false,
      confirmationQuestion: String(parsed.confirmationQuestion ?? '').trim() || '是否确认按这个方向进入下一步？',
      inspirationOptions: arrayOfRecords(parsed.inspirationOptions, (record) => ({
        title: String(record.title ?? '').trim(),
        type: String(record.type ?? '').trim(),
        length: String(record.length ?? '').trim(),
        targetWords: String(record.targetWords ?? '').trim(),
        platform: String(record.platform ?? '').trim(),
        hook: String(record.hook ?? '').trim(),
        risk: String(record.risk ?? '').trim()
      })).filter((item) => item.title || item.hook),
      inspirationDrafts: arrayOfRecords(parsed.inspirationDrafts, (record) => ({
        type: String(record.type ?? '').trim() || '小说灵感',
        title: String(record.title ?? '').trim(),
        content: String(record.content ?? '').trim(),
        tags: stringList(record.tags, ['总控']).slice(0, 8)
      })).filter((item) => item.title || item.content),
      outlinePlan: arrayOfRecords(parsed.outlinePlan, (record) => ({
        title: String(record.title ?? '').trim(),
        scope: String(record.scope ?? '').trim(),
        purpose: String(record.purpose ?? '').trim(),
        conflict: String(record.conflict ?? '').trim()
      })).filter((item) => item.title || item.purpose),
      assetPlan: arrayOfRecords(parsed.assetPlan, (record) => ({
        assetType: String(record.assetType ?? '').trim(),
        title: String(record.title ?? '').trim(),
        purpose: String(record.purpose ?? '').trim(),
        dependsOnConfirmation: record.dependsOnConfirmation !== false
      })).filter((item) => item.assetType || item.title),
      worldviewDrafts: arrayOfRecords(parsed.worldviewDrafts, (record) => ({
        type: String(record.type ?? '').trim() || '法则',
        title: String(record.title ?? '').trim(),
        content: String(record.content ?? '').trim()
      })).filter((item) => item.title || item.content),
      characterDrafts: arrayOfRecords(parsed.characterDrafts, (record) => ({
        name: String(record.name ?? '').trim(),
        role: String(record.role ?? '').trim() || '待定',
        description: String(record.description ?? '').trim(),
        tags: stringList(record.tags).slice(0, 8)
      })).filter((item) => item.name || item.description),
      volumeDrafts: arrayOfRecords(parsed.volumeDrafts, (record) => ({
        title: String(record.title ?? '').trim(),
        wordTarget: String(record.wordTarget ?? '').trim(),
        summary: String(record.summary ?? '').trim()
      })).filter((item) => item.title || item.summary),
      chapterOutlineDrafts: arrayOfRecords(parsed.chapterOutlineDrafts, (record) => ({
        title: String(record.title ?? '').trim(),
        wordTarget: String(record.wordTarget ?? '').trim() || '预估 3000字',
        conflict: String(record.conflict ?? '').trim(),
        summary: String(record.summary ?? '').trim()
      })).filter((item) => item.title || item.summary),
      modelRoles: arrayOfRecords(parsed.modelRoles, (record) => ({
        role: String(record.role ?? '').trim(),
        suggestedModelClass: String(record.suggestedModelClass ?? '').trim(),
        reason: String(record.reason ?? '').trim()
      })).filter((item) => item.role || item.suggestedModelClass),
      nextPrompts: stringList(parsed.nextPrompts),
      notes: stringList(parsed.notes)
    } as NovelOrchestratorResult
  },
  validate(result: AiTaskResult): boolean {
    const r = result as NovelOrchestratorResult
    return Boolean(r.phase && r.phaseLabel && r.summary && r.recommendedNextAction)
  },
  resolveMaxTokens(): number {
    return 2600
  }
}

export default handler
