/** Windows agent-preset service. */

import AgentPresets from '@deepseek-ai/dsh-agent-presets'

/**
 * Windows serves the same upstream preset roster as every other platform.
 *
 * The previous upstream guard hid the `minimal` preset on win32 because its
 * persistent Bash terminal cannot launch on stock Windows. Issue #317 expects
 * the four web-client presets (standard, code, minimal, cordis) to stay
 * selectable on the desktop, so the guard is removed and this row passes the
 * upstream roster through unchanged.
 */
export class WindowsAgentPresets extends AgentPresets {}

export default WindowsAgentPresets
