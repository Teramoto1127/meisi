# meisi

作成から名刺交換までアプリ内で完結する電子名刺サービスです。

## 主な機能

- **名刺の作成・編集**: 氏名・会社名・役職・連絡先・自己紹介・プロフィール画像などを登録
- **名刺の公開ページ**: `/card/[名刺ID]` で誰でも閲覧できる名刺ページを自動生成
- **QRコードでの名刺交換**: 自分の名刺QRコードを表示し、相手はアプリ内カメラで読み取って交換
- **招待リンクでの名刺交換**: 公開ページのURLを共有し、ボタン一つで交換
- **名刺IDでの検索交換**: 相手の名刺IDを入力して交換
- **交換履歴一覧**: これまでに交換した名刺をまとめて確認

## 技術スタック

- [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (認証 / PostgreSQL / Storage)
- [qrcode.react](https://github.com/zpao/qrcode.react) / [html5-qrcode](https://github.com/mebjas/html5-qrcode)

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. Supabaseプロジェクトを作成

1. [Supabase](https://supabase.com/) でプロジェクトを新規作成します。
2. `supabase/schema.sql` の内容を Supabase の SQL Editor にコピーして実行し、テーブル・RLSポリシー・トリガー・ストレージバケットを作成します。
3. Project Settings > API から `Project URL` と `anon public` キーを取得します。
4. Authentication > Email のメール確認設定はお好みで調整してください(開発中はオフにすると動作確認がスムーズです)。

### 3. 環境変数を設定

`.env.example` をコピーして `.env.local` を作成し、取得したURLとキーを設定します。

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 開発サーバーを起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開くと確認できます。

## ディレクトリ構成(抜粋)

```
src/
  app/
    signup/, login/           サインアップ・ログイン
    dashboard/                マイページ(名刺編集・QR表示への導線)
    dashboard/edit/           名刺編集フォーム
    dashboard/qr/             自分の名刺QRコード表示
    card/[username]/          名刺の公開ページ
    scan/                     QRコードスキャン
    exchange/                 名刺交換の確認・実行
    connections/              交換した名刺の一覧
    connections/search/       名刺IDでの検索交換
    api/exchange/             名刺交換API(双方向にconnectionsを作成)
  components/                 CardPreview, CardForm, QrCodeCard など
  lib/supabase/               Supabaseクライアント(ブラウザ/サーバー/middleware)
  types/card.ts                Profile / Connection / Database型定義
supabase/schema.sql            DBスキーマ・RLS・トリガー・ストレージ設定
```

## 開発時の注意

- このリポジトリでは機能追加ごとに `feature/*` ブランチを切り、コミット後に `main` へマージする運用にしています。
