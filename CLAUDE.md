# gikou-folio

GIKOU folio。読むための A4 の HTML を作る。共通の仕組み 3 つの 1 つで、文書の種類とテーマを差し替えて使い回す。読む順は `README.md` → `src/index.ts`。全体の形は gikou `decisions/2026-10-07-shared-systems.md`。

## 作法

- **この repo は public**。秘密（鍵・内部の URL・個人の情報）を入れない。コミットの作者は GitHub の匿名アドレス（repo の `git config user.email` に設定済み）
- 書くのは worktree の中（`~/gikou-folio-<名前>`）。`~/gikou-folio` は main のまま pull だけ
- `src/` は `node:` の機能もファイルも使わない（Cloudflare の Worker でも動かす）。破ると `test/worker.test.ts` が止める
- `src/` を直したら `pnpm build`（CSS の文字列と `dist/` を作り直す）。`src/css.ts` と `dist/` は手で直さない
- 特定の製品の文書の種類は、使う側の repo に置く。共通の部品だけをここに置く。共通化は 2 か所で同じものを書いてから
- 直したらタグを打つ（`v0.x.y`）。使う側はタグを指して読む
- CI は `.github/workflows/gikou.yml` から gikou の再利用ワークフロー
