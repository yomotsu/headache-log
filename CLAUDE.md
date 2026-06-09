@AGENTS.md

# headache-log プロジェクト

頭痛の痛さ（0〜5段階）をワンタップで記録するWebアプリ。痛みが治まったら0を押すことで終了時刻も記録できる。

## Tech Stack

- **Next.js 16** (App Router, `src/` ディレクトリ構成)
- **Supabase** (Auth + Postgres + RLS)
- **Tailwind CSS 4**
- **@opennextjs/cloudflare v1.19.11** → Cloudflare Workers にデプロイ済み
- **wrangler v4.98.0**

## ディレクトリ構成

```
src/
├── middleware.ts              # 認証ガード（Edge互換、@supabase/ssr 非使用）
├── app/
│   ├── layout.tsx             # PWA設定（appleWebApp, themeColor #0d0d0d）
│   ├── page.tsx               # / → /log or /login にリダイレクト
│   ├── icon.svg               # favicon + OGP アイコン
│   ├── apple-icon.png         # 180×180 ホーム画面アイコン
│   ├── favicon.ico            # 32×32
│   ├── (auth)/login/          # ログインページ
│   ├── (auth)/signup/         # サインアップページ
│   ├── (app)/layout.tsx       # アプリシェル（ナビ）
│   ├── (app)/log/             # メイン画面（痛さボタン）
│   ├── (app)/history/         # 履歴一覧
│   ├── (app)/history/[id]/    # 詳細 + メモ編集 + 痛み度修正 + 削除
│   ├── (app)/calendar/        # カレンダー（日ごとの最大痛み表示）
│   ├── auth/callback/         # Supabase PKCEコールバック
│   └── api/logs/              # POST（作成）/ [id] PATCH（メモ更新）/ [id] DELETE
├── components/
│   ├── PainLevelPad.tsx       # 0〜5ボタン 3×2グリッド
│   ├── PainLevelPadWrapper.tsx # クライアント側GPS取得ラッパー
│   ├── PainLevelEditor.tsx    # 痛み度修正コンポーネント
│   ├── LogEntry.tsx           # 履歴カード
│   ├── DayGroup.tsx           # 日付ヘッダー + LogEntryグループ
│   ├── MemoEditor.tsx         # インラインメモ編集
│   ├── DeleteButton.tsx       # 削除ボタン + モーダル確認
│   ├── CalendarView.tsx       # カレンダーUI（クライアントコンポーネント）
│   ├── AuthForm.tsx           # Google OAuth + メール/パスワード
│   └── LogoutButton.tsx       # ログアウトボタン
└── lib/
    ├── supabase/client.ts     # createBrowserClient（maxAge 400日）
    ├── supabase/server.ts     # createServerClient（cookies）
    ├── types.ts               # Log 型
    └── utils.ts               # formatDate, painLevelColor, painLevelDescription 等
```

## データベース

`supabase/migrations/0001_initial.sql` に定義済み。

```sql
public.logs (
  id          uuid PRIMARY KEY,
  user_id     uuid REFERENCES auth.users,
  pain_level  smallint CHECK (0-5),  -- 0 = 治まった
  recorded_at timestamptz,
  latitude    numeric(10,7),         -- nullable
  longitude   numeric(10,7),         -- nullable
  memo        text,                  -- nullable、後から追加可
  created_at  timestamptz,
  updated_at  timestamptz            -- trigger で自動更新
)
```

RLSで自分のレコードのみ CRUD 可能。`user_id` はAPIルートのサーバー側でセッションから注入（クライアント送信なし）。

## 重要な設計上の注意

### middleware.ts は @supabase/ssr を使わない

Cloudflare Edge ランタイムで `@supabase/ssr` を import すると Node.js API の互換エラーが出る。
middleware ではクッキー名（`sb-*-auth-token`）の有無だけをチェックする簡易実装にしている。

### wrangler.toml は Workers 形式

`pages_build_output_dir`（Pages 形式）だと `wrangler deploy` が "Missing entry-point to Worker script" で失敗する。
Workers 形式（`main` + `[assets]`）を使うこと。

```toml
name = "headache-log"
main = ".open-next/worker.js"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".open-next/assets"
binding = "ASSETS"
```

### open-next.config.ts の必須フィールド

`incrementalCache`, `tagCache`, `queue` を `dummy` にし、`edgeExternals: ['node:crypto']` が必要。
middleware には `external: true` と `wrapper: 'cloudflare-edge'` が必要。

### Supabase クエリの型

`createServerClient<Database>()` のように Generic を渡すと TypeScript が戻り値を `never` 型に推論するケースがあった。
Generic は省略し、結果に `as Log | null` / `as Log[]` でキャストする。

### デプロイコマンド

```bash
pnpm deploy   # opennextjs-cloudflare build && opennextjs-cloudflare deploy
```

`NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` は Cloudflare ダッシュボードの
"Environment variables" に設定すること（ビルド時に埋め込まれる）。

## 認証

- Google OAuth（メイン）＋ メール/パスワード
- Google プロバイダーは Supabase ダッシュボード > Authentication > Providers で設定
- セッションは cookie で 400日間保持

## デザイン方針

- **ダークテーマ固定**（頭痛時に明るい画面は辛いため）
- `themeColor: '#0d0d0d'`、PWA 対応済み
- タッチターゲット 44px 以上
- pain_level ごとの配色: 0=緑系、1〜5=赤グラデーション（濃くなる）
