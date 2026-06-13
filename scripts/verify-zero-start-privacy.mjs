import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const mainModelGroups = readFileSync('electron/main/ai/model-groups.ts', 'utf-8')
const mainModelRoles = readFileSync('electron/main/ai/model-roles.ts', 'utf-8')
const rendererModelGroups = readFileSync('renderer/src/features/settings/modelGroups.ts', 'utf-8')
const rendererTypes = readFileSync('renderer/src/types/app.ts', 'utf-8')
const zeroIpc = readFileSync('electron/main/zero-start/ipc.ts', 'utf-8')
const workspaceStore = readFileSync('electron/main/workspace-store.ts', 'utf-8')
const settingsModal = readFileSync('renderer/src/components/home/HomepageSettingsModal.vue', 'utf-8')

for (const role of ['ideation', 'planner', 'writer', 'auditor', 'embedding', 'image']) {
  assert.ok(mainModelGroups.includes(`'${role}'`), `main model groups missing ${role}`)
  assert.ok(mainModelRoles.includes(`'${role}'`), `main model roles missing ${role}`)
  assert.ok(rendererModelGroups.includes(`'${role}'`), `renderer model groups missing ${role}`)
  assert.ok(rendererTypes.includes(`'${role}'`), `renderer app types missing ${role}`)
}

for (const route of [
  "modelRole: 'ideation'",
  "modelRole: 'planner'",
  "modelRole: 'writer'",
  "modelRole: 'auditor'"
]) {
  assert.ok(zeroIpc.includes(route), `zero-start IPC missing ${route}`)
}

assert.ok(zeroIpc.includes('assertCloudAllowedForSettings'), 'zero-start IPC must enforce cloud_allowed before AI calls')
assert.ok(zeroIpc.includes('cloudAllowed'), 'zero-start IPC must read workflow cloudAllowed')
assert.ok(zeroIpc.includes('isCloudModelSettings'), 'zero-start IPC must distinguish local vs cloud settings')

assert.ok(workspaceStore.includes('safeStorage'), 'workspace settings must use Electron safeStorage')
assert.ok(workspaceStore.includes('encryptSecretForStorage'), 'workspace settings must encrypt API keys before saving')
assert.ok(workspaceStore.includes('decryptSecretFromStorage'), 'workspace settings must decrypt API keys when loading')
assert.ok(workspaceStore.includes('encryptProfilesForStorage'), 'workspace settings must encrypt profile API keys')

assert.ok(settingsModal.includes('ZeroStart role presets'), 'settings UI must describe ZeroStart model roles')
assert.ok(settingsModal.includes('API keys are encrypted'), 'settings UI must mention encrypted API key storage')

console.log('ZeroStart model role and privacy guard verified.')
