import { parseBody, SECTION_NUMBERS } from './body.js';
import { hbarSvg, trendSvg } from './charts.js';
import { CSS } from './css.js';
import { escapeHtml } from './html.js';
import { chart, documentFooter, documentHeader, metricGroup, section, table } from './parts.js';
// docgen の入口（implementation 2c-1）：build(dataFile, bodyFile, docType, theme) → HTML。
// 枠（Header・7 セクションの見出しと順序・4 Graph・Footer）はここがデータファイルから描く。Agent は本文ファイルだけ書く
const TITLES = {
    '01': 'Executive Summary',
    '02': 'Key Metrics',
    '03': 'Discovery & Funnel',
    '04': 'Content Performance',
    '05': 'LLMO / Search',
    '06': 'Technical Health',
    '07': 'Findings & Next Actions',
};
/** データファイルの項目か（finding の根拠）。"metrics.claims_new" のような名前 */
export function refExists(data, ref) {
    const [group, key] = ref.split('.');
    if (!group || !key)
        return false;
    const g = data[group];
    return g !== null && typeof g === 'object' && !Array.isArray(g) && key in g;
}
export const LLMO_TOP = 8;
/** LLMO の観測（質問 × エンジン）を、エンジンごとの上位の引用元に縮める。同数はドメイン名の順 */
export function llmoSummary(llmo) {
    const byEngine = new Map();
    for (const q of llmo) {
        const e = byEngine.get(q.engine) ?? { questions: 0, counts: new Map() };
        e.questions++;
        for (const d of new Set(q.cited))
            e.counts.set(d, (e.counts.get(d) ?? 0) + 1);
        byEngine.set(q.engine, e);
    }
    return [...byEngine.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([engine, e]) => ({
        engine,
        questions: e.questions,
        top: [...e.counts.entries()]
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
            .slice(0, LLMO_TOP)
            .map(([domain, count]) => ({ domain, count })),
    }));
}
function prevMonth(month) {
    const [y, m] = month.split('-').map(Number);
    return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
}
export async function build(input) {
    const { data } = input;
    if ((input.docType !== 'monthly-observation' && input.docType !== 'daily-observation') ||
        data.doc.type !== input.docType)
        throw new Error(`文書の種類 ${input.docType} はまだ無い（データは ${data.doc.type}）`);
    const daily = input.docType === 'daily-observation';
    if (input.theme !== 'gikou')
        throw new Error(`テーマ ${input.theme} はまだ無い`);
    const body = await parseBody(input.body, (r) => refExists(data, r));
    const prev = daily ? '前日' : prevMonth(data.doc.month).slice(5);
    const noPrev = daily ? '前日なし' : '前月なし';
    const text = (n) => body.get(n) ?? '<p class="empty">本文なし</p>';
    // 枠が描く部分（Agent は置けない）
    const frame = {
        '01': '',
        '02': metricGroup('metrics', data.metrics, prev, noPrev) +
            chart(1, daily
                ? '30 日の推移 — 日ごとの新しい Claim と累計'
                : '12 か月の推移 — 月ごとの新しい Claim と累計', daily
                ? trendSvg(data.trend, { max: 30, daily: true, title: '30 日の推移' })
                : trendSvg(data.trend), daily
                ? 'ある日だけを描く（日本時間で区切る）。空の日を 0 として描かない。'
                : 'ある月だけを描く。空の月を 0 として描かない。', 'trend'),
        '03': chart(2, '出どころの内訳 — 新しい Claim がどの発信元から来たか', hbarSvg(data.origin, { title: '出どころの内訳' }), '発信元の種類ごとの件数。', 'origin') +
            chart(3, 'Funnel — Indexer の絞り込み', hbarSvg(data.funnel, { title: 'Funnel', percentOfFirst: true }), '各段の件数と、最初の段に対する通過率。各段は別の理由で捨てる。', 'funnel'),
        '04': metricGroup('content', data.content, prev, noPrev) +
            chart(4, '内容ごとの成果 — 題材ごとの新しい Claim', hbarSvg(data.by_topic, { title: '題材ごとの新しい Claim' }), '蒸留が付けた topic で数えた（一覧は蒸留の版で増減する）。', 'by_topic'),
        '05': data.llmo
            ? table(['エンジン', '質問', '上位の引用元（引用した質問の数）'], llmoSummary(data.llmo).map((e) => [
                e.engine,
                String(e.questions),
                e.top.map((d) => `${d.domain} ${d.count}`).join(', '),
            ]), 'llmo') +
                `<p class="note">エンジンごとに、引用元のドメインを引用した質問の数で並べた上位 ${LLMO_TOP}。質問ごとの全件はデータファイルの llmo。</p>`
            : daily
                ? '<p class="empty" data-ref="llmo" data-measured="false">LLMO は月に 1 回の観測で、日報には載せない（月次レポートの 05）。</p>'
                : '<p class="empty" data-ref="llmo" data-measured="false">未計測。質問の台帳と基準値の観測は第 0 号の手順 6（段 3）。</p>',
        '06': metricGroup('health', data.health, prev, noPrev),
    };
    const sections = SECTION_NUMBERS.map((n) => section(n, TITLES[n], (frame[n] ?? '') + text(n))).join('\n');
    const css = CSS;
    // 手元の日付（UTC だと JST の朝は前日になる）
    const builtAt = input.builtAt ??
        new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    return `<!doctype html>
<html lang="ja" data-doc-type="${data.doc.type}" data-theme="${input.theme}">
<head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${daily ? 'Daily' : 'Monthly'} Observation ${escapeHtml(data.doc.month)} · GIKOU Media</title>
<style>:root{--month:"${escapeHtml(data.doc.month)}"}${css}</style></head>
<body><main class="sheet" data-doc-type="${data.doc.type}">
${documentHeader(data.doc)}
${sections}
${documentFooter(data.doc, builtAt)}
</main></body></html>
`;
}
