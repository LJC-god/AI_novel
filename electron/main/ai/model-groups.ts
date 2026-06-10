import type { AppSettings } from './shared-types'

export type ModelRoleId =
  | 'orchestrator'
  | 'deconstruct'
  | 'inspiration'
  | 'outline'
  | 'assets'
  | 'draft'
  | 'polish'
  | 'json'

export type ModelRoleProfileMap = Partial<Record<ModelRoleId, string>>

export type ModelRoleGroup = {
  id: string
  name: string
  description: string
  roleProfileMap: ModelRoleProfileMap
  roleNotes?: Partial<Record<ModelRoleId, string>>
  createdAt: string
  updatedAt: string
}

export type ModelRoleRouteInfo = {
  modelGroupId?: string
  modelGroupName?: string
  modelRoleId?: string
  modelRoleLabel?: string
}

const MODEL_ROLE_LABELS: Record<ModelRoleId, string> = {
  orchestrator: '总控调度',
  deconstruct: '拆书分析',
  inspiration: '灵感池',
  outline: '大纲规划',
  assets: '设定资产',
  draft: '正文起草',
  polish: '润色审校',
  json: '结构化输出'
}

export const MODEL_ROLE_IDS = Object.keys(MODEL_ROLE_LABELS) as ModelRoleId[]

const DEFAULT_GROUP_ID = 'fanqie-xianxia-longform'

function nowIso(): string {
  return new Date().toISOString()
}

function cleanRoleMap(value: unknown, profileIds?: Set<string>): ModelRoleProfileMap {
  if (!value || typeof value !== 'object') return {}
  const next: ModelRoleProfileMap = {}
  for (const role of MODEL_ROLE_IDS) {
    const profileId = String((value as Record<string, unknown>)[role] ?? '').trim()
    if (profileId && (!profileIds || profileIds.has(profileId))) {
      next[role] = profileId
    }
  }
  return next
}

export function createDefaultModelGroup(roleProfileMap: ModelRoleProfileMap = {}): ModelRoleGroup {
  const timestamp = nowIso()
  return {
    id: DEFAULT_GROUP_ID,
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
  aiProfiles: AppSettings['aiProfiles'] = [],
  activeModelGroupId = ''
): { modelGroups: ModelRoleGroup[]; activeModelGroupId: string; modelRoleProfileMap: ModelRoleProfileMap } {
  const profileIds = new Set((aiProfiles ?? []).map((profile) => profile.id).filter(Boolean))
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
                .filter(([role]) => MODEL_ROLE_IDS.includes(role as ModelRoleId))
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
    const existingDefault = modelGroups.find((group) => group.id === DEFAULT_GROUP_ID)
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

export function getModelRoleLabel(roleId: unknown): string {
  const role = String(roleId ?? '').trim() as ModelRoleId
  return MODEL_ROLE_LABELS[role] ?? role
}

