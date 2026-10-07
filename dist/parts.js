import { escapeHtml } from './html.js';
// 部品 8 つ（spec §7.4）：DocumentHeader / Section / Metric・MetricGroup / Chart / Table / Finding / Action / DocumentFooter。
// 種別・状態を data 属性に残す（LLM が HTML を読むときにも構造が伝わる）
const n = (v) => v === null ? '未計測' : Number.isInteger(v) ? v.toLocaleString('en-US') : v.toFixed(2);
export function documentHeader(doc) {
    const [y, m] = doc.month.split('-');
    const rows = [
        ['STATUS', doc.status],
        ['DOMAIN', doc.domain],
        ['PHASE', doc.phase],
        ['UPDATED', doc.updated],
        ['VERSION', doc.version],
    ];
    return `<header class="doc-header" data-part="DocumentHeader" data-doc-type="${doc.type}" data-status="${doc.status}" data-phase="${doc.phase}">
<div class="kicker">GIKOU MEDIA</div><h1>MONTHLY OBSERVATION</h1><hr>
<div class="month">${y} 年 ${Number(m)} 月</div>
<dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${escapeHtml(v)}</dd>`).join('')}</dl><hr></header>`;
}
export function section(num, title, inner) {
    return `<section class="section" data-part="Section" data-section="${num}"><h2><small>${num}</small>${escapeHtml(title)}</h2>${inner}</section>`;
}
export function metric(key, m, prevLabel) {
    let delta = '';
    if (m.value !== null && m.prev !== null) {
        const d = m.value - m.prev;
        delta = `${d > 0 ? '+' : d < 0 ? '−' : '±'}${n(Math.abs(d))}${prevLabel ? ` vs ${prevLabel}` : ''}`;
    }
    else if (m.value !== null)
        delta = '前月なし';
    return `<div class="metric" data-part="Metric" data-ref="${escapeHtml(key)}" data-measured="${m.value !== null}"><span class="label">${escapeHtml(m.label)}</span><span class="value">${n(m.value)}${m.unit && m.value !== null ? `<small>${escapeHtml(m.unit)}</small>` : ''}</span><span class="delta">${delta}</span><span class="ref">${escapeHtml(key)}</span></div>`;
}
export function metricGroup(group, metrics, prevLabel) {
    return `<div class="metrics" data-part="MetricGroup">${Object.entries(metrics)
        .map(([k, m]) => metric(`${group}.${k}`, m, prevLabel))
        .join('')}</div>`;
}
export function chart(num, title, svg, caption, ref) {
    return `<figure class="chart" data-part="Chart" data-chart="${num}" data-ref="${escapeHtml(ref)}"><p class="title"><small>GRAPH ${num}</small>${escapeHtml(title)}</p>${svg}<figcaption class="caption">${escapeHtml(caption)}</figcaption></figure>`;
}
export function table(head, rows, ref) {
    return `<table class="data" data-part="Table" data-ref="${escapeHtml(ref)}"><thead><tr>${head.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${rows
        .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`)
        .join('')}</tbody></table>`;
}
export function finding(inner, refs) {
    return `<aside class="finding" data-part="Finding" data-refs="${escapeHtml(refs.join(','))}"><div class="finding-refs">根拠：${refs.map((r) => `<code>${escapeHtml(r)}</code>`).join(' ')}</div>${inner}</aside>`;
}
export function action(inner, status) {
    return `<div class="action" data-part="Action" data-status="${escapeHtml(status)}"><span class="chip">${escapeHtml(status)}</span>${inner}</div>`;
}
export function documentFooter(doc, builtAt) {
    return `<footer class="doc-footer" data-part="DocumentFooter" data-human-checked="${doc.human_checked}">
<p>生成日 ${escapeHtml(builtAt)} · データ確定日 ${escapeHtml(doc.data_fixed_at)} · 生成 ${escapeHtml(doc.generated_by)}</p>
<p>${doc.human_checked ? '自動生成・人間確認済み' : '自動生成・<b>人間未確認</b>'}</p>
<p class="mono">数字はすべてデータファイル（data.json）から描いた。各数字の下の名前がデータファイルの項目。</p></footer>`;
}
