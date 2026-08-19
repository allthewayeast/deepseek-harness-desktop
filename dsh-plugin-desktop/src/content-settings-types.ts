/** Desktop content settings types shared by Host and Client. */

/** Settings namespace owning the desktop content section. */
export const DESKTOP_CONTENT_NAMESPACE = 'dsh-desktop-content'

/** Zoom percentage applied to the renderer document. */
export const DEFAULT_ZOOM = 100

/** Interface font stack applied to every non-code surface. */
export const DEFAULT_UI_FONT = ''

/** Monospace stack applied to code surfaces. */
export const DEFAULT_CODE_FONT = ''

/** Default editor executable path for opening file links. */
export const DEFAULT_EDITOR = ''

/** Whether the conversation surface expands to 90% of the page width. */
export const DEFAULT_WIDE_CONVERSATION = false

/** Durable desktop content section. */
export interface DesktopContentSettings {
  /** Renderer zoom percentage; 100 leaves the document unscaled. */
  zoom: number
  /** Interface font stack; empty inherits the product theme font. */
  uiFont: string
  /** Code font stack; empty inherits the product theme monospace font. */
  codeFont: string
  /** Default editor executable path; empty uses OS file association. */
  defaultEditor: string
  /** Expand the conversation history surface from its fixed width to 90% of the page. */
  wideConversation: boolean
}
