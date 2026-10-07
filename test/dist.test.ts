import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
// 使う側と同じ入口（dist/）から読む
import { build } from '../dist/index.js'

const FX = new URL('./fixtures/docgen/', import.meta.url)

test('dist/ から読んで月次レポートが組める（使う側の入口）', async () => {
  const html = await build({
    data: JSON.parse(readFileSync(new URL('data.json', FX), 'utf8')),
    body: readFileSync(new URL('body.md', FX), 'utf8'),
    docType: 'monthly-observation',
    theme: 'gikou',
    builtAt: '2026-10-06',
  })
  assert.match(html, /^<!doctype html>/)
  assert.equal([...html.matchAll(/data-section="(\d\d)"/g)].length, 7)
})
