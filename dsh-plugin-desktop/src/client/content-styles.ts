/** Global content styles applying user zoom and font settings. */

const CONTENT_STYLES = `
:root {
  --desktop-zoom: 100%;
  --desktop-ui-font: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --desktop-code-font: "Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, "Courier New", monospace;
}

/* Apply UI font to all UI elements */
body, button, input, select, textarea,
.dshDesktopSidebarSurface,
.dshDesktopConversationSurface *:not(code):not(pre):not([data-code-block]) {
  font-family: var(--desktop-ui-font);
}

/* Apply code font to code elements */
code, pre, [data-code-block],
.monaco-editor, .editor,
[class*="code"], [class*="Code"],
[data-language], [data-lang] {
  font-family: var(--desktop-code-font) !important;
}

/* Code blocks in conversation */
[data-role="tool-result"] code,
[data-role="tool-call"] code,
.codeBlock, .code-block {
  font-family: var(--desktop-code-font) !important;
}
`

/** Install global content styles that adapt to user settings. @returns the style disposer. */
export function installContentStyles(): () => void {
  const style = document.createElement('style')
  style.dataset.plugin = 'dsh-plugin-desktop'
  style.dataset.pluginCss = 'dsh-plugin-desktop/content'
  style.textContent = CONTENT_STYLES
  document.head.appendChild(style)
  return () => { style.remove() }
}
