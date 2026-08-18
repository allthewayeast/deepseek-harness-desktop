/** Route workspace path opens through the desktop editor preference. */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import {
  DESKTOP_FILE_OPEN_BRIDGE,
  type DesktopFileOpenBridge,
} from '../file-open-bridge-contract.ts'

/**
 * Replace `workspaces.openPath` with the native desktop opener.
 *
 * The upstream method reaches `host.openPath`, whose API-proxy default has no
 * `openPath` injected, so a path open resolves without ever reaching the OS.
 * The desktop shell owns the editor preference, so it answers the call here and
 * keeps the upstream method as the fallback when the preload bridge is absent.
 * @param ctx - active browser Cordis context carrying `workspaces`.
 * @returns the disposer restoring the upstream method.
 */
export function installOpenPathOverride(ctx: ClientContext): () => void {
  const bridge = (window as unknown as Record<string, DesktopFileOpenBridge | undefined>)[DESKTOP_FILE_OPEN_BRIDGE]
  if (bridge === undefined) return () => {}

  const workspaces = ctx.workspaces
  const upstream = workspaces.openPath.bind(workspaces)
  workspaces.openPath = async (path: string): Promise<void> => {
    await bridge.openFile(pathToFileUrl(path))
  }
  return () => { workspaces.openPath = upstream }
}

/**
 * Convert a host filesystem path into the `file:` URL the bridge accepts.
 * @param path - absolute POSIX or Windows path.
 * @returns the encoded `file:` URL.
 */
function pathToFileUrl(path: string): string {
  const normalized = path.replace(/\\/g, '/')
  const withRoot = /^[a-z]:\//i.test(normalized) ? `/${normalized}` : normalized
  return `file://${withRoot.split('/').map(encodeURIComponent).join('/')}`
}
