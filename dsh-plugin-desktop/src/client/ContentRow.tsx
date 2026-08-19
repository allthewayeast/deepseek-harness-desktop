/**
 * Desktop content settings row registered into the General section item slot:
 * zoom slider + font inputs. Matches the standard General row style (LanguageRow).
 */
import { useCallback, useSyncExternalStore } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import {
  DEFAULT_CODE_FONT,
  DEFAULT_EDITOR,
  DEFAULT_UI_FONT,
  DEFAULT_WIDE_CONVERSATION,
  DEFAULT_ZOOM,
  type DesktopContentSettings,
} from '../content-settings-types.ts'

/** Injected business face: the bound settings scope. */
export interface ContentRowInjected {
  /** Durable content section bound to the desktop plugin fiber. */
  scope: SettingsScope<DesktopContentSettings>
}

/** Full component props: runtime share + injected face. */
export type ContentRowComponentProps = PropsRuntime<'settings.general.item'> & ContentRowInjected

const PLACEHOLDER_UI_FONT = 'system-ui, sans-serif'
const PLACEHOLDER_CODE_FONT = 'Consolas, monospace'

/**
 * Switch styling lives with the component so it applies wherever this row
 * renders (the settings surface may host the row outside the advanced shell
 * that injects the global desktop content styles).
 */
const SWITCH_STYLES = `
.dshDesktopSwitch {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex: none;
  cursor: pointer;
}
.dshDesktopSwitch input[type="checkbox"] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  opacity: 0;
  cursor: pointer;
}
.dshDesktopSwitchTrack {
  box-sizing: border-box;
  width: 56px;
  height: 32px;
  border-radius: 16px;
  background: var(--dsw-alias-border-l2);
  transition: background 0.15s ease;
}
.dshDesktopSwitchTrack::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  transition: transform 0.15s ease;
}
.dshDesktopSwitch input[type="checkbox"]:checked + .dshDesktopSwitchTrack {
  background: rgb(65, 118, 230);
}
.dshDesktopSwitch input[type="checkbox"]:checked + .dshDesktopSwitchTrack::after {
  transform: translateX(24px);
}
.dshDesktopSwitch input[type="checkbox"]:disabled + .dshDesktopSwitchTrack {
  opacity: 0.5;
}
.dshDesktopSwitch input[type="checkbox"]:focus-visible + .dshDesktopSwitchTrack {
  outline: 2px solid rgb(65, 118, 230);
  outline-offset: 2px;
}
`

const styles = {
  group: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '100%',
  } as const,
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '16px 0',
    borderBottom: '1px solid var(--dsw-alias-border-l2)',
  } as const,
  lastRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '16px 0',
  } as const,
  switchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 0',
  } as const,
  rowText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    paddingTop: '6px',
  } as const,
  rowTextSwitch: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    paddingRight: '48px',
  } as const,
  title: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '22px',
    color: 'var(--dsw-alias-label-primary)',
  } as const,
  hint: {
    fontSize: '12px',
    lineHeight: '18px',
    color: 'var(--dsw-alias-label-secondary)',
  } as const,
  controls: {
    boxSizing: 'border-box' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    flex: '0 1 300px',
    minWidth: 0,
  } as const,
  sliderGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as const,
  slider: {
    boxSizing: 'border-box' as const,
    flex: 1,
    minWidth: 0,
    height: '4px',
    borderRadius: '2px',
    background: 'var(--dsw-alias-border-l2)',
    outline: 'none',
    WebkitAppearance: 'none' as const,
    appearance: 'none' as const,
    cursor: 'pointer',
  } as const,
  sliderValue: {
    flex: 'none',
    fontSize: '12px',
    lineHeight: '18px',
    color: 'var(--dsw-alias-label-secondary)',
    minWidth: '40px',
    textAlign: 'right' as const,
  } as const,
  input: {
    boxSizing: 'border-box' as const,
    width: '100%',
    height: '32px',
    padding: '0 12px',
    border: '1px solid var(--dsw-alias-border-l2)',
    borderRadius: '16px',
    background: 'var(--dsw-alias-bg-module-platform)',
    fontFamily: 'inherit',
    fontSize: '13px',
    lineHeight: '20px',
    color: 'var(--dsw-alias-label-primary)',
    outline: 'none',
  } as const,
}

/**
 * Render the desktop content preferences row inside the settings General section.
 * @param props - composed slot props carrying the bound content scope.
 * @returns the content row element tree.
 */
export function ContentRow({ scope }: ContentRowComponentProps) {
  const subscribe = useCallback((listener: () => void) => scope.subscribe(listener), [scope])
  const readSnapshot = useCallback(() => scope.getSnapshot(), [scope])
  const snapshot = useSyncExternalStore(subscribe, readSnapshot)

  const section = snapshot.value
  const zoom = section?.zoom ?? DEFAULT_ZOOM
  const uiFont = section?.uiFont ?? DEFAULT_UI_FONT
  const codeFont = section?.codeFont ?? DEFAULT_CODE_FONT
  const defaultEditor = section?.defaultEditor ?? DEFAULT_EDITOR
  const wideConversation = section?.wideConversation ?? DEFAULT_WIDE_CONVERSATION

  const onZoomChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    void scope.set('zoom', Number(event.target.value))
  }, [scope])

  const onUiFontChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    void scope.set('uiFont', event.target.value)
  }, [scope])

  const onCodeFontChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    void scope.set('codeFont', event.target.value)
  }, [scope])

  const onEditorChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    void scope.set('defaultEditor', event.target.value)
  }, [scope])

  const onWideConversationChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    void scope.set('wideConversation', event.target.checked)
  }, [scope])

  if (snapshot.status === 'loading' || snapshot.status === 'unavailable') return null

  const disabled = !snapshot.writable

  return (
    <div style={styles.group}>
    <style>{SWITCH_STYLES}</style>
    <div style={styles.row}>
      <div style={styles.rowText}>
        <div style={styles.title}>内容</div>
        <div style={styles.hint}>调整页面缩放和字体</div>
      </div>
      <div style={styles.controls}>
        <div style={styles.sliderGroup}>
          <input
            type="range"
            min={50}
            max={200}
            step={5}
            value={zoom}
            disabled={disabled}
            onChange={onZoomChange}
            style={styles.slider}
            aria-label="页面缩放"
          />
          <div style={styles.sliderValue}>{zoom}%</div>
        </div>
        <input
          type="text"
          value={uiFont}
          placeholder={PLACEHOLDER_UI_FONT}
          disabled={disabled}
          onChange={onUiFontChange}
          style={styles.input}
          aria-label="界面字体"
        />
        <input
          type="text"
          value={codeFont}
          placeholder={PLACEHOLDER_CODE_FONT}
          disabled={disabled}
          onChange={onCodeFontChange}
          style={styles.input}
          aria-label="代码字体"
        />
      </div>
    </div>
    <div style={styles.row}>
      <div style={styles.rowText}>
        <div style={styles.title}>默认编辑器</div>
        <div style={styles.hint}>设置打开文件链接的程序</div>
      </div>
      <div style={styles.controls}>
        <input
          type="text"
          value={defaultEditor}
          placeholder="留空使用系统默认程序"
          disabled={disabled}
          onChange={onEditorChange}
          style={styles.input}
          aria-label="默认编辑器"
        />
      </div>
    </div>
    <div style={styles.switchRow}>
      <div style={styles.rowTextSwitch}>
        <div style={styles.title}>宽屏会话</div>
        <div style={styles.hint}>将会话历史页面的宽度扩展为页面宽度的 90%</div>
      </div>
      <label className="dshDesktopSwitch">
        <input
          type="checkbox"
          checked={wideConversation}
          disabled={disabled}
          onChange={onWideConversationChange}
          aria-label="宽屏会话"
        />
        <span className="dshDesktopSwitchTrack" />
      </label>
    </div>
    </div>
  )
}
