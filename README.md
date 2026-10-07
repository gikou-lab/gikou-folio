# gikou-folio

> ボタンを押す画面ではなく、読むための 1 枚を返す。

データと本文から、**読むための A4 の HTML（folio）**を作る純粋な関数。1 枚のことも、何枚にもなることもある。ブラウザに出た folio がそのまま UI であり成果物で、印刷すれば PDF になる（Print CSS）。目指すのは、ボタンがいっぱいの画面ではなく、人が LLM に話しかけたら folio が返ってくるインターフェース。その先駆けとして作る。

GIKOU の共通の仕組み 3 つの 1 つ（検索インデクサー `gikou-indexer`・LLMO `gikou-llmo`・folio `gikou-folio`）。文書の種類とテーマを差し替えて使い回す（gikou `decisions/2026-10-07-shared-systems.md`）。2026-10-07 に `geo-marketing/press/src/docgen/` から独立した（旧称 docgen）。

```ts
import { build } from 'gikou-folio'
const html = await build({ data, body, docType: 'monthly-observation', theme: 'gikou' })
```

## 使っている製品

| 製品 | 文書の種類 | どこで動くか |
|---|---|---|
| GIKOU Media（EmDash） | 月次レポート | ビルド時（Node） |
| 出店カルテ | 出店カルテ（8 ページ） | フォームが送られたその場（Cloudflare の Worker） |

## 決まり

- **Node でも Cloudflare の Worker でも動く**。`src/` は `node:` の機能もファイルも使わない（`test/worker.test.ts` が止める）
- **使う側は `dist/`（JavaScript と型の定義）を読む**。Node は `node_modules` の中の TypeScript を読まない（`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`）ため。`src/` を直したら `pnpm build` で `dist/` を作り直す。CI の `gen:check` が `src/` と `dist/` の食い違いを止める
- **CSS は文字列で持つ**。直すのは `src/tokens.css`（Design Token・正本）と `src/docgen.css`（Print CSS）で、`pnpm gen:css` が `src/css.ts` を作る。CI の `gen:check` が食い違いを止める
- **根拠の無い文は止める**。本文の `finding` の根拠がデータファイルに無ければビルドを止める。生の HTML は落とす
- folio はインデクサーも LLMO も Registry も知らない。渡されたデータと本文を描くだけ
- 使う側は決まった版を読む（git のタグ）。プロトタイプの間は、手元では `pnpm link` で直接つなぐ

## 中身

| ファイル | 何 |
|---|---|
| `src/index.ts` | 入口 |
| `src/build.ts` | `build({ data, body, docType, theme }) → HTML` |
| `src/body.ts` | 本文（Markdown）の部品 `section`・`finding`・`action` の解釈 |
| `src/parts.ts` | 枠と部品（Header・Section・MetricGroup・Table・Chart・Footer・Finding・Action） |
| `src/charts.ts` | グラフを SVG に（横棒・推移） |
| `src/tokens.css`・`src/docgen.css` | Design Token と Print CSS（正本） |
| `src/css.ts` | 上の 2 つを 1 本にした生成物 |
| `dist/` | `src/` を JavaScript に変換した生成物（使う側が読む） |

## これからの直し

- **文書の種類は使う側に置く**のが決まり。いまは最初の文書の種類「月次レポート」（`monthly-observation`・7 セクション・4 Graph・`MonthlyData` の型）が `build.ts`・`types.ts` に入ったまま。2 本目の文書の種類「出店カルテ」（gikou-lab/shutten の段 E）を作るときに、共通の部品と文書の種類の境目を決め、月次レポートを GIKOU Media の側へ出す（共通化は 2 か所で同じものを書いてから）
- Worker の上で `body.ts`（unified・remark）が束ねられて動くかは、出店カルテの Worker で最初に確かめる

## 公開について

この repo は public で、**MIT ライセンス**（著作者 GIKOU・2026-10-07）。中身はコード・CSS・テストだけで、秘密は入れない。コミットの作者は GitHub の匿名アドレス（`…@users.noreply.github.com`）にする。テストの見本データは、GIKOU Media の月次レポート第 0 号の本物の数字（出力を本物と見比べるため）。
