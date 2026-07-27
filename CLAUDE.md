# CLAUDE.md

このファイルは、このリポジトリで作業する Claude Code (claude.ai/code) 向けのガイドです。

@AGENTS.md

## ⚠️ よく知っているNext.jsとは別物

このプロジェクトは **Next.js 16.2.12** と **React 19.2** を使用しており、学習データより新しく、Next.js 14/15 から実質的な破壊的変更が入っている。**App Routerのコード、データ取得ロジック、キャッシュロジック、画像設定、`middleware`/`proxy` ファイルを書く前に、必ず `node_modules/next/dist/docs/01-app/` 配下の該当ドキュメントを読むこと** — 記憶にあるNext.jsのAPIを当てにしない。事前に押さえておくべき主な違いは以下の通り。

- **非同期リクエストAPIは完全非同期になり、同期フォールバックは存在しない。** `cookies()`、`headers()`、`draftMode()`、および `page.tsx`/`layout.tsx`/`route.ts` の `params`/`searchParams` はすべて `await` する必要がある。
- **`middleware.ts` は `proxy.ts` にリネームされた。** エクスポートする関数名も `middleware` ではなく `proxy` にする。proxyのランタイムは常に `nodejs`(`edge` ランタイムのオプションはない)。
- **Turbopackが `next dev` / `next build` 双方のデフォルトバンドラー**になった(`--turbopack` フラグ不要)。`next.config.ts` にカスタムWebpack設定があると、`--webpack` を指定するか設定をトップレベルの `turbopack` キー(`experimental.turbopack` ではない)に移さない限り `next build` が失敗する。
- **`next dev` と `next build` の出力先ディレクトリが分離**された — dev の出力先は `.next/dev`(`tsconfig.json` の `.next/dev/types` エントリを参照)で、dev と build の同時実行が可能になった。
- **キャッシュ系APIが変更**: `revalidateTag(tag)` は第2引数に `cacheLife` プロファイルが必須になった(例: `revalidateTag('posts', 'max')`)。`next/cache` に新しい `updateTag()`(read-your-writes、Server Actions専用)と `refresh()`(Server Actionからクライアントルーターを更新)が追加された。`cacheLife`/`cacheTag` は安定版になり `unstable_` prefix は不要。PPRは廃止され、代わりに `cacheComponents` 設定フラグを使う。`experimental.dynamicIO`/`experimental.useCache` も非推奨で `cacheComponents` に置き換え。
- **`next lint` は削除された。** ESLint CLIを直接使ってlintする(下記Commands参照)。ESLint設定はflat config形式(`eslint.config.mjs`)で `.eslintrc` ではない。
- **`next/image` のデフォルト値が変更**: `minimumCacheTTL` のデフォルトが4時間(以前は60秒)、`qualities` のデフォルトは `[75]` のみ、クエリ文字列付きのローカル画像には `images.localPatterns[].search` の設定が必要、`images.domains` は非推奨で `images.remotePatterns` を使う。
- **parallel routeのスロットは `default.js` が必須**になった — `@slot` のparallel routeを追加する場合、`default.js` がないとビルドが失敗する。
- ドキュメント一式は `node_modules/next/dist/docs/01-app/`(getting-startedガイド、guides/、api-reference/)にある。破壊的変更の一覧は `01-app/02-guides/upgrading/version-16.md` を参照。

## コマンド

```bash
npm run dev      # 開発サーバー起動(Turbopack、出力先は .next/dev)
npm run build    # 本番ビルド(デフォルトでTurbopack)
npm run start    # 本番サーバー起動(事前にbuildが必要)
npm run lint     # eslint(flat config、eslint.config.mjs)
```

現時点でこのプロジェクトにテストランナーは設定されていない。

## アーキテクチャ

現状は `create-next-app` で生成したままの構成(App Router、TypeScript、Tailwind CSS v4)で、`app/page.tsx` はデフォルトのランディングページのまま。下記のMVP仕様(2026-07-26付の要件定義書に基づく)はまだ実装されていない。

- **App Router**(`app/` 配下): `app/layout.tsx` がルートレイアウト(`next/font/google` でGeistフォントを読み込み、グローバルmetadataを設定)、`app/page.tsx` がホームルート。
- **スタイリング**: Tailwind CSS v4。`app/globals.css` 内の `@import "tailwindcss"` と `@theme` ブロック(色・フォント用のCSSカスタムプロパティ)のみで完結しており、`tailwind.config.js`/`.ts` は存在しない。
- **パスエイリアス**: `@/*` はプロジェクトルートを指す(`tsconfig.json` 参照)。例: `@/app/...`。
- **TypeScript**: strictモード有効、moduleResolutionは `bundler`。Next.jsが生成するルート型のため `.next/dev/types` と `.next/types` をincludeしている。

## App Router ベストプラクティス

一般論としての「良いNext.jsの書き方」ではなく、`node_modules/next/dist/docs/` にあるこのバージョン(16.2.12)のドキュメントが推奨するパターンに従うこと。実装前に該当ページを読むこと。

### Server Components / Client Components

- デフォルトはServer Component。`'use client'` は状態・イベントハンドラ・ブラウザAPIが必要な**末端の**コンポーネントにのみ付ける(例: `TodoItem` のインライン編集部分、`TodoForm`、タブ切り替えのインタラクション部分)。ページ全体やレイアウトをまるごとClient Component化しない。
- `'use client'` を付けたファイルは、そのモジュールグラフ全体(import先・直接レンダーするコンポーネント)がクライアントバンドルに含まれる。Server Componentを `children` として渡す形(Composition)であれば、Client Componentの中にServer Componentを“挟む”ことができ、その部分はクライアントバンドルに含まれない。
- Context Providerが必要になった場合は、`children` だけを包むClient Componentとして作る。`<html>` やレイアウト全体を包まない。
- 参照: `01-app/01-getting-started/05-server-and-client-components.md`

### データ取得

- 一覧取得はServer Component(`app/page.tsx`)からSupabaseを直接呼ぶ(8.1節の方針通り)。クエリ関数は `lib/supabase.ts` に集約し、`page.tsx` にクエリを直書きしない。
- 複数の独立したデータ取得を行う場合、`await` を直列に並べると逐次実行になり遅くなる。並列化したい場合は先に呼び出してから `Promise.all` でまとめて待つ。本MVPは `todos` テーブル1本の単純なクエリのみなので通常は該当しない。
- 参照: `01-app/01-getting-started/06-fetching-data.md`

### Server Actions(`app/actions.ts`)

- Server Actionsは誰でも直接POSTできる公開エンドポイントとして扱う。UI上でフォームが見えるかどうかはセキュリティ境界にならないため、**Action内で必ず入力値を検証する**(タイトル1〜200文字、空白のみは拒否、など)。クライアント側の検証だけで済ませない。
- クライアントからは「対象のID」と「変更内容」だけを送らせる設計にし、行の全内容をクライアントの入力からそのまま信頼しない(例: `created_at` を更新時に受け取ったfromDataの値で上書きしない。DB側のトリガーやデフォルト値に任せる)。
- クライアント側から複数のServer Actionsを `Promise.all` などで並列実行しない。Next.jsはクライアントごとにActionsを1つずつ直列でディスパッチする。
- 想定外のエラー(DB接続断など)は `throw` して `error.tsx` に処理を任せてよいが、バリデーションエラーのような「起こりうるエラー」は `throw` せず戻り値としてモデル化し、`useActionState` で受け取ってフォームにエラーメッセージを表示する(F-01のタイトル未入力チェックなどに使う)。
- 参照: `01-app/02-guides/server-actions.md`, `01-app/01-getting-started/10-error-handling.md`

### キャッシュ更新

- 本MVPの更新は要件通り `revalidatePath('/')` を使う(単一画面・単一テーブルのみのため十分)。`revalidateTag`/`updateTag` はタグ付きキャッシュを使うより複雑な構成向けなので、要件が増えない限り導入しない。
- 完了トグルのみ `useOptimistic` で即時にUIを反映し、サーバー確定後に実データへ置き換える(他の作成・編集・削除はサーバー応答を待つ、という要件定義書の方針と一致)。
- 参照: `01-app/02-guides/server-actions.md`(Choosing a cache update)

### エラー・ローディングUI

- 通信エラー(7.3節)は `app/error.tsx`(`'use client'` 必須のClient Component)で捕捉し、再試行ボタンを表示する。
- 読み込み中のスケルトンUI(7.3節)は `app/loading.tsx`、またはリスト部分を `<Suspense>` で囲んで実装する。
- 参照: `01-app/01-getting-started/10-error-handling.md`, `01-app/01-getting-started/06-fetching-data.md`

### その他

- `params`/`searchParams` を扱う場合は必ず `await` する(冒頭の「よく知っているNext.jsとは別物」節を参照)。本MVPは単一画面でルートパラメータを持たないため、通常は該当しない。
- 環境変数(Supabaseの URL/Anon Key)はSupabaseクライアントを生成する `lib/supabase.ts` に閉じ込め、各コンポーネントから直接 `process.env` を参照しない。

## プロダクト: Todo App MVP

シングルユーザー・単一画面(`/`)のTodoアプリ。認証なし、マルチユーザー対応なし。構成は Next.js(App Router、RSC)+ Supabase(Postgres)+ Vercel、スタイリングはTailwind。目的は機能を絞り込み、最短で「毎日使える状態」に到達すること。

### 想定ディレクトリ構成

```
app/
  page.tsx              # 一覧画面(Server Component)
  actions.ts            # Server Actions: 作成 / 更新 / 削除 / 完了トグル
  components/
    TodoList.tsx
    TodoItem.tsx         # インライン編集を含む、Client Component
    TodoForm.tsx         # 新規追加フォーム、Client Component
    TabSwitcher.tsx       # 未完了 / 完了済み タブ(件数バッジ付き)
    SortSelect.tsx
lib/
  supabase.ts            # Supabaseクライアント
  types.ts                # 共通型定義
```

### データフロー

- **読み取り**: Server ComponentsからSupabaseを直接呼び出す(一覧表示にクライアント側フェッチは使わない)。
- **書き込み**: `app/actions.ts` のServer Actionsで実行し、`revalidatePath('/')` で再描画する。
- **楽観的UI**: 完了/未完了トグルのみ `useOptimistic` を使う — 作成・編集・削除など他の更新はサーバー応答を待つ。
- **バリデーション**: タイトルは必須、1〜200文字、空白のみは不可。クライアント側だけでなくServer Actions側でも必ず検証すること — Server ActionsはPOSTで直接叩けるため、クライアント側のみの検証は迂回される。

### データモデル — `todos` テーブル

| カラム | 型 | 制約 | 備考 |
| --- | --- | --- | --- |
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `title` | `text` | NOT NULL, 1〜200文字 | `check (char_length(title) between 1 and 200)` |
| `is_done` | `boolean` | NOT NULL, default `false` | |
| `due_date` | `date` | NULL許容 | 時刻は保持しない(タイムゾーン起因の不具合を避けるため) |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | トリガーで自動更新。アプリコードから手動で設定しないこと |

```sql
create table todos (
  id         uuid primary key default gen_random_uuid(),
  title      text not null check (char_length(title) between 1 and 200),
  is_done    boolean not null default false,
  due_date   date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index todos_status_due_idx on todos (is_done, due_date);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger todos_set_updated_at
  before update on todos
  for each row execute function set_updated_at();
```

削除は**物理削除**(`delete`)で、MVPではソフトデリート・ゴミ箱は実装しない。削除前の確認ダイアログもなし — ホバー時に表示される削除ボタンから即時実行する。

### 並び替え(F-07)

| 選択肢 | ソート条件 | デフォルト |
| --- | --- | --- |
| 期限が近い順 | `due_date ASC NULLS LAST, created_at DESC` | ○ |
| 作成が新しい順 | `created_at DESC` | |

期限なしのタスクは常に末尾に配置される。MVPでは手動ドラッグ&ドロップ並び替えは対象外。

### 環境変数

| 変数名 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトのURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabaseの匿名キー |

いずれも意図的にクライアントへ露出させる(`NEXT_PUBLIC_` prefix)。**このMVPではService Role Keyを絶対に使用しない** — すべてのアクセスは `anon` ロール経由で行う。

### セキュリティ — RLSは意図的に全開放

RLSは**無効化せず有効なまま**、`anon` ロールに対して明示的な全許可ポリシーを設定する。

```sql
alter table todos enable row level security;

create policy "allow anon full access"
  on todos for all to anon
  using (true) with check (true);
```

これは見落としではなく意図的なMVP上のトレードオフである。認証がなく、anonキーはブラウザバンドルに公開されるため、デプロイ先のURLを知る第三者は誰でも全タスクの閲覧・作成・編集・削除が可能である。**タスクのタイトルに機密情報・個人情報・業務上の秘密を含めないこと。** また、指示なくRLSを無効化したり勝手に認証を追加したりして「修正」しないこと — 保護が必要になった場合は下記の移行手順に従う。

**データ保護が必要になった場合の移行手順**(MVPスコープ外。明示的に依頼された場合のみ対応):
1. SupabaseダッシュボードでAnonymous Sign-insを有効化する
2. `todos` テーブルに `user_id uuid not null default auth.uid()` を追加する
3. RLSポリシーを `using (auth.uid() = user_id)` に差し替える

### 押さえておくべき機能挙動

- **F-03 完了トグル**: チェックボックスクリックで即座に楽観的に反転する。完了にすると即座に未完了タブから消え、完了済みタブに表示される。
- **F-04 インライン編集**: タイトルをクリックするとインライン編集モードになる。Enterで確定、Escapeでキャンセル、フォーカスが外れると確定。期限日は日付ピッカーで変更し、クリアして未設定にもできる。
- **期限日の視覚表現**: 期限切れ = 赤色 + 警告アイコン、本日が期限 = オレンジ色、3日以内 = 通常色(太字)、それ以降 = 通常色、期限なし = グレーで「期限なし」。
- **空/読み込み中/エラー状態**: 読み込み中はスケルトンUI。未完了タブ0件と完了済みタブ0件では異なる空状態メッセージを表示。通信エラー時は再試行ボタンを表示する。
- キーボード操作は必須要件: タスクの追加・完了・削除はすべてマウスなしで完結できること。

### このMVPで明示的にスコープ外のもの

以下はユーザーから依頼がない限り実装しないこと: ユーザー認証・アカウント管理、タグ/カテゴリ、検索・フィルタ、ドラッグ&ドロップによる並び替え、サブタスク、繰り返しタスク、リマインダー・通知、複数端末間の同期、削除の取り消し・ゴミ箱、ダークモード、データのインポート/エクスポート。
