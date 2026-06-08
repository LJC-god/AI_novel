import type { TaskHandler, PromptBuildInput } from './base'
import { extractJsonObject } from './base'
import type { AiTaskResult, CharacterResult } from '../shared-types'
import { resolveWritingStyleInstruction } from '../prompts/shared'
import { formatOrganizations, formatCharacterRelationships, formatOrganizationMemberships } from '../prompts/format-helpers'

/** 角色卡片生成任务：为小说项目生成一名新角色（名称/定位/描述/标签） */
const handler: TaskHandler = {
  name: 'character-card',
  outputType: 'json',
  defaultCapabilities: ['settings', 'characters', 'relations', 'worldview', 'writing-style'],
  buildPrompt(input: PromptBuildInput) {
    const { context, capabilityPreamble } = input
    const writingStyle = resolveWritingStyleInstruction(context)
    const organizations = formatOrganizations(context.organizations)
    const relationships = formatCharacterRelationships(context.characterRelationships, context.characters)
    const memberships = formatOrganizationMemberships(context.organizationMemberships, context.organizations, context.characters)
    return {
      system: `${capabilityPreamble.system}\n\n你是小说角色设定助手。请只返回 JSON 对象，不要返回 Markdown。字段必须包含 name、role、description、tags。`,
      user: `${capabilityPreamble.user}\n\n基于以下上下文，为当前小说项目生成一名新角色。\n\n项目标题：${String(context.projectTitle ?? '')}\n项目题材：${String(context.projectGenre ?? '')}\n已有角色：${JSON.stringify(context.characterNames ?? [])}\n世界观关键词：${JSON.stringify(context.worldviewTitles ?? [])}\n\n已有组织：\n${organizations || '暂无'}\n\n已有角色关系：\n${relationships || '暂无'}\n\n已有成员归属：\n${memberships || '暂无'}\n\n要求：\n1. 不与已有角色重名\n2. role 用短语概括角色定位\n3. 新角色要尽量能自然嵌入现有关系网络或组织结构，避免像孤立路人\n4. description 用中文完整描述，80 到 160 字，按"核心定位 + 反差细节 + 动机逻辑"组织\n5. tags 返回 2 到 4 个简短标签数组\n6. ${writingStyle}\n\n返回格式：{"name":"","role":"","description":"","tags":["",""]}`
    }
  },
  normalize(raw: string): AiTaskResult {
    const parsed = extractJsonObject(raw) as Partial<CharacterResult>
    const tags = Array.isArray(parsed.tags) ? parsed.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 4) : []
    return { name: parsed.name?.trim() || '新角色', role: parsed.role?.trim() || '待设定', description: parsed.description?.trim() || 'AI 未返回有效角色描述', tags: tags.length ? tags : ['待完善'] } as CharacterResult
  },
  validate(result: AiTaskResult): boolean {
    const r = result as CharacterResult
    return Boolean(r.name?.trim() && r.description?.trim())
  }
}
export default handler
