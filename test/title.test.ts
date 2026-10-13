import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { build, documentTitle, runningHead } from '../src/build.ts'
import { CSS } from '../src/css.ts'
import type { MonthlyData } from '../src/types.ts'

// 題と各ページの頭の帯は、使う側のデータ（doc.domain・doc.type・doc.month）から組む。folio は名前を持たない（v0.3.1）
const FX = new URL('./fixtures/docgen/', import.meta.url)
const data = JSON.parse(readFileSync(new URL('data.json', FX), 'utf8')) as MonthlyData

test('題と頭の帯：日報か月報か・domain・日付から', () => {
  const d = { type: 'daily-observation', month: '2026-10-13', domain: 'FUKUSHI INDEX' }
  assert.equal(documentTitle(d), 'FUKUSHI INDEX · Daily Observation 2026-10-13')
  assert.equal(runningHead(d), 'FUKUSHI INDEX · DAILY OBSERVATION · 2026-10-13')
  const m = { type: 'monthly-observation', month: '2026-10', domain: 'EMDASH MEDIA' }
  assert.equal(documentTitle(m), 'EMDASH MEDIA · Monthly Observation 2026-10')
  assert.equal(runningHead(m), 'EMDASH MEDIA · MONTHLY OBSERVATION · 2026-10')
})

test('build：題と帯がデータから入り、CSS に名前の決め打ちが無い。帯の文字の " と < は逃がす', async () => {
  assert.doesNotMatch(CSS, /GIKOU MEDIA · MONTHLY/)
  const html = await build({
    data: {
      ...data,
      doc: { ...data.doc, type: 'daily-observation', month: '2026-10-13', domain: 'A "B" <C>' },
    },
    body: '',
    docType: 'daily-observation',
    theme: 'gikou',
    builtAt: '2026-10-14',
  })
  assert.match(html, /<title>A &quot;B&quot; &lt;C&gt; · Daily Observation 2026-10-13<\/title>/)
  assert.match(html, /--running-head:"A \\"B\\" {2}C> · DAILY OBSERVATION · 2026-10-13"/)
  assert.doesNotMatch(html, /· GIKOU Media<\/title>/)
})

test('build：omit の節は出さない（どの節を出すかは使う側が決める）', async () => {
  const html = await build({
    data,
    body: '',
    docType: 'monthly-observation',
    theme: 'gikou',
    builtAt: '2026-10-14',
    omit: ['04', '05'],
  })
  assert.match(html, /data-section="03"/)
  assert.doesNotMatch(html, /data-section="04"|data-section="05"/)
  assert.match(html, /data-section="06"/)
})
