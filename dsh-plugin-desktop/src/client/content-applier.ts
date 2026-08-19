/** Apply content settings to the document root in real time. */

import type { SettingsScope, SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-runtime/client'
import type { DesktopContentSettings } from '../content-settings-types.ts'

const FALLBACK_UI_FONT = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
const FALLBACK_CODE_FONT = '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, "Courier New", monospace'

/** Wide-mode conversation content width: 90% of the conversation surface. */
const WIDE_CONVERSATION_WIDTH = '90%'

/**
 * Locate the conversation root element that declares `--dsh-chat-content-width`
 * (ConversationRoot's resident shell). The scroll body is a stable child of
 * that root, so its parent is the element to override.
 * @returns the conversation root element, if mounted.
 */
function conversationRoot(): HTMLElement | undefined {
  return document.querySelector('[data-conversation-scroll]')?.parentElement ?? undefined
}

/**
 * Subscribe to the content scope and apply each snapshot to the document.
 * @param scope - bound content settings scope.
 * @returns the disposer stopping the subscription.
 */
export function installContentApplier(scope: SettingsScope<DesktopContentSettings>): () => void {
  let wideConversation = false
  let observedRoot: HTMLElement | undefined

  const setConversationWidth = (root: HTMLElement | undefined): void => {
    if (root === undefined) return
    if (wideConversation) {
      root.style.setProperty('--dsh-chat-content-width', WIDE_CONVERSATION_WIDTH)
    } else {
      // Removing the inline override falls back to the fixed width the
      // conversation root declares (748px). An empty string would instead
      // make max-width invalid-at-computed-value-time and widen the column.
      root.style.removeProperty('--dsh-chat-content-width')
    }
  }

  const apply = (snapshot: SettingsScopeSnapshot<DesktopContentSettings>) => {
    if (snapshot.value === undefined) return
    const { zoom, uiFont, codeFont, wideConversation: wide } = snapshot.value
    wideConversation = wide
    const root = document.documentElement
    root.style.setProperty('--desktop-zoom', `${zoom}%`)
    root.style.setProperty('--desktop-ui-font', uiFont || FALLBACK_UI_FONT)
    root.style.setProperty('--desktop-code-font', codeFont || FALLBACK_CODE_FONT)
    root.style.setProperty('zoom', `${zoom}%`)
    setConversationWidth(conversationRoot())
  }

  // Apply initial snapshot
  apply(scope.getSnapshot())

  // The resident conversation shell can mount after this plugin's apply runs;
  // re-apply the width whenever the conversation root appears or remounts.
  const observer = new MutationObserver(() => {
    const root = conversationRoot()
    if (root !== observedRoot) {
      observedRoot = root
      setConversationWidth(root)
    }
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })

  // Subscribe to changes
  const dispose = scope.subscribe(() => { apply(scope.getSnapshot()) })

  return () => {
    dispose()
    observer.disconnect()
  }
}
