# SHFM Backend

このプロジェクトは、SHFMのバックエンドAPIを提供するAWS SAMアプリケーションです。

## 必要条件

- Node.js 18.x
- AWS SAM CLI
- Docker
- AWS CLI

## セットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. TypeScriptのビルド:
```bash
npm run build
```

3. ローカルDynamoDBの起動:
```bash
docker-compose up -d
```
これにより、DynamoDBコンテナが起動し、`shfm-network`というDockerネットワークが作成されます。このネットワークは、Lambda関数とDynamoDBの通信に使用されます。

4. ローカルDynamoDBテーブルの作成:
```bash
npm run setup-local-db
```

## ローカルでのテスト

### 環境変数の設定

`env.json`ファイルに、ローカル開発用の環境変数が設定されています：

```json
{
  "Parameters": {
    "Stage": "local"
  },
  "CreateTagFunction": {
    "TAGS_TABLE": "shfm-tags-local",
    "IS_OFFLINE": "true",
    "AWS_ACCESS_KEY_ID": "DEFAULT_ACCESS_KEY",
    "AWS_SECRET_ACCESS_KEY": "DEFAULT_SECRET",
    "AWS_REGION": "localhost",
    "DYNAMODB_ENDPOINT": "http://shfm-dynamodb-local:8000"
  }
  // 他の関数も同様の設定
}
```

### API Gatewayのテスト

1. APIのローカル起動:
```bash
sam local start-api --env-vars env.json --docker-network shfm-network
```

2. APIエンドポイントのテスト:

#### タグ機能

- タグの作成:
```bash
curl -X POST http://127.0.0.1:3000/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: test-user-id" \
  -d '{"name":"食費","color":"#FF0000"}'
```

- タグの一覧取得:
```bash
curl -X GET http://127.0.0.1:3000/tags \
  -H "Authorization: test-user-id"
```

- タグの更新:
```bash
curl -X PUT http://127.0.0.1:3000/tags/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: test-user-id" \
  -d '{"id":"{id}","name":"食費（更新）","color":"#00FF00"}'
```

- タグの削除:
```bash
curl -X DELETE http://127.0.0.1:3000/tags/{id} \
  -H "Authorization: test-user-id"
```

#### トランザクション機能

- トランザクションの作成:
```bash
curl -X POST http://127.0.0.1:3000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: test-user-id" \
  -d '{"amount":1000,"description":"スーパーでの買い物","date":"2024-03-16","type":"EXPENSE","tagIds":["タグのID"]}'
```

- トランザクションの一覧取得:
```bash
curl -X GET "http://127.0.0.1:3000/transactions?startDate=2024-03-01&endDate=2024-03-31" \
  -H "Authorization: test-user-id"
```

- トランザクションの更新:
```bash
curl -X PUT http://127.0.0.1:3000/transactions/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: test-user-id" \
  -d '{"id":"{id}","amount":1200,"description":"スーパーでの買い物（更新）","date":"2024-03-16","type":"EXPENSE","tagIds":["タグのID"]}'
```

- トランザクションの削除:
```bash
curl -X DELETE http://127.0.0.1:3000/transactions/{id} \
  -H "Authorization: test-user-id"
```

### 注意事項

1. APIテスト時の認証について:
   - ローカルテストでは、`Authorization`ヘッダーに任意のユーザーIDを指定できます
   - このユーザーIDは`requestContext.authorizer.claims.sub`として Lambda 関数に渡されます
   - 本番環境では、Cognito User Poolによる適切な認証が必要です

2. エラーレスポンス:
   - 400: バリデーションエラー
   - 401: 認証エラー
   - 403: 権限エラー（他のユーザーのリソースにアクセスしようとした場合）
   - 404: リソースが見つからない
   - 500: サーバーエラー

### トラブルシューティング

1. `shfm-network`が見つからないエラーが発生した場合：
   ```bash
   # 既存のコンテナとネットワークを削除
   docker-compose down
   
   # コンテナとネットワークを再作成
   docker-compose up -d
   ```

2. Docker Composeの警告が表示される場合：
   - `version`属性に関する警告は無視して問題ありません
   - `shfm-network`に関する警告が表示される場合は、既存のネットワークが残っている可能性があります。以下のコマンドで解決できます：
     ```bash
     # 既存のネットワークを確認
     docker network ls
     
     # 既存のshfm-networkを削除（必要な場合）
     docker network rm shfm-network
     
     # Docker Composeで再作成
     docker-compose up -d
     ``` 