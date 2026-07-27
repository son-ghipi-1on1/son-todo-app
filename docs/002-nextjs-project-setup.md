# 002: Next.jsプロジェクト初期設定

## 概要

001で作成したSupabaseプロジェクトとNext.jsアプリを接続するための基盤(SDK・クライアント・型定義・環境変数)を整える。

## 関連要件

- 要件定義書 2章(技術スタック)、2.1節(環境変数)
- 要件定義書 8.2節(ディレクトリ構成案)

## 依存

- 001(SupabaseプロジェクトのURL・anon keyが必要)

## 見積

0.5〜1時間

## タスク

- [ ] `@supabase/supabase-js` を依存関係に追加する
- [ ] `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定する(`.gitignore` 済みであることを確認)
- [ ] `lib/supabase.ts` にSupabaseクライアントを作成する
- [ ] `lib/types.ts` に `Todo` 型(`todos` テーブルの型)を定義する
- [ ] `npm run dev` でアプリが起動し、`lib/supabase.ts` 経由でSupabaseに疎通確認できることを確認する

## 実装メモ

- ディレクトリ構成は `CLAUDE.md` の「想定ディレクトリ構成」に従う(`app/actions.ts`、`app/components/`、`lib/supabase.ts`、`lib/types.ts`)。
- 環境変数はどちらも `NEXT_PUBLIC_` prefix で意図的にクライアント露出させる(Service Role Keyは使わない)。`CLAUDE.md` の「環境変数」節を参照。
- Supabaseクライアントの生成・`process.env` の参照は `lib/supabase.ts` に閉じ込め、他のコンポーネントから直接 `process.env` を読まない(`CLAUDE.md` の「App Router ベストプラクティス > その他」節)。

## 完了条件

- `npm run dev` / `npm run build` / `npm run lint` がエラーなく通る
- `lib/supabase.ts` から `todos` テーブルへのSELECTがコンソール等で疎通確認できる
