# 🚀 クイックスタートガイド

## ✅ 完了した作業

### 1. Googleフォーム作成 ✅
- **対戦記録フォーム**: https://docs.google.com/forms/d/e/1FAIpQLSdeDHH9OyDtz7lxwRl5cW1lVrMKcDSwunFVJ-8vQ1dSbDNhHQ/viewform
- **プレイヤー管理フォーム**: https://docs.google.com/forms/d/e/1FAIpQLSd7Hnq58VKftUAMo2s5OwazLF2QbrA2QbxJyX6nLcH2LoKWMQ/viewform

### 2. 設定ファイル更新 ✅
- `website/config.js` にフォームURLを設定済み

---

## 📋 次のステップ

### ステップ1: GAS Web Appをデプロイ（必須）

#### 1-1. デプロイ実行
Google Apps Scriptエディタで：

1. 右上の「**デプロイ**」ボタンをクリック
2. 「**新しいデプロイ**」を選択
3. 種類の選択で「**ウェブアプリ**」をクリック
4. 以下を設定：
   - **説明**: `麻雀スコアボードAPI v1`
   - **次のユーザーとして実行**: `自分 (あなたのメールアドレス)`
   - **アクセスできるユーザー**: `全員`
5. 「**デプロイ**」をクリック

#### 1-2. URLをコピー
デプロイ完了後、表示される **Web App URL** をコピーしてください。

例: `https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXX/exec`

#### 1-3. 設定ファイルに貼り付け
コピーしたURLを `website/config.js` の以下の場所に貼り付けます：

```javascript
const APP_CONFIG = {
  // ここに貼り付け ↓
  GAS_API_URL: 'https://script.google.com/macros/s/YOUR_ACTUAL_URL/exec',
  
  // 以下は既に設定済み
  GAME_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSdeDHH9OyDtz7lxwRl5cW1lVrMKcDSwunFVJ-8vQ1dSbDNhHQ/viewform',
  PLAYER_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSd7Hnq58VKftUAMo2s5OwazLF2QbrA2QbxJyX6nLcH2LoKWMQ/viewform',
  // ...
};
```

---

### ステップ2: フォームの回答先を設定

#### 2-1. 対戦記録フォームの設定

1. **編集URL**を開く:
   - https://docs.google.com/forms/d/1Sxh3-m0cfyIICGzwUdACQu7p1oOuisazDZlQ-OCd-yw/edit

2. 「**回答**」タブをクリック

3. 右上の **スプレッドシートアイコン**（緑色）をクリック

4. 「**既存のスプレッドシートを選択**」を選択

5. **現在のシーズンのスプレッドシート**を選択
   - スプレッドシートID: （設定スプレッドシートで確認）
   - 見つからない場合は「新しいスプレッドシートを作成」を選択

6. 「**作成**」または「**選択**」をクリック

#### 2-2. データシートの確認

フォームの回答が送信されるシートに、以下のヘッダーが必要です：

```
対戦日 | 対戦時刻 | 対戦タイプ | プレイヤー1名 | プレイヤー1点数 | 
プレイヤー2名 | プレイヤー2点数 | プレイヤー3名 | プレイヤー3点数 | 
プレイヤー4名 | プレイヤー4点数 | メモ | 登録日時
```

もし、フォーム回答用の新しいシートが作成された場合：
- データを既存のシートに手動でコピーするか
- GASの `onFormSubmit` トリガーを設定して自動転送

---

### ステップ3: Webサイトをデプロイ

#### オプション1: GitHub Pages（推奨）

1. **GitHubリポジトリの設定**を開く
   - https://github.com/ogaiku/mahjong-score-tracker/settings/pages

2. 「**Source**」で以下を選択：
   - Branch: `feature/gas-lightweight-version`
   - Folder: `/gas-lightweight-version/website`

3. 「**Save**」をクリック

4. 数分後、以下のURLでアクセス可能：
   - https://ogaiku.github.io/mahjong-score-tracker/

#### オプション2: ローカルでテスト

```bash
# プロジェクトディレクトリに移動
cd gas-lightweight-version/website

# 簡易HTTPサーバーを起動
python3 -m http.server 8000

# または
npx serve .
```

ブラウザで http://localhost:8000 を開く

---

## 🧪 動作確認

### 1. APIの接続テスト

1. Webサイトを開く
2. ブラウザの開発者ツール（F12）を開く
3. 「Console」タブを確認
4. エラーが表示されなければOK

### 2. データ表示テスト

1. シーズン選択ドロップダウンが表示されるか
2. ランキングタブにデータが表示されるか
3. 各タブを切り替えてエラーがないか

### 3. フォーム送信テスト

1. **対戦記録フォーム**を開く
2. テストデータを入力：
   - 対戦日: 今日の日付
   - 対戦タイプ: 四麻半荘
   - プレイヤー: 既存のプレイヤー名
   - 点数: 適当な数値（例: 28000, 25000, 22000, 25000）
3. 送信
4. Webサイトで「🔄 更新」ボタンをクリック
5. 最近の対戦タブにテストデータが表示されるか確認

---

## ❓ トラブルシューティング

### Q1: "GAS API URLが設定されていません" と表示される

**解決方法**:
- `website/config.js` の `GAS_API_URL` を確認
- GAS Web AppのURLが正しく設定されているか確認
- URLの最後に `/exec` が含まれているか確認

### Q2: "データの読み込みに失敗しました" と表示される

**原因と解決方法**:

**原因1**: GAS Web Appの権限が承認されていない
→ GASエディタでスクリプトを手動実行して権限を承認

**原因2**: スプレッドシートIDが間違っている
→ `Code.gs` の `CONFIG_SPREADSHEET_ID` を確認

**原因3**: CORSエラー
→ GAS Web Appを「全員」アクセス可能に設定

### Q3: フォームの回答がスプレッドシートに反映されない

**解決方法**:
1. フォームの「回答」タブでスプレッドシートリンクを確認
2. 正しいスプレッドシートに接続されているか確認
3. スプレッドシートの権限を確認（編集可能か）

### Q4: ランキングは表示されるが、グラフが表示されない

**解決方法**:
- インターネット接続を確認（Chart.jsをCDNから読み込むため）
- ブラウザのコンソール（F12）でエラーを確認
- Chart.jsのCDN URLが正しいか確認

---

## 📞 サポート

問題が解決しない場合：

1. **ブラウザのコンソール**（F12）でエラーメッセージを確認
2. **GASエディタのログ**（実行ログ）を確認
3. **GitHubでIssue**を作成
4. **プルリクエスト**にコメント

---

## 🎉 完了！

すべてのステップが完了したら、以下を楽しめます：

✅ **高速な起動**（1-2秒）
✅ **スマホで快適な入力**（Googleフォーム）
✅ **美しい統計表示**（グラフとランキング）
✅ **無料運用**（サーバーコスト $0）

---

## 📚 関連ドキュメント

- **詳細セットアップガイド**: [SETUP.md](SETUP.md)
- **実装サマリー**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **プロジェクト概要**: [README.md](../README.md)

---

**作成日**: 2025年11月5日
**最終更新**: 2025年11月5日
