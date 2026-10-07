import { readFileSync, writeFileSync } from 'node:fs'

// src/tokens.css と src/docgen.css を 1 本の文字列にして src/css.ts に書く。
// folio は Cloudflare の Worker の上でも動かすので、実行時にファイルを読まない（gikou decisions/2026-10-07-shared-systems.md）。
// --check：書かずに、今の src/css.ts と一致するかだけ見る（CI の gen:check）

const src = new URL('../src/', import.meta.url)
const css =
  readFileSync(new URL('tokens.css', src), 'utf8') +
  readFileSync(new URL('docgen.css', src), 'utf8')
const out = `// 生成物。手で直さない。直すのは src/tokens.css と src/docgen.css、作るのは pnpm gen:css\nexport const CSS = ${JSON.stringify(css)}\n`
const target = new URL('css.ts', src)
if (process.argv.includes('--check')) {
  let now = ''
  try {
    now = readFileSync(target, 'utf8')
  } catch {}
  if (now !== out) {
    console.error('src/css.ts が tokens.css / docgen.css と合わない。pnpm gen:css を流す')
    process.exit(1)
  }
} else {
  writeFileSync(target, out)
  console.log('src/css.ts')
}
