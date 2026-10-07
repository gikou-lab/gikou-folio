import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// dist/ が src/ から作り直したものと一致するかを見る（CI の gen:check）。
// 使う側は dist/ を読む。Node は node_modules の中の TypeScript を読まないため（ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING）

const tmp = mkdtempSync(join(tmpdir(), 'folio-dist-'))
try {
  execFileSync('node_modules/.bin/tsc', ['-p', 'tsconfig.build.json', '--outDir', tmp], {
    stdio: 'inherit',
  })
  const want = readdirSync(tmp).sort()
  const have = readdirSync('dist').sort()
  const bad: string[] = []
  if (want.join() !== have.join())
    bad.push(`ファイルの並びが違う：${have.join(',')} ≠ ${want.join(',')}`)
  for (const f of want) {
    let now = ''
    try {
      now = readFileSync(join('dist', f), 'utf8')
    } catch {}
    if (now !== readFileSync(join(tmp, f), 'utf8')) bad.push(f)
  }
  if (bad.length) {
    console.error(`dist/ が src/ と合わない（${bad.join('・')}）。pnpm build を流す`)
    process.exit(1)
  }
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
