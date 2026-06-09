@AGENTS.md

# headache-log プロジェクト

頭痛の痛さ（0〜5段階）をワンタップで記録するWebアプリ。痛みが治まったら0を押すことで終了時刻も記録できる。

## Tech Stack

- **Next.js 16** (App Router, `src/` ディレクトリ構成)
- **Supabase** (Auth + Postgres + RLS)
- **Tailwind CSS 4**
- **@opennextjs/cloudflare v1.19.11** → Cloudflare Workers にデプロイ済み
- **wrangler v4.98.0**

## ディレクトリ構成（コンポーネント追加時は更新すること）

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
│   └── api/logs/              # POST（作成）/ [id] PATCH（memo, pain_level, recorded_at 更新）/ [id] DELETE / [id]/weather POST（天気取得・保存）
├── components/
│   ├── PainLevelPad.tsx       # 0〜5ボタン 3×2グリッド
│   ├── PainLevelPadWrapper.tsx # クライアント側GPS取得ラッパー
│   ├── PainLevelEditor.tsx    # 痛み度修正コンポーネント
│   ├── LogEntry.tsx           # 履歴カード
│   ├── DayGroup.tsx           # 日付ヘッダー + LogEntryグループ
│   ├── MemoEditor.tsx         # インラインメモ編集
│   ├── DateTimeEditor.tsx     # 日時インライン編集（編集ボタン→入力→保存）
│   ├── DeleteButton.tsx       # 削除ボタン + モーダル確認
│   ├── CalendarView.tsx       # カレンダーUI（クライアントコンポーネント）
│   ├── AuthForm.tsx           # Google OAuth + メール/パスワード
│   ├── WeatherFetcher.tsx     # 詳細ページで天気未取得時にバックグラウンド取得するクライアントコンポーネント
│   └── LogoutButton.tsx       # ログアウトボタン
└── lib/
    ├── supabase/client.ts     # createBrowserClient（maxAge 400日）
    ├── supabase/server.ts     # createServerClient（cookies）
    ├── types.ts               # Log 型
    ├── weather.ts             # Open-Meteo API ラッパー（fetchWeather）
    └── utils.ts               # formatDate, painLevelColor, painLevelDescription, weatherCodeLabel 等
```

## データベース

`supabase/migrations/0001_initial.sql` に定義済み。

```sql
public.logs (
  id           uuid PRIMARY KEY,
  user_id      uuid REFERENCES auth.users,
  pain_level   smallint CHECK (0-5),   -- 0 = 治まった
  recorded_at  timestamptz,
  latitude     numeric(10,7),          -- nullable
  longitude    numeric(10,7),          -- nullable
  memo         text,                   -- nullable、後から追加可
  timezone     text NOT NULL DEFAULT 'Asia/Tokyo',  -- 記録時のブラウザタイムゾーン
  temperature  numeric,                -- nullable（気温 °C）
  pressure     numeric,                -- nullable（気圧 hPa）
  weather_code smallint,               -- nullable（WMO天気コード）
  created_at   timestamptz,
  updated_at   timestamptz             -- trigger で自動更新
)
```

マイグレーション履歴:
- `0001_initial.sql` — テーブル作成、RLS、インデックス
- `0002_add_timezone.sql` — timezone カラム追加（NOT NULL DEFAULT 'Asia/Tokyo'）
- `0003_add_weather.sql` — temperature / pressure / weather_code カラム追加

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

### server.ts の setAll は try/catch で囲む

Server Component から `createClient()` を呼ぶと、Supabase がトークン更新時に `setAll` でクッキーを書こうとして
"Cookies can only be modified in a Server Action or Route Handler" エラーが出る。
`setAll` を try/catch で囲んで握り潰すことで解消。実際のトークン更新はミドルウェアやルートハンドラが担う。

### iOS でフォーカス時に画面が拡大する

input / textarea のフォントサイズが 16px 未満だと iOS が自動ズームする。
Tailwind では `text-base`（16px）以上を使うこと。`text-sm`（14px）は NG。

### タイムゾーンは記録時に保存する

`Intl.DateTimeFormat().resolvedOptions().timeZone` をクライアントで取得し、POST 時にサーバーへ送って保存。
`formatDate` / `formatTime` は第2引数に `log.timezone` を渡して表示する。
Cloudflare Workers はシステムタイムゾーンが UTC のため、指定なしだと JST と9時間ずれる。

### 天気は Open-Meteo API で取得する（無料・APIキー不要）

`src/lib/weather.ts` の `fetchWeather(lat, lon, recordedAt)` を呼ぶ。
- 90日以内: `https://api.open-meteo.com/v1/forecast?past_days=N`
- 91日以上: `https://archive-api.open-meteo.com/v1/archive`
- API に `timezone=UTC` を渡し、返却時刻を UTC として比較する
- 記録・日時編集時に自動取得。失敗時は null のまま
- 詳細ページ表示時に `WeatherFetcher` クライアントコンポーネントが weather=null かつ GPS ありなら再取得 → `router.refresh()`

### Tailwind v4 で動的クラスが生成されない場合

`utils.ts` など `.ts` ファイルで使う色クラスが他のファイルで未使用だと生成されないことがある。
`globals.css` に `@source inline("クラス名パターン")` を追加して強制生成する。

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
