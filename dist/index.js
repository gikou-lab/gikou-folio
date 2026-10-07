// gikou-folio の入口。データと本文から、読むための A4 の HTML（folio）を作る純粋な関数。
// Node でも Cloudflare の Worker でも動く（node: の機能もファイルも使わない）。
export { parseBody } from './body.js';
export { build, refExists } from './build.js';
export { hbarSvg, trendSvg } from './charts.js';
export { escapeHtml } from './html.js';
