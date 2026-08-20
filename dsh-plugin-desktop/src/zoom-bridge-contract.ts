/** Main-world key for the Electron page-zoom bridge. */
export const DESKTOP_ZOOM_BRIDGE = '__DSH_DESKTOP_ZOOM__'

/** Capability exposed by the context-isolated preload. */
export interface DesktopZoomBridge {
  /**
   * Set the page zoom factor (1 = 100%) through the native view zoom.
   * The view zoom scales the whole page including position:fixed menus, so
   * menu placement from getBoundingClientRect stays aligned — unlike the CSS
   * zoom property, whose fixed-position coordinate drift Chromium tracks
   * (issues.chromium.org 41461010).
   */
  setFactor(factor: number): void
}

/** Window shape consumed by desktop-only client code. */
export interface DesktopZoomBridgeWindow {
  __DSH_DESKTOP_ZOOM__?: DesktopZoomBridge
}
