/** Apply content settings to the document root in real time. */

import type { SettingsScope, SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-runtime/client'
import type { DesktopContentSettings } from '../content-settings-types.ts'

const FALLBACK_UI_FONT = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
const FALLBACK_CODE_FONT = '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, "Courier New", monospace'

/**
 * Subscribe to the content scope and apply each snapshot to the document.
 * @param scope - bound content settings scope.
 * @returns the disposer stopping the subscription.
 */
export function installContentApplier(scope: SettingsScope<DesktopContentSettings>): () => void {
  const apply = (snapshot: SettingsScopeSnapshot<DesktopContentSettings>) => {
    if (snapshot.value === undefined) return
    const { zoom, uiFont, codeFont } = snapshot.value
    const root = document.documentElement
    root.style.setProperty('--desktop-zoom', `${zoom}%`)
    root.style.setProperty('--desktop-ui-font', uiFont || FALLBACK_UI_FONT)
    root.style.setProperty('--desktop-code-font', codeFont || FALLBACK_CODE_FONT)
    root.style.setProperty('zoom', `${zoom}%`)
  }

  // Apply initial snapshot
  apply(scope.getSnapshot())

  // Subscribe to changes
  return scope.subscribe(() => { apply(scope.getSnapshot()) })
}
