import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { parseBody } from '../src/body.ts'
import { build, llmoSummary, refExists } from '../src/build.ts'
import { hbarSvg, trendSvg } from '../src/charts.ts'
import type { MonthlyData } from '../src/types.ts'

const FX = new URL('./fixtures/docgen/', import.meta.url)
const data = JSON.parse(readFileSync(new URL('data.json', FX), 'utf8')) as MonthlyData
const body = readFileSync(new URL('body.md', FX), 'utf8')

test('build：Header・7 セクションが順に・4 Graph・Footer。部品は data-part を持つ', async () => {
  const html = await build({
    data,
    body,
    docType: 'monthly-observation',
    theme: 'gikou',
    builtAt: '2026-10-06',
  })
  const sections = [...html.matchAll(/data-section="(\d\d)"/g)].map((m) => m[1])
  assert.deepEqual(sections, ['01', '02', '03', '04', '05', '06', '07'])
  assert.deepEqual(
    [...html.matchAll(/data-chart="(\d)"/g)].map((m) => m[1]),
    ['1', '2', '3', '4'],
  )
  for (const part of [
    'DocumentHeader',
    'Section',
    'MetricGroup',
    'Metric',
    'Chart',
    'Finding',
    'Action',
    'DocumentFooter',
  ])
    assert.ok(html.includes(`data-part="${part}"`), part)
  assert.match(html, /data-ref="llmo" data-measured="false">未計測/)
  assert.match(html, /自動生成・<b>人間未確認<\/b>/)
  assert.match(html, /data-ref="health.jev_input_tokens" data-measured="false"/)
  // 本文の無いセクションは「本文なし」
  assert.equal((html.match(/<p class="empty">本文なし<\/p>/g) ?? []).length, 5)
  // 枠の無いセクション（07）に undefined が出ない
  assert.doesNotMatch(html, /undefined/)
})

test('Graph：値を図の中に書く・Funnel は通過率・空は未計測', () => {
  const svg = hbarSvg(data.funnel, { title: 'Funnel', percentOfFirst: true })
  assert.match(svg, />196</)
  assert.match(svg, />176 \(89\.8%\)</)
  assert.ok(!svg.includes('<script'))
  assert.match(hbarSvg([], { title: 'x' }), /未計測/)
  assert.match(trendSvg(data.trend), /新 671/)
  assert.match(trendSvg(data.trend), /累計 752/)
})

test('本文：使える部品は section / finding / action だけ・根拠はデータファイルに要る・生の HTML は落とす', async () => {
  const ok = (r: string) => refExists(data, r)
  assert.equal(refExists(data, 'metrics.claims_new'), true)
  assert.equal(refExists(data, 'metrics.nope'), false)
  assert.equal(refExists(data, 'trend.x'), false)
  const m = await parseBody('::::section{n="02"}\n文 <script>alert(1)</script>\n::::\n', ok)
  assert.ok(!(m.get('02') ?? '').includes('<script'))
  await assert.rejects(
    () => parseBody('::::section{n="07"}\n:::finding{refs="metrics.nope"}\nx\n:::\n::::\n', ok),
    /データファイルに無い/,
  )
  await assert.rejects(
    () => parseBody('::::section{n="07"}\n:::finding\nx\n:::\n::::\n', ok),
    /refs が要る/,
  )
  await assert.rejects(
    () => parseBody('::::section{n="07"}\n:::chart\nx\n:::\n::::\n', ok),
    /使えない部品 chart/,
  )
  await assert.rejects(() => parseBody('::::section{n="09"}\nx\n::::\n', ok), /01〜07 でない/)
  await assert.rejects(() => parseBody('section の外の文\n', ok), /section\{n="NN"\} の中/)
})

test('llmoSummary：エンジンごとに、引用元を引用した質問の数で並べる（同じ質問の重複は 1 回・同数は名前順）', () => {
  const s = llmoSummary([
    { question: 'q1', engine: 'openai', cited: ['b.test', 'a.test', 'a.test'] },
    { question: 'q2', engine: 'openai', cited: ['b.test'] },
    { question: 'q1', engine: 'claude', cited: ['c.test'] },
  ])
  assert.deepEqual(s, [
    { engine: 'claude', questions: 1, top: [{ domain: 'c.test', count: 1 }] },
    {
      engine: 'openai',
      questions: 2,
      top: [
        { domain: 'b.test', count: 2 },
        { domain: 'a.test', count: 1 },
      ],
    },
  ])
  const many = llmoSummary([
    { question: 'q', engine: 'e', cited: Array.from({ length: 12 }, (_, i) => `d${i}.test`) },
  ])
  assert.equal(many[0]?.top.length, 8)
})

test('日報（daily-observation）：見出し・前日比・30 日の推移（数字は最後の日だけ）・LLMO は載せない。種類が違えば止める', async () => {
  const days = Array.from({ length: 20 }, (_, i) => ({
    month: `2026-10-${String(i + 1).padStart(2, '0')}`,
    new_claims: 10 + i,
    total_claims: 100 + i * 10,
  }))
  const daily: MonthlyData = {
    ...data,
    doc: { ...data.doc, type: 'daily-observation', month: '2026-10-08' },
    trend: days,
    llmo: null,
    metrics: { claims_new: { label: '新しい Claim', value: 30, prev: 20 } },
  }
  const html = await build({
    data: daily,
    body: '',
    docType: 'daily-observation',
    theme: 'gikou',
    builtAt: '2026-10-09',
  })
  assert.match(html, /<h1>DAILY OBSERVATION<\/h1>/)
  assert.match(html, /2026 年 10 月 8 日/)
  assert.match(html, /\+10 vs 前日/)
  assert.match(html, /30 日の推移 — 日ごとの新しい Claim と累計/)
  assert.equal((html.match(/>新 /g) ?? []).length, 1)
  assert.match(html, />10\/20</)
  assert.match(html, /日報には載せない/)
  await assert.rejects(
    build({ data: daily, body: '', docType: 'monthly-observation', theme: 'gikou' }),
    /文書の種類/,
  )
})
