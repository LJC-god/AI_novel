import type { TaskHandler, PromptBuildInput } from './base'
import { extractJsonObject } from './base'
import type { AiTaskResult, WorldviewResult } from '../shared-types'
import { resolveWritingStyleInstruction } from '../prompts/shared'

/** 世界观设定生成任务：为小说项目新增一条世界观设定 */
const handler: TaskHandler = {
  name: 'worldview-entry',
  outputType: 'json',
  defaultCapabilities: ['settings', 'worldview', 'writing-style'],
  buildPrompt(input: PromptBuildInput) {
    const { context, capabilityPreamble } = input
    const writingStyle = resolveWritingStyleInstruction(context)
    return {
      system: `${capabilityPreamble.system}\n\n你是小说世界观设定助手。请只返回 JSON 对象，不要返回 Markdown。字段必须包含 type、title、content。`,
      user: `${capabilityPreamble.user}\n\n基于以下上下文，为当前小说项目新增一条世界观设定。\n\n项目标题：${String(context.projectTitle ?? '')}\n项目题材：${String(context.projectGenre ?? '')}\n已有世界观：${JSON.stringify(context.worldviewTitles ?? [])}\n\n要求：\n1. 返回一条不与已有条目重复的新设定\n2. type 必须是 地理 / 法则 / 物种 / 势力 / 历史 之一\n3. title 要简洁\n4. content 用中文完整描述，80 到 180 字\n5. ${writingStyle}\n\n返回格式：{"type":"","title":"","content":""}`
    }
  },
  normalize(raw: string): AiTaskResult {
    const parsed = extractJsonObject(raw) as Partial<WorldviewResult>
    return {
      type: parsed.type?.trim() || '地理',
      title: parsed.title?.trim() || '新世界观词条',
      content: parsed.content?.trim() || 'AI 未返回有效内容'
    } as WorldviewResult
  },
  validate(result: AiTaskResult): boolean {
    const r = result as WorldviewResult
    return Boolean(r.title?.trim() && r.content?.trim())
  }
}
export default handler
