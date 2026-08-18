/** Minimal context-isolated bridge for resolving operating-system drag payloads. */

import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { DESKTOP_FILE_PATH_BRIDGE } from './file-path-bridge-contract.ts'
import { DESKTOP_FILE_OPEN_BRIDGE } from './file-open-bridge-contract.ts'

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
