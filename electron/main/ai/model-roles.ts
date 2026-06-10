import type { AppSettings } from './shared-types'
import { getModelRoleLabel, normalizeModelGroups, type ModelRoleRouteInfo } from './model-groups'

export type ModelRoleId =
  | 'orchestrator'
  | 'deconstruct'
  | 'inspiration'
  | 'outline'
  | 'assets'
  | 'draft'
  | 'polish'
  | 'json'

export function resolveSettingsForModelRole(settings: AppSettings, role: unknown): AppSettings {
  return resolveSettingsAndRouteForModelRole(settings, role).settings
}

export function resolveSettingsAndRouteForModelRole(
  settings: AppSettings,
  role: unknown
): { settings: AppSettings; routeInfo: ModelRoleRouteInfo } {
  const roleId = String(role ?? '').trim() as ModelRoleId
  if (!roleId) return { settings, routeInfo: {} }

  const normalizedGroups = normalizeModelGroups(
    settings.modelGroups,
    settings.modelRoleProfileMap,
    settings.aiProfiles,
    settings.activeModelGroupId
  )
  const activeGroup = normalizedGroups.modelGroups.find((group) => group.id === normalizedGroups.activeModelGroupId)
  const roleMap = activeGroup?.roleProfileMap ?? normalizedGroups.modelRoleProfileMap
  const routeInfo: ModelRoleRouteInfo = {
    modelGroupId: activeGroup?.id ?? settings.modelGroupId,
    modelGroupName: activeGroup?.name ?? settings.modelGroupName,
    modelRoleId: roleId,
    modelRoleLabel: getModelRoleLabel(roleId)
  }

  const profileId = roleMap?.[roleId]
  if (!profileId) {
    return {
      settings: {
        ...settings,
        ...routeInfo,
        modelGroups: normalizedGroups.modelGroups,
        activeModelGroupId: normalizedGroups.activeModelGroupId,
        modelRoleProfileMap: normalizedGroups.modelRoleProfileMap
      },
      routeInfo
    }
  }

  const profile = Array.isArray(settings.aiProfiles)
    ? settings.aiProfiles.find((item) => item.id === profileId)
    : undefined

  if (!profile) return { settings, routeInfo }

  return {
    settings: {
      ...settings,
      provider: profile.provider || settings.provider,
      model: profile.model || settings.model,
      apiKey: profile.apiKey || settings.apiKey,
      baseUrl: profile.baseUrl || settings.baseUrl,
      activeAiProfileId: profile.id,
      modelGroups: normalizedGroups.modelGroups,
      activeModelGroupId: normalizedGroups.activeModelGroupId,
      modelRoleProfileMap: normalizedGroups.modelRoleProfileMap,
      ...routeInfo
    },
    routeInfo
  }
}
