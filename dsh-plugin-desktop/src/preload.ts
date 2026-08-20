/** Minimal context-isolated bridge for resolving operating-system drag payloads. */

import { contextBridge, ipcRenderer, webFrame, webUtils } from 'electron'
import { DESKTOP_FILE_PATH_BRIDGE } from './file-path-bridge-contract.ts'
import { DESKTOP_FILE_OPEN_BRIDGE } from './file-open-bridge-contract.ts'
import { DESKTOP_ZOOM_BRIDGE } from './zoom-bridge-contract.ts'

contextBridge.exposeInMainWorld(DESKTOP_FILE_PATH_BRIDGE, {
  /** Resolve only genuine disk-backed Web File objects selected by the operator. */
  getPathForFile(file: File): string {
    return webUtils.getPathForFile(file)
  },
})

contextBridge.exposeInMainWorld(DESKTOP_FILE_OPEN_BRIDGE, {
  /** Ask the main process to open a file:// URL. */
  openFile(url: string): Promise<void> {
    return ipcRenderer.invoke('desktop:open-file', url)
  },
})

contextBridge.exposeInMainWorld(DESKTOP_ZOOM_BRIDGE, {
  /** Apply the page zoom through the native view zoom (fixed menus stay aligned). */
  setFactor(factor: number): void {
    webFrame.setZoomFactor(factor)
  },
})
