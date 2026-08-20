import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it } from 'vitest'
import { WindowsAgentPresets } from '../src/windows-agent-presets.ts'

const roots: string[] = []
const contexts: Context[] = []

function writePreset(root: string, id: string): void {
  const dir = join(root, id)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'agent.cordis.yml'), [
    '- id: fixture',
    "  name: 'fixture-plugin'",
    '',
  ].join('\n'))
}

function createRoster(defaultId: string): WindowsAgentPresets {
  const root = mkdtempSync(join(tmpdir(), 'dsh-desktop-windows-presets-'))
  roots.push(root)
  writePreset(root, 'minimal')
  writePreset(root, 'standard')
  writePreset(root, 'code')
  const ctx = new Context()
  contexts.push(ctx)
  return new WindowsAgentPresets(ctx, {
    default: defaultId,
    roots: [{ path: root, trust: 'system' }],
    includeUserRoot: false,
  })
}

afterEach(async () => {
  await Promise.all(contexts.splice(0).map(ctx => ctx.fiber.dispose()))
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('Windows agent preset roster (issue #317)', () => {
  it('lists the minimal preset alongside the other shipped presets', async () => {
    const presets = createRoster('standard')

    expect((await presets.list()).map(preset => preset.id)).toEqual(
      expect.arrayContaining(['minimal', 'standard', 'code']),
    )
  })

  it('keeps minimal as the default when the roster names it', () => {
    const presets = createRoster('minimal')

    expect(presets.defaultId).toBe('minimal')
  })

  it('resolves the minimal preset by id', async () => {
    const presets = createRoster('standard')

    await expect(presets.resolve('minimal')).resolves.toMatchObject({ id: 'minimal' })
  })
})
