import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

// folio は Cloudflare の Worker の上でも動かす。src/ が node: の機能を読んだら止める
test('src/ は node: を import しない（Worker でも動く）', () => {
  const dir = new URL('../src/', import.meta.url)
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.ts'))) {
    const s = readFileSync(new URL(f, dir), 'utf8')
    assert.ok(!/from ['"]node:/.test(s), `${f} が node: を import している`)
  }
})
