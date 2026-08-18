/** Renderer-to-main file opening contract shared by preload and client. */

/** Bridge name exposed on the renderer's window. */
export const DESKTOP_FILE_OPEN_BRIDGE = '__DSH_DESKTOP_FILE_OPEN__'

/** Renderer's view of the file opening service. */
export interface DesktopFileOpenBridge {
  /** Request the main process to open a file:// URL with the configured editor or system default. */
  openFile(url: string): Promise<void>
}
