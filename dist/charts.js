import { escapeHtml } from './html.js';
// 4 Graph（spec §7.1）をビルド時に静的 SVG にする。JS なし・無彩色（--chart-1 / --chart-2）・値を図の中に併記（R-UI-7）
const W = 680;
const fmt = (n) => (Number.isInteger(n) ? n.toLocaleString('en-US') : n.toFixed(2));
/** 横棒。ラベル・棒・値。percentOfFirst で Funnel の通過率も添える */
export function hbarSvg(bars, opts) {
    if (bars.length === 0)
        return `<svg viewBox="0 0 ${W} 40" role="img" aria-label="${escapeHtml(opts.title)}：データなし"><text x="0" y="24">未計測</text></svg>`;
    const labelW = 200;
    const valueW = 110;
    const barMax = W - labelW - valueW;
    const max = Math.max(...bars.map((b) => b.value), 1);
    const row = 22;
    const h = bars.length * row + 8;
    const first = bars[0]?.value || 1;
    const rows = bars
        .map((b, i) => {
        const y = i * row + 4;
        const w = Math.max(1, Math.round((b.value / max) * barMax));
        const pct = opts.percentOfFirst && i > 0 ? ` (${((b.value / first) * 100).toFixed(1)}%)` : '';
        return `<g data-label="${escapeHtml(b.label)}" data-value="${b.value}"><text x="0" y="${y + 14}">${escapeHtml(b.label)}</text><rect x="${labelW}" y="${y + 3}" width="${w}" height="14" fill="var(--chart-1)"/><text x="${labelW + w + 6}" y="${y + 14}">${fmt(b.value)}${pct}</text></g>`;
    })
        .join('');
    return `<svg viewBox="0 0 ${W} ${h}" role="img" aria-label="${escapeHtml(opts.title)}">${rows}</svg>`;
}
/** Graph 1：月ごとの新しい Claim（棒）と累計（線）。空の月を 0 として描かない——ある月だけ */
export function trendSvg(trend) {
    if (trend.length === 0)
        return hbarSvg([], { title: '12 か月の推移' });
    const months = trend.slice(-12);
    const h = 180;
    const top = 24;
    const bottom = 28;
    const plotH = h - top - bottom;
    const step = W / Math.max(months.length, 1);
    const barW = Math.min(48, step * 0.5);
    const maxNew = Math.max(...months.map((m) => m.new_claims), 1);
    const maxTotal = Math.max(...months.map((m) => m.total_claims), 1);
    const parts = [];
    const points = [];
    months.forEach((m, i) => {
        const cx = step * i + step / 2;
        const bh = Math.round((m.new_claims / maxNew) * plotH * 0.8);
        const by = top + plotH - bh;
        parts.push(`<g data-month="${m.month}" data-new="${m.new_claims}" data-total="${m.total_claims}"><rect x="${cx - barW / 2}" y="${by}" width="${barW}" height="${bh}" fill="var(--chart-2)"/><text x="${cx}" y="${by - 6}" text-anchor="middle">新 ${fmt(m.new_claims)}</text><text x="${cx}" y="${h - 8}" text-anchor="middle">${m.month}</text></g>`);
        const ly = top + plotH - Math.round((m.total_claims / maxTotal) * plotH);
        points.push(`${cx},${ly}`);
        parts.push(`<circle cx="${cx}" cy="${ly}" r="3" fill="var(--chart-1)"/><text x="${cx + 8}" y="${ly + 4}">累計 ${fmt(m.total_claims)}</text>`);
    });
    const line = points.length > 1
        ? `<polyline points="${points.join(' ')}" fill="none" stroke="var(--chart-1)" stroke-width="1.5"/>`
        : '';
    return `<svg viewBox="0 0 ${W} ${h}" role="img" aria-label="12 か月の推移">${line}${parts.join('')}</svg>`;
}
