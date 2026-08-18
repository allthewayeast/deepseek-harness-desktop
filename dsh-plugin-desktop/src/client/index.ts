import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/cordis-plugin-loader'
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only service and SlotMap convergence for the Desktop settings section.
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import { applyAdvancedShell } from './advanced-shell.ts'
import { installContentApplier } from './content-applier.ts'
import { ContentRow } from './ContentRow.tsx'
import { DESKTOP_CONTENT_NAMESPACE, type DesktopContentSettings } from '../content-settings-types.ts'
import { installOpenPathOverride } from './open-path-override.ts'
import { startRendererBootReporter } from './boot-health.ts'
import { applyDesktopSettings } from './desktop-settings.ts'
import { installDesktopDirectoryPickerBridge, requestDesktopDirectoryValidation } from './directory-picker.ts'
import { parseDesktopClientEnvironment } from './environment.ts'
import { installWorkspaceFolderDrop } from './workspace-folder-drop.ts'

export { applyAdvancedShell } from './advanced-shell.ts'
export { applyDesktopSettings } from './desktop-settings.ts'
export {
  createDesktopSettingsApi,
  desktopSettingsPaths,
  parseDesktopActionAcceptance,
  parseDesktopRestartAcceptance,
  parseDesktopSettingsView,
} from './desktop-settings-api.ts'
export type {
  DesktopMarketProvider,
  DesktopMarketView,
  DesktopProfileView,
  DesktopRestartAcceptance,
  DesktopSettingsApi,
  DesktopSettingsView,
} from './desktop-settings-api.ts'
export { DesktopSettingsSection } from './DesktopSettingsSection.tsx'
export { DesktopTerminalSettingsAction } from './DesktopTerminalSettingsAction.tsx'
export type {
  DesktopTerminalSettingsActionInjected,
  DesktopTerminalSettingsActionProps,
} from './DesktopTerminalSettingsAction.tsx'
export type {
  DesktopNotificationSettings,
  DesktopSettingsSectionInjected,
  DesktopSettingsSectionProps,
  DesktopShellSettings,
} from './DesktopSettingsSection.tsx'
export { ContentRow } from './ContentRow.tsx'
export { DESKTOP_CONTENT_NAMESPACE } from '../content-settings-types.ts'
export type { DesktopContentSettings } from '../content-settings-types.ts'
export {
  RENDERER_BOOT_REPORT_PATH,
  rendererBootReport,
  sendRendererBootReport,
  startRendererBootReporter,
} from './boot-health.ts'
export type { RendererBootLoader, RendererBootReport } from './boot-health.ts'
export { parseDesktopClientEnvironment } from './environment.ts'
export type { DesktopClientEnvironment, DesktopClientMode, DesktopClientPlatform } from './environment.ts'

/** Services required by Desktop settings and advanced presentation. */
export const inject = [
  'slots',
  'locale',
  'connection',
  'remote',
  'settingsScope',
  'sessions',
  'theme',
  'workspaces',
]

/** Register desktop-owned client surfaces for the current BrowserWindow mode. @param ctx - browser Cordis context. */
export function apply(ctx: ClientContext): void {
  const environment = parseDesktopClientEnvironment(window.location.search)
  if (!environment) return
  applyDesktopSettings(ctx, environment)
  ctx.effect(
    () => startRendererBootReporter(ctx.loader),
    'dsh-plugin-desktop: renderer boot health report',
  )
  ctx.effect(
    () => installWorkspaceFolderDrop({
      create: input => ctx.workspaces.create(input),
      startSession: workspaceId => { ctx.workspaces.startSession(workspaceId) },
      ...(environment.platform === 'win32'
        ? { validateDirectory: (path: string) => requestDesktopDirectoryValidation(path) }
        : {}),
    }),
    'dsh-plugin-desktop: workspace folder drop',
  )
  if (environment.platform === 'win32') {
    ctx.effect(
      () => installDesktopDirectoryPickerBridge(),
      'dsh-plugin-desktop: native directory picker bridge',
    )
  }
  if (environment.mode === 'advanced') applyAdvancedShell(ctx, environment)

  ctx.effect(
    () => installOpenPathOverride(ctx),
    'dsh-plugin-desktop: native path opener',
  )

  const content = ctx.settingsScope.bind<DesktopContentSettings>({
    namespace: DESKTOP_CONTENT_NAMESPACE,
  })
  ctx.effect(
    () => installContentApplier(content),
    'dsh-plugin-desktop: content document variables',
  )
  ctx.effect(
    () => ctx.slots.inject('settings.general.item', () => ctx.slots.register({
      name: 'settings.general.item',
      id: 'desktop-content',
      order: 20,
      inject: () => ({ scope: content }),
    }, ContentRow)),
    'dsh-plugin-desktop: content settings row',
  )
}
