import rehypeStringify from 'rehype-stringify'
import remarkDirective from 'remark-directive'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { action, finding } from './parts.ts'

// 本文ファイル（Agent が書く）。記法は記事と同じ Markdown + ディレクティブ。使える部品は 3 つだけ：
//   ::::section{n="07"} … ::::   セクションの本文（01〜07）
//   :::finding{refs="metrics.claims_new,health.jev_mismatch"} … :::   気づきと根拠の数字（データファイルの項目）
//   :::action{status="next"} … :::   次の行動
// 生の HTML は落とす（Agent に任意の HTML を書かせない）。知らない部品・存在しない根拠はビルドを止める

type Node = {
  type: string
  name?: string
  attributes?: Record<string, string | null | undefined>
  children?: Node[]
  value?: string
  data?: Record<string, unknown>
}

export const SECTION_NUMBERS = ['01', '02', '03', '04', '05', '06', '07'] as const

function walk(node: Node, fn: (n: Node) => void): void {
  fn(node)
  for (const c of node.children ?? []) walk(c, fn)
}

async function toHtml(nodes: Node[]): Promise<string> {
  const proc = unified().use(remarkRehype).use(rehypeStringify)
  const hast = await proc.run({ type: 'root', children: nodes } as never)
  return proc.stringify(hast as never)
}

/** 本文ファイル → セクション番号ごとの HTML。refExists でデータファイルの項目かを確かめる */
export async function parseBody(
  md: string,
  refExists: (ref: string) => boolean,
): Promise<Map<string, string>> {
  const tree = unified().use(remarkParse).use(remarkDirective).parse(md) as Node
  unified()
    .use(remarkDirective)
    .runSync(tree as never)
  const out = new Map<string, string>()
  for (const top of tree.children ?? []) {
    if (top.type === 'html') continue
    if (top.type !== 'containerDirective' || top.name !== 'section') {
      if (top.type === 'paragraph' || top.type === 'heading' || top.type === 'list')
        throw new Error('本文はすべて ::::section{n="NN"} の中に書く')
      continue
    }
    const num = String(top.attributes?.n ?? '')
    if (!(SECTION_NUMBERS as readonly string[]).includes(num))
      throw new Error(`section n="${num}" は 01〜07 でない`)
    if (out.has(num)) throw new Error(`section ${num} が 2 つある`)
    const pieces: string[] = []
    for (const child of top.children ?? []) {
      if (child.type === 'html') continue
      if (
        child.type === 'containerDirective' ||
        child.type === 'leafDirective' ||
        child.type === 'textDirective'
      ) {
        if (child.name === 'finding') {
          const refs = String(child.attributes?.refs ?? '')
            .split(/[\s,]+/)
            .filter(Boolean)
          if (refs.length === 0)
            throw new Error(
              'finding には根拠の refs が要る（07 の気づきはどの数字から導いたかを示す）',
            )
          for (const r of refs)
            if (!refExists(r)) throw new Error(`finding の根拠 ${r} がデータファイルに無い`)
          pieces.push(finding(await toHtml(child.children ?? []), refs))
        } else if (child.name === 'action') {
          pieces.push(
            action(await toHtml(child.children ?? []), String(child.attributes?.status ?? 'next')),
          )
        } else
          throw new Error(
            `本文で使えない部品 ${child.name}（使えるのは section / finding / action）`,
          )
        continue
      }
      let bad: string | null = null
      walk(child, (n) => {
        if (n.type.endsWith('Directive')) bad = n.name ?? '?'
      })
      if (bad) throw new Error(`本文で使えない部品 ${bad}`)
      pieces.push(await toHtml([child]))
    }
    out.set(num, pieces.join('\n'))
  }
  return out
}
