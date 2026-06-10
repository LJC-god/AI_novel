import type { AiProfile, ModelRoleGroup, ModelRoleId, ModelRoleProfileMap } from '@/types/app'

export const MODEL_ROLE_OPTIONS: Array<{ id: ModelRoleId; label: string; hint: string }> = [
  { id: 'orchestrator', label: '总控调度', hint: '拆书、立项、阶段推进与确认问题' },
  { id: 'deconstruct', label: '拆书分析', hint: '参考作品结构、爽点、节奏和卖点提取' },
  { id: 'inspiration', label: '灵感池', hint: '题材方向、设定钩子和商业化变体' },
  { id: 'outline', label: '大纲规划', hint: '总大纲、卷大纲和章纲结构' },
  { id: 'assets', label: '设定资产', hint: '世界观、角色、人际关系和伏笔' },
  { id: 'draft', label: '正文起草', hint: '章节正文与场景推进' },
  { id: 'polish', label: '润色审校', hint: '语言优化、节奏修复和一致性检查' },
  { id: 'json', label: '结构化输出', hint: '稳定 JSON 与写入项目的数据草稿' }
]

export const DEFAULT_MODEL_GROUP_ID = 'fanqie-xianxia-longform'

function nowIso(): string {
  return new Date().toISOString()
}

function cleanRoleMap(value: unknown, profileIds?: Set<string>): ModelRoleProfileMap {
  if (!value || typeof value !== 'object') return {}
  const next: ModelRoleProfileMap = {}
  for (const role of MODEL_ROLE_OPTIONS) {
    const profileId = String((value as Record<string, unknown>)[role.id] ?? '').trim()
    if (profileId && (!profileIds || profileIds.has(profileId))) {
      next[role.id] = profileId
    }
  }
  return next
}

export function createDefaultModelGroup(roleProfileMap: ModelRoleProfileMap = {}): ModelRoleGroup {
  const timestamp = nowIso()
  return {
    id: DEFAULT_MODEL_GROUP_ID,
    name: '番茄仙侠长篇模型组',
    description: '面向番茄长篇连载：总控定流程，Claude 审稿与设定，DeepSeek 主写正文，GLM 做灵感和润色。',
    roleProfileMap: cleanRoleMap(roleProfileMap),
    roleNotes: {
      orchestrator: '阶段调度、确认问题、失败回退',
      deconstruct: '参考书拆解、结构提炼、风险识别',
      inspiration: '脑洞扩展、题材变体、反套路点子',
      outline: '总大纲、卷纲、章纲与冲突链',
      assets: '世界观、角色、人际关系、伏笔账本',
      draft: '章节正文批量起草',
      polish: '去 AI 味、番茄节奏修复、一致性审稿',
      json: '稳定结构化输出与写入草稿'
    },
    createdAt: timestamp,
    updatedAt: timestamp
  }
}

export function normalizeModelGroups(
  groups: unknown,
  roleProfileMap: unknown,
  aiProfiles: AiProfile[] = [],
  activeModelGroupId = ''
): { modelGroups: ModelRoleGroup[]; activeModelGroupId: string; modelRoleProfileMap: ModelRoleProfileMap } {
  const profileIds = new Set(aiProfiles.map((profile) => profile.id).filter(Boolean))
  const fallbackRoleMap = cleanRoleMap(roleProfileMap, profileIds.size ? profileIds : undefined)
  const rawGroups = Array.isArray(groups) ? groups : []
  const modelGroups = rawGroups
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map<ModelRoleGroup>((item) => {
      const createdAt = String(item.createdAt ?? '').trim() || nowIso()
      return {
        id: String(item.id ?? '').trim(),
        name: String(item.name ?? '').trim() || '未命名模型组',
        description: String(item.description ?? '').trim(),
        roleProfileMap: cleanRoleMap(item.roleProfileMap, profileIds.size ? profileIds : undefined),
        roleNotes: item.roleNotes && typeof item.roleNotes === 'object'
          ? Object.fromEntries(
              Object.entries(item.roleNotes as Record<string, unknown>)
                .filter(([role]) => MODEL_ROLE_OPTIONS.some((item) => item.id === role))
                .map(([role, note]) => [role, String(note ?? '').trim()])
                .filter(([, note]) => note)
            ) as Partial<Record<ModelRoleId, string>>
          : undefined,
        createdAt,
        updatedAt: String(item.updatedAt ?? '').trim() || createdAt
      }
    })
    .filter((item) => item.id)

  if (modelGroups.length === 0 || Object.keys(fallbackRoleMap).length > 0) {
    const existingDefault = modelGroups.find((group) => group.id === DEFAULT_MODEL_GROUP_ID)
    if (existingDefault) {
      existingDefault.roleProfileMap = {
        ...fallbackRoleMap,
        ...existingDefault.roleProfileMap
      }
      existingDefault.updatedAt = nowIso()
    } else {
      modelGroups.unshift(createDefaultModelGroup(fallbackRoleMap))
    }
  }

  const resolvedActiveId = modelGroups.some((group) => group.id === activeModelGroupId)
    ? activeModelGroupId
    : modelGroups[0]?.id ?? ''
  const activeGroup = modelGroups.find((group) => group.id === resolvedActiveId)

  return {
    modelGroups,
    activeModelGroupId: resolvedActiveId,
    modelRoleProfileMap: activeGroup?.roleProfileMap ?? fallbackRoleMap
  }
}

