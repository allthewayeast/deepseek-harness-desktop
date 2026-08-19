/** Desktop content settings: Host-side schema registration. */

import z from '@deepseek-ai/schemastery'
import {
  DEFAULT_CODE_FONT,
  DEFAULT_EDITOR,
  DEFAULT_UI_FONT,
  DEFAULT_WIDE_CONVERSATION,
  DEFAULT_ZOOM,
  type DesktopContentSettings,
} from './content-settings-types.ts'

export type { DesktopContentSettings } from './content-settings-types.ts'
export {
  DEFAULT_CODE_FONT,
  DEFAULT_EDITOR,
  DEFAULT_UI_FONT,
  DEFAULT_WIDE_CONVERSATION,
  DEFAULT_ZOOM,
  DESKTOP_CONTENT_NAMESPACE,
} from './content-settings-types.ts'

/** Schema registered with the standard settings service. */
export const DesktopContentSchema: z<DesktopContentSettings> = z.object({
  zoom: z.number().step(5).min(50).max(200).default(DEFAULT_ZOOM),
  uiFont: z.string().default(DEFAULT_UI_FONT),
  codeFont: z.string().default(DEFAULT_CODE_FONT),
  defaultEditor: z.string().default(DEFAULT_EDITOR),
  wideConversation: z.boolean().default(DEFAULT_WIDE_CONVERSATION),
})
