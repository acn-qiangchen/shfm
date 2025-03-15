# SHFM (Simple Household Financial Management)

家計簿を簡単に管理するためのWebアプリケーション

## 技術スタック

### フロントエンド
- React 18.x
- TypeScript
- AWS Amplify UI
- TailwindCSS
- HeadlessUI
- React Query

### バックエンド
- AWS Lambda (Node.js 18.x)
- Amazon DynamoDB
- Amazon Cognito
- AWS API Gateway

## 開発環境のセットアップ

### 前提条件
- Node.js 18.x以上
- npm 9.x以上
- AWS CLI v2
- AWS SAM CLI
- Git

### AWS認証情報の設定

1. AWS CLIのインストール（まだの場合）
```bash
# macOS (Homebrew)
brew install awscli

# 認証情報の設定
aws configure --profile shfm
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]
# Default region name: us-east-1
# Default output format: json
```

2. AWS SAM CLIのインストール
```bash
# macOS (Homebrew)
brew install aws-sam-cli
```

### SAMデプロイ手順

1. 新しい環境へのデプロイ準備
```bash
# プロジェクトのルートディレクトリに移動
cd backend

# 依存関係のインストール
npm install

# SAMビルド
sam build

# 初回デプロイ（対話形式で設定）
sam deploy --guided --profile shfm

# 以下の設定を求められます：
# Stack Name: shfm-stack
# AWS Region: us-east-1
# Parameter Environment: dev
# Parameter ProjectName: shfm
# Confirm changes before deploy: Y
# Allow SAM CLI IAM role creation: Y
# Disable rollback: N
# Save arguments to configuration file: Y
# SAM configuration file: samconfig.toml
# SAM configuration environment: default
```

2. デプロイ後の設定値の取得
```bash
# Cognito User Pool IDの取得
aws cloudformation describe-stacks \
  --stack-name shfm-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
  --output text \
  --profile shfm

# Cognito Client IDの取得
aws cloudformation describe-stacks \
  --stack-name shfm-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
  --output text \
  --profile shfm

# API Gateway URLの取得
aws cloudformation describe-stacks \
  --stack-name shfm-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text \
  --profile shfm
```

3. フロントエンドの環境変数設定
```bash
# frontendディレクトリに移動
cd frontend

# .env.localファイルを作成
cp .env.example .env.local

# 取得した値を.env.localに設定
# VITE_APP_API_URL=<API Gateway URL>
# VITE_APP_REGION=us-east-1
# VITE_APP_USER_POOL_ID=<User Pool ID>
# VITE_APP_USER_POOL_CLIENT_ID=<Client ID>
```

4. 2回目以降のデプロイ
```bash
cd backend
sam build
sam deploy --profile shfm
```

5. スタックの削除（必要な場合）
```bash
sam delete --stack-name shfm-stack --profile shfm
```

注意事項：
- デプロイ前に、AWSアカウントの利用制限と料金を確認してください
- 開発環境と本番環境で異なるスタック名を使用することを推奨します
- 機密情報（APIキーなど）は必ずAWS Systems Manager Parameter StoreやAWS Secrets Managerで管理してください
- デプロイ後はCloudFormationコンソールでスタックの状態を確認してください

### ローカル開発環境のセットアップ

1. リポジトリのクローン
```bash
git clone [repository-url]
cd shfm
```

2. フロントエンド開発環境のセットアップ
```bash
cd frontend
npm install
cp .env.example .env.local  # 環境変数ファイルをコピー
# .env.localファイルを編集して必要な環境変数を設定

npm run dev  # 開発サーバーの起動
```

3. バックエンド開発環境のセットアップ
```bash
cd backend
npm install
cp .env.example .env  # 環境変数ファイルをコピー
# .envファイルを編集して必要な環境変数を設定

# DynamoDBローカルの起動（開発時）
docker-compose up -d

# Lambda関数のローカル実行
sam local start-api
```

## デプロイ

### インフラストラクチャのデプロイ

```bash
cd backend
sam build
sam deploy --guided  # 初回デプロイ時
sam deploy  # 2回目以降
```

### フロントエンドのデプロイ

GitHub Actionsによって自動的にデプロイされます。
`main`ブランチにマージされると、自動的にAWS Amplifyにデプロイされます。

## 開発ワークフロー

1. 新機能の開発
```bash
git checkout -b feature/[feature-name]
# 開発作業
git add .
git commit -m "feat: 変更内容の説明"
git push origin feature/[feature-name]
```

2. Pull Requestの作成
- GitHubでPull Requestを作成
- レビュー依頼
- 承認後、マージ

## 環境変数

### フロントエンド (.env.local)
```
REACT_APP_API_URL=http://localhost:3000
REACT_APP_REGION=us-east-1
REACT_APP_USER_POOL_ID=your-user-pool-id
REACT_APP_USER_POOL_CLIENT_ID=your-client-id
```

### バックエンド (.env)
```
AWS_REGION=us-east-1
DYNAMODB_TABLE_PREFIX=shfm
STAGE=dev
```

## テスト

### フロントエンド
```bash
cd frontend
npm test  # ユニットテストの実行
npm run test:e2e  # E2Eテストの実行
```

### バックエンド
```bash
cd backend
npm test  # ユニットテストの実行
npm run test:integration  # 統合テストの実行
```

## ディレクトリ構造

```
.
├── frontend/
│   ├── src/
│   │   ├── components/    # 再利用可能なUIコンポーネント
│   │   ├── features/      # 機能モジュール
│   │   ├── hooks/         # カスタムフック
│   │   ├── api/          # API通信
│   │   ├── types/        # 型定義
│   │   └── utils/        # ユーティリティ関数
│   └── public/
│
└── backend/
    ├── src/
    │   ├── functions/     # Lambda関数
    │   ├── lib/          # 共通ライブラリ
    │   └── types/        # 共有型定義
    └── template.yaml      # SAMテンプレート
```

## ライセンス

MIT 