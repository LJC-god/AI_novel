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

export function resolveSettingsForModelRole(settings: AppSettings, role: unknown): AppSettings {
  const roleId = String(role ?? '').trim() as ModelRoleId
  if (!roleId) return settings

  const profileId = settings.modelRoleProfileMap?.[roleId]
  if (!profileId) return settings

  const profile = Array.isArray(settings.aiProfiles)
    ? settings.aiProfiles.find((item) => item.id === profileId)
    : undefined

  if (!profile) return settings

  return {
    ...settings,
    provider: profile.provider || settings.provider,
    model: profile.model || settings.model,
    apiKey: profile.apiKey || settings.apiKey,
    baseUrl: profile.baseUrl || settings.baseUrl,
    activeAiProfileId: profile.id
  }
}
