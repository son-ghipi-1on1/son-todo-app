# 001: Supabaseプロジェクト作成・テーブル/RLS設定

## 概要

Todoアプリのバックエンドとなる Supabase プロジェクトを作成し、`todos` テーブル・自動更新トリガー・RLSポリシーをセットアップする。すべてのアプリ実装(002以降)の前提となる。

## 関連要件

- 要件定義書 5章(データモデル)
- 要件定義書 6章(セキュリティ方針)

## 見積

0.5〜1時間

## タスク

- [ ] Supabaseプロジェクトを新規作成する(無料プラン)
- [ ] SQL Editorで `todos` テーブルを作成する
- [ ] `updated_at` 自動更新トリガー(`set_updated_at` 関数 + `todos_set_updated_at` トリガー)を作成する
- [ ] `todos (is_done, due_date)` の複合インデックスを作成する
- [ ] RLSを有効化し、`anon` ロールへの全許可ポリシーを作成する
- [ ] プロジェクトの URL と anon key を控える(002で環境変数として使用)

## 実装メモ

DDL・トリガー・RLSポリシーはすべて `CLAUDE.md` の「データモデル」「セキュリティ — RLSは意図的に全開放」節にSQLそのまま記載済みなので、そこからコピーして実行する。

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

alter table todos enable row level security;

create policy "allow anon full access"
  on todos for all to anon
  using (true) with check (true);
```

**重要**: RLSは無効化せず、上記の通り有効なまま `anon` に明示的な全許可ポリシーを与えること(理由は `CLAUDE.md` 参照)。Service Role Keyはこのプロジェクトでは使用しない。

## 完了条件

- Supabase ダッシュボードで `todos` テーブル・トリガー・RLSポリシーが存在することを確認できる
- SQL Editorから手動で行を insert / update / delete でき、`updated_at` がトリガーで自動更新されることを確認できる
- URL と anon key を控えている(002で使用)
