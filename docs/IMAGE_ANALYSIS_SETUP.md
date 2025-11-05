# 画像解析機能のセットアップガイド

## 📷 概要

画像解析機能を使用すると、麻雀アプリのスクリーンショットをアップロードするだけで、自動的にスコアを抽出してスプレッドシートに記録できます。

**使用技術:**
- Google Cloud Vision API（OCR・テキスト抽出）
- OpenAI API（gpt-4o-mini）（構造化データ解析）

---

## 🔑 必要なAPIキー

### 1. Google Cloud Vision API

**手順:**

1. **Google Cloud Consoleにアクセス**
   - https://console.cloud.google.com/ にアクセス
   - プロジェクトを作成または選択

2. **Vision APIを有効化**
   - 左メニュー → 「APIとサービス」 → 「ライブラリ」
   - 「Cloud Vision API」を検索
   - 「有効にする」をクリック

3. **APIキーを作成**
   - 左メニュー → 「APIとサービス」 → 「認証情報」
   - 「認証情報を作成」 → 「APIキー」を選択
   - 生成されたAPIキーをコピー

4. **APIキーを制限（推奨）**
   - 生成されたAPIキーの右側の編集アイコンをクリック
   - 「APIの制限」 → 「キーを制限」を選択
   - 「Cloud Vision API」のみを選択
   - 「保存」をクリック

**料金:**
- 月間1,000リクエストまで無料
- 以降は1,000リクエストごとに$1.50
- 詳細: https://cloud.google.com/vision/pricing

---

### 2. OpenAI API

**手順:**

1. **OpenAI Platformにアクセス**
   - https://platform.openai.com/ にアクセス
   - サインアップまたはログイン

2. **APIキーを作成**
   - 右上のアカウントアイコン → 「API keys」
   - 「Create new secret key」をクリック
   - キー名を入力（例: "Mahjong Score Tracker"）
   - 生成されたAPIキーをコピー（**このキーは再表示されません！**）

3. **課金設定**
   - 左メニュー → 「Settings」 → 「Billing」
   - クレジットカードを登録
   - 使用量制限を設定（推奨: $5-10/月）

**料金（gpt-4o-mini使用）:**
- 入力: $0.150 / 1M tokens
- 出力: $0.600 / 1M tokens
- 1回の解析: 約$0.0005-0.001（0.05-0.1円）
- 月100回使用で約$0.10（10円）程度

**無料クレジット:**
- 新規アカウントに$5の無料クレジット付与（3ヶ月有効）
- 詳細: https://platform.openai.com/docs/pricing

---

## 📝 Google Apps ScriptにAPIキーを設定

### 方法1: Script Properties（推奨・安全）

1. **Google Apps Scriptエディタを開く**
   - スプレッドシートを開く
   - メニュー → 「拡張機能」 → 「Apps Script」

2. **Script Propertiesを設定**
   - 左メニュー → 歯車アイコン「プロジェクトの設定」
   - 下にスクロール → 「スクリプト プロパティ」セクション
   - 「スクリプト プロパティを追加」をクリック

3. **以下の2つのプロパティを追加:**

   | プロパティ名 | 値 |
   |------------|---|
   | `VISION_API_KEY` | Google Cloud Vision APIキー |
   | `OPENAI_API_KEY` | OpenAI APIキー |

4. **保存**
   - 「スクリプト プロパティを保存」をクリック

### 方法2: コード内に直接記述（非推奨・テスト用のみ）

`gas/ImageAnalysis.gs` ファイルの冒頭部分を編集:

```javascript
// 画像解析用の設定（本番環境ではScript Propertiesを使用）
const IMAGE_CONFIG = {
  VISION_API_KEY: 'YOUR_VISION_API_KEY_HERE',  // ← ここに貼り付け
  OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE',  // ← ここに貼り付け
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,
  SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
};
```

⚠️ **注意:** この方法は安全ではありません。本番環境では必ずScript Propertiesを使用してください。

---

## 🧪 動作テスト

### 1. GAS側のテスト

1. **テスト関数を追加**

   `gas/ImageAnalysis.gs` の最後に以下を追加:

   ```javascript
   // テスト用関数
   function testImageAnalysisSetup() {
     const scriptProperties = PropertiesService.getScriptProperties();
     const visionKey = scriptProperties.getProperty('VISION_API_KEY');
     const openaiKey = scriptProperties.getProperty('OPENAI_API_KEY');
     
     Logger.log('Vision API Key: ' + (visionKey ? '設定済み ✓' : '未設定 ✗'));
     Logger.log('OpenAI API Key: ' + (openaiKey ? '設定済み ✓' : '未設定 ✗'));
     
     if (!visionKey || !openaiKey) {
       throw new Error('APIキーが設定されていません');
     }
     
     Logger.log('✅ APIキーの設定が完了しています');
     return true;
   }
   ```

2. **実行**
   - エディタ上部の関数選択ドロップダウンから `testImageAnalysisSetup` を選択
   - 「実行」ボタンをクリック
   - 下部の「実行ログ」を確認

### 2. Webサイトからのテスト

1. **Webサイトにアクセス**
2. **「📷 画像解析」ボタンをクリック**
3. **テスト画像をアップロード**
   - 麻雀アプリのスクリーンショットを用意
   - ドラッグ&ドロップまたはクリックで選択
4. **「解析して保存」をクリック**
5. **結果を確認**
   - 成功メッセージが表示される
   - スプレッドシートに新しい記録が追加される

---

## 🔧 トラブルシューティング

### エラー: "VISION_API_KEY is not defined"

**原因:** Google Cloud Vision APIキーが設定されていない

**解決策:**
1. Script Propertiesに `VISION_API_KEY` が正しく設定されているか確認
2. GASエディタを再読み込み
3. 再度実行

### エラー: "API key not valid"

**原因:** APIキーが無効または制限されている

**解決策:**
1. Google Cloud Consoleで該当APIが有効になっているか確認
2. APIキーの制限設定を確認
3. 必要に応じて新しいAPIキーを生成

### エラー: "Quota exceeded"

**原因:** API使用量が上限に達した

**解決策:**
1. Google Cloud Console → 「APIとサービス」 → 「割り当て」で使用状況を確認
2. 必要に応じて上限を増やす（有料）
3. OpenAIの場合は課金設定を確認

### 画像が解析されない

**チェック項目:**
1. ファイルサイズが10MB以下か
2. 対応フォーマット（JPEG, PNG, WebP）か
3. 画像が鮮明で文字が読みやすいか
4. ネットワーク接続が安定しているか

### スプレッドシートに記録されない

**チェック項目:**
1. GASのデプロイが最新版か
2. スプレッドシートの形式が正しいか
3. 実行ログでエラーを確認（GASエディタ → 表示 → ログ）

---

## 💡 使用上のヒント

### より正確な解析のために

1. **画像の品質**
   - 高解像度のスクリーンショットを使用
   - 文字がはっきり見える状態で撮影
   - 画面全体ではなく、スコア部分を含むように

2. **対応アプリ**
   - 天鳳（てんほう）
   - 雀魂（じゃんたま）
   - その他の麻雀アプリ（日本語表記のもの）

3. **コスト管理**
   - 解析1回あたり約0.1-0.2円
   - 月100回使用で10-20円程度
   - 無料枠を活用すればほぼ無料で運用可能

### セキュリティベストプラクティス

1. **APIキーは絶対に公開しない**
   - GitHubなどにコミットしない
   - スクリーンショットに含めない

2. **定期的にキーをローテーション**
   - 3-6ヶ月ごとに新しいキーに更新

3. **使用量監視**
   - Google Cloud Console・OpenAI Platformで定期的に確認
   - アラート設定を活用

---

## 📚 参考リンク

- **Google Cloud Vision API**
  - ドキュメント: https://cloud.google.com/vision/docs
  - 料金: https://cloud.google.com/vision/pricing
  - クイックスタート: https://cloud.google.com/vision/docs/quickstart

- **OpenAI API**
  - ドキュメント: https://platform.openai.com/docs
  - 料金: https://platform.openai.com/docs/pricing
  - ベストプラクティス: https://platform.openai.com/docs/guides/production-best-practices

- **Google Apps Script**
  - ドキュメント: https://developers.google.com/apps-script
  - PropertiesService: https://developers.google.com/apps-script/reference/properties

---

## ❓ サポート

問題が解決しない場合は、以下の情報を添えてIssueを作成してください:

1. エラーメッセージ
2. 実行ログ（個人情報を削除）
3. 使用環境（ブラウザ、OS）
4. 再現手順

---

**最終更新: 2025-11-05**
