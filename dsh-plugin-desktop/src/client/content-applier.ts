/** Apply content settings to the document root in real time. */

import type { SettingsScope, SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-runtime/client'
import { DESKTOP_ZOOM_BRIDGE, type DesktopZoomBridgeWindow } from '../zoom-bridge-contract.ts'
import type { DesktopContentSettings } from '../content-settings-types.ts'

const FALLBACK_UI_FONT = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
const FALLBACK_CODE_FONT = '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, "Courier New", monospace'

/** Wide-mode conversation content width: 90% of the conversation surface. */
const WIDE_CONVERSATION_WIDTH = '90%'

/**
 * Hero composer-card alignment fix.
 *
 * The card's max-width derives from `--dsh-chat-content-width` as
 * `calc(var(--dsh-chat-content-width) + 32px)`. While the variable holds the
 * fixed 748px default the percentage never nests, but in wide mode it is `90%`
 * and the card resolves that percentage against its own parent (the narrowed
 * `.composerHero`), shrinking the card below the workspace row above it and
 * breaking their left alignment. Constraining the hero card to its full column
 * width (`100%` of the bar's content box = width + 32px) restores the same
 * geometry the fixed default produces; the rule is a no-op outside hero or at
 * the 748px default (the card already fills the column there).
 */
const HERO_CARD_FIX_STYLE = `
[data-phase='hero'] [data-composer-card] {
  max-width: 100% !important;
}
`

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
 * Apply the user zoom through the native view zoom when the preload bridge is
 * present, falling back to the CSS zoom property otherwise (plain-web dev).
 *
 * The CSS zoom property scales layout but leaves fixed-position coordinates
 * unscaled, so menus positioned from getBoundingClientRect drift away from
 * their anchor once zoom leaves 100% (Chromium issue 41461010). The Electron
 * view zoom scales the whole page — fixed menus included — so placement stays
 * aligned. `webFrame.setZoomFactor(1)` also resets the keyboard zoom steps
 * (Ctrl+=/-/0), which is exactly what a 100% setting should do.
 * @param zoom - user zoom percentage (50..200).
 */
function applyZoom(zoom: number): void {
  const bridge = (window as DesktopZoomBridgeWindow)[DESKTOP_ZOOM_BRIDGE]
  if (bridge !== undefined) {
    bridge.setFactor(zoom / 100)
    return
  }
  document.documentElement.style.setProperty('zoom', `${zoom}%`)
}

/**
 * Subscribe to the content scope and apply each snapshot to the document.
 * @param scope - bound content settings scope.
 * @returns the disposer stopping the subscription.
 */
export function installContentApplier(scope: SettingsScope<DesktopContentSettings>): () => void {
  let wideConversation = false
  let observedRoot: HTMLElement | undefined

  // Injected alongside the document variables so the hero alignment fix rides
  // the same lifecycle in every shell mode (the settings row is registered
  // unconditionally, unlike the advanced-only global stylesheet).
  const fixStyle = document.createElement('style')
  fixStyle.dataset.plugin = 'dsh-plugin-desktop'
  fixStyle.dataset.pluginCss = 'dsh-plugin-desktop/content'
  fixStyle.textContent = HERO_CARD_FIX_STYLE
  document.head.appendChild(fixStyle)

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
    applyZoom(zoom)
    root.style.setProperty('--desktop-ui-font', uiFont || FALLBACK_UI_FONT)
    root.style.setProperty('--desktop-code-font', codeFont || FALLBACK_CODE_FONT)
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
    fixStyle.remove()
  }
}
