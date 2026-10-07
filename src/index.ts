// gikou-folio の入口。データと本文から、読むための A4 の HTML（folio）を作る純粋な関数。
// Node でも Cloudflare の Worker でも動く（node: の機能もファイルも使わない）。
export { parseBody } from './body.ts'
export { build, refExists } from './build.ts'
export { hbarSvg, trendSvg } from './charts.ts'
export { escapeHtml } from './html.ts'
export type * from './types.ts'
