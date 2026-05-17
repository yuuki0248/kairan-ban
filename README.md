# 回覧板アプリ

マンション管理組合向けの回覧板 Web アプリ。LINE LIFF で動作し、お知らせ・アンケート・問い合わせ機能を提供します。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 18 / TypeScript / Vite / Tailwind CSS |
| バックエンド | Hono / Node.js / TypeScript |
| データベース | Supabase (PostgreSQL) |
| 認証 | LINE LIFF（`x-line-user-id` ヘッダーによる認証） |
| 通知 | LINE Messaging API（Multicast Push） |
| フロントエンドホスティング | Vercel |
| バックエンドホスティング | Render |

## 機能一覧

### 住民向け
- **お知らせ閲覧** — 一覧・詳細表示、既読登録
- **アンケート回答** — 選択肢形式の回答（1人1回）
- **問い合わせ送信** — 転居連絡・駐車場申請などをカテゴリ付きで送信

### 役員（管理者）向け
- **お知らせ投稿** — 本文・カテゴリ・画像URLを設定して投稿、全住民へ LINE プッシュ通知
- **既読状況確認** — 投稿ごとの既読者・未読者一覧
- **アンケート作成** — 設問・選択肢を自由に設定
- **アンケート集計** — 選択肢ごとの投票数・割合をバーグラフで表示
- **問い合わせ管理** — 一覧閲覧、ステータス更新（未対応 → 対応中 → 完了）

## ディレクトリ構成

```
kairan-ban/
├── frontend/               # Vite + React アプリ
│   └── src/
│       ├── components/     # PostCard / PostForm / SurveyForm / SurveyAnswerForm / InquiryForm
│       ├── hooks/          # useLiff / useUser
│       ├── lib/            # api.ts / supabase.ts
│       └── pages/          # Home / Detail / Admin / SurveyList / SurveyDetail
│                           # InquiryPage / AdminSurveys / AdminInquiries
├── backend/                # Hono サーバー
│   └── src/
│       ├── lib/            # supabase.ts / line.ts
│       ├── middleware/     # auth.ts（authMiddleware / adminMiddleware）
│       └── routes/         # posts / reads / users / surveys / inquiries
└── supabase/
    └── schema.sql          # テーブル定義
```

## データベース構成

| テーブル | 概要 |
|---|---|
| `users` | LINE ユーザー情報、管理者フラグ |
| `posts` | お知らせ本文・カテゴリ |
| `reads` | 既読記録（post_id × user_id） |
| `surveys` | アンケート（questions は JSONB） |
| `survey_answers` | 回答（answers は JSONB、1人1回を UNIQUE 制約で保証） |
| `inquiries` | 問い合わせ（status: pending / in_progress / done） |

## 環境変数

### フロントエンド（`frontend/.env`）

```env
VITE_LIFF_ID=                   # LINE Developers の LIFF ID（例: 1234567890-AbCdEfGh）
VITE_SUPABASE_URL=               # Supabase プロジェクト URL
VITE_SUPABASE_ANON_KEY=          # Supabase anon キー
VITE_API_BASE_URL=               # バックエンド URL（例: https://xxx.onrender.com）
```

### バックエンド（`backend/.env`）

```env
SUPABASE_URL=                    # Supabase プロジェクト URL
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service_role キー（RLS バイパス用）
LINE_CHANNEL_ACCESS_TOKEN=       # LINE Messaging API チャンネルアクセストークン
PORT=3000
```

## ローカル起動

### 前提

- Node.js 18 以上
- Supabase プロジェクト作成済み
- LINE Developers にて LIFF アプリ・Messaging API チャンネル作成済み

### 手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/yuuki0248/kairan-ban.git
cd kairan-ban

# 2. バックエンド起動
cd backend
cp .env.example .env   # .env を編集して各値を設定
npm install
npm run dev            # http://localhost:3000 で起動

# 3. フロントエンド起動（別ターミナル）
cd frontend
cp .env.example .env   # .env を編集して各値を設定
npm install
npm run dev            # http://localhost:5173 で起動
```

### Supabase セットアップ

Supabase ダッシュボードの **SQL Editor** で `supabase/schema.sql` を実行してテーブルを作成してください。

## デプロイ

### フロントエンド（Vercel）

1. GitHub リポジトリをインポート
2. **Root Directory** を `frontend` に設定
3. 環境変数（`VITE_*`）を設定して Deploy

### バックエンド（Render）

1. **Web Service** として GitHub リポジトリを接続
2. 以下を設定:

   | 項目 | 値 |
   |---|---|
   | Root Directory | `backend` |
   | Build Command | `npm install && npm run build` |
   | Start Command | `node dist/index.js` |

3. 環境変数（`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `LINE_CHANNEL_ACCESS_TOKEN`）を設定

## API エンドポイント

| メソッド | パス | 権限 | 内容 |
|---|---|---|---|
| GET | `/api/posts` | 全員 | お知らせ一覧（既読状態・既読数付き） |
| POST | `/api/posts` | 管理者 | お知らせ投稿（LINE 通知付き） |
| GET | `/api/posts/:id` | 全員 | お知らせ詳細 |
| POST | `/api/reads` | 全員 | 既読登録 |
| GET | `/api/reads/:postId` | 管理者 | 既読/未読ユーザー一覧 |
| GET | `/api/users/me` | 全員 | 自分のユーザー情報 |
| POST | `/api/users/sync` | 不要 | LINEプロフィールを DB に upsert |
| GET | `/api/surveys` | 全員 | アンケート一覧（回答済み状態付き） |
| POST | `/api/surveys` | 管理者 | アンケート作成 |
| GET | `/api/surveys/:id` | 全員 | アンケート詳細＋自分の回答 |
| POST | `/api/surveys/:id/answers` | 全員 | 回答送信 |
| GET | `/api/surveys/:id/results` | 管理者 | 集計結果 |
| GET | `/api/inquiries` | 管理者 | 問い合わせ一覧 |
| POST | `/api/inquiries` | 全員 | 問い合わせ送信 |
| PATCH | `/api/inquiries/:id/status` | 管理者 | ステータス更新 |
