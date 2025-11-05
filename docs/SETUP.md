# 麻雀スコア管理システム - セットアップガイド

## 🎯 システム概要

**Googleフォーム入力 + 軽量Webサイト閲覧**の構成で、現在のStreamlitシステムの重さと起動時間の問題を解決します。

### システム構成

```
📝 Googleフォーム
  ↓ 自動送信
📊 Google Sheets（既存スプレッドシート）
  ↓ 読み取り
⚙️ Google Apps Script（データ処理・API）
  ↓ JSON API
🌐 軽量Webサイト（閲覧専用）
```

### メリット

- ✅ **高速起動**: 1〜2秒で表示開始
- ✅ **軽量**: サーバー不要、静的HTMLで配信
- ✅ **モバイル最適化**: スマホで快適に入力・閲覧
- ✅ **LINE bot連携維持**: 既存のスプレッドシート構造を保持

---

## 📋 セットアップ手順

### ステップ1: Google Apps Scriptのデプロイ

#### 1.1 GASプロジェクトを開く

1. [Google Apps Script](https://script.google.com/) にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を「麻雀スコアボードAPI」に変更

#### 1.2 スクリプトファイルをコピー

1. `gas/Code.gs` の内容をコピーして貼り付け
2. 左メニューの「➕」をクリックして新しいスクリプトを追加
3. ファイル名を `FormGenerator` に変更
4. `gas/FormGenerator.gs` の内容をコピーして貼り付け

#### 1.3 設定を確認

`Code.gs` の冒頭にある設定を確認：

```javascript
const CONFIG = {
  CONFIG_SPREADSHEET_ID: '10UTxzbPu-yARrO0vcyWC8a529zlDYLZRN9d6kqC2w3g',
  // ... その他の設定
};
```

#### 1.4 Web Appとしてデプロイ

1. 右上の「デプロイ」→「新しいデプロイ」をクリック
2. 種類の選択で「ウェブアプリ」を選択
3. 設定:
   - 説明: 「麻雀スコアボードAPI v1」
   - 次のユーザーとして実行: **自分**
   - アクセスできるユーザー: **全員（匿名ユーザーを含む）**
4. 「デプロイ」をクリック
5. **Web App URLをコピー**（後で使用します）
   - 例: `https://script.google.com/macros/s/XXXXXXXX/exec`

#### 1.5 権限を承認

初回デプロイ時に権限の承認が求められます:

1. 「権限を確認」をクリック
2. Googleアカウントを選択
3. 「詳細」→「麻雀スコアボードAPI（安全ではないページ）に移動」をクリック
4. 「許可」をクリック

---

### ステップ2: Googleフォームの作成

#### 2.1 フォーム自動生成スクリプトを実行

1. GASエディタで `FormGenerator.gs` を開く
2. 関数選択ドロップダウンから `createAllForms` を選択
3. 「実行」ボタンをクリック
4. ログに表示される**フォームURL**をコピー:
   - 📋 対戦記録フォーム: `https://docs.google.com/forms/d/e/...`
   - 👥 プレイヤー管理フォーム: `https://docs.google.com/forms/d/e/...`

#### 2.2 フォームの設定（オプション）

生成されたフォームは自動的に設定されていますが、必要に応じてカスタマイズできます:

1. フォームの編集URLからアクセス
2. テーマカラー、フォントなどをカスタマイズ
3. 質問の順序や必須項目を調整

#### 2.3 フォーム回答先の確認

フォームの回答は自動的に現在のシーズンのスプレッドシートに送信されます。

確認方法:
1. フォームの「回答」タブを開く
2. 右上のスプレッドシートアイコンをクリック
3. 正しいスプレッドシートにリンクされているか確認

---

### ステップ3: Webサイトのセットアップ

#### 3.1 設定ファイルを編集

`website/config.js` を開いて、以下を設定:

```javascript
const APP_CONFIG = {
  // ステップ1.4でコピーしたWeb App URL
  GAS_API_URL: 'https://script.google.com/macros/s/XXXXXXXX/exec',
  
  // ステップ2.1でコピーした対戦記録フォームURL
  GAME_FORM_URL: 'https://docs.google.com/forms/d/e/XXXXXXXX/viewform',
  
  // ステップ2.1でコピーしたプレイヤー管理フォームURL
  PLAYER_FORM_URL: 'https://docs.google.com/forms/d/e/XXXXXXXX/viewform',
  
  // その他の設定（デフォルトでOK）
  DEFAULT_RECENT_GAMES_LIMIT: 20,
  REFRESH_INTERVAL: 60000,
  DEBUG_MODE: false
};
```

#### 3.2 ローカルでテスト

```bash
# シンプルなHTTPサーバーを起動
cd website
python3 -m http.server 8000
# または
npx serve .
```

ブラウザで `http://localhost:8000` を開いてテスト

#### 3.3 本番環境へデプロイ

**オプション1: GitHub Pages（推奨）**

1. GitHubリポジトリを作成
2. `website/` フォルダの内容をpush
3. リポジトリ設定 → Pages → Sourceを `main` ブランチに設定
4. `https://your-username.github.io/your-repo/` でアクセス可能

**オプション2: Cloudflare Pages**

1. [Cloudflare Pages](https://pages.cloudflare.com/) にアクセス
2. 「Create a project」をクリック
3. GitHubリポジトリを連携
4. ビルド設定:
   - Build command: （空欄）
   - Build output directory: `/website`
5. デプロイ完了後、URLが発行されます

**オプション3: Netlify**

1. [Netlify](https://www.netlify.com/) にアクセス
2. 「Add new site」→「Import an existing project」
3. GitHubリポジトリを選択
4. Base directoryを `website` に設定
5. デプロイ

---

### ステップ4: 動作確認

#### 4.1 データ読み込みテスト

1. Webサイトにアクセス
2. シーズン選択ドロップダウンが表示されるか確認
3. ランキングタブにデータが表示されるか確認
4. 各タブを切り替えてエラーがないか確認

#### 4.2 フォーム送信テスト

1. 対戦記録フォームを開く
2. テストデータを入力して送信
3. Webサイトを更新（🔄ボタン）
4. 最近の対戦記録タブにテストデータが表示されるか確認

#### 4.3 プレイヤー管理テスト

1. プレイヤー管理フォームを開く
2. 新しいプレイヤーを追加
3. GASエディタで `addPlayer` 関数を直接実行
4. Webサイトでプレイヤーリストに反映されているか確認

---

### ステップ5: LINE bot連携の確認

既存のLINE botが正常に動作しているか確認:

1. LINE botにメッセージを送信
2. スプレッドシートに正しく記録されるか確認
3. Webサイトで更新ボタンを押してデータが反映されるか確認

---

## 🔧 トラブルシューティング

### エラー: "GAS API URLが設定されていません"

**原因**: `config.js` にWeb App URLが設定されていない

**解決方法**:
1. `website/config.js` を開く
2. `GAS_API_URL` に正しいURLを設定
3. ページをリロード

### エラー: "データの読み込みに失敗しました"

**原因1**: GAS Web Appの権限が承認されていない

**解決方法**:
1. GASエディタでスクリプトを実行
2. 権限の承認を行う

**原因2**: スプレッドシートIDが間違っている

**解決方法**:
1. `Code.gs` の `CONFIG_SPREADSHEET_ID` を確認
2. 正しいIDに修正してデプロイし直す

### フォームの回答がスプレッドシートに反映されない

**原因**: フォームの送信先が正しく設定されていない

**解決方法**:
1. Googleフォームの「回答」タブを開く
2. スプレッドシートアイコンをクリック
3. 正しいスプレッドシートを選択

### グラフが表示されない

**原因**: Chart.jsが読み込まれていない

**解決方法**:
1. ブラウザの開発者ツール（F12）を開く
2. Consoleタブでエラーを確認
3. インターネット接続を確認（CDNからChart.jsを読み込むため）

---

## 📱 使い方

### 対戦記録の入力

1. Googleフォーム（対戦記録入力）にアクセス
2. 対戦日、対戦タイプ、プレイヤー名、点数を入力
3. 送信

### 統計の閲覧

1. Webサイトにアクセス
2. 各タブを切り替えて情報を確認:
   - **ランキング**: 総合ランキングとグラフ
   - **最近の対戦**: 対戦記録一覧
   - **プレイヤー統計**: 個別プレイヤーの詳細
   - **対戦比較**: 2人の直接対決成績

### データの更新

右上の「🔄 更新」ボタンをクリックすると、最新データを取得します。

---

## 🎨 カスタマイズ

### デザインの変更

`website/styles.css` を編集してデザインをカスタマイズできます:

```css
:root {
  --primary-color: #3b82f6;  /* メインカラー */
  --secondary-color: #8b5cf6; /* サブカラー */
  /* その他のカラー変数 */
}
```

### 機能の追加

`website/app.js` を編集して機能を追加できます:

```javascript
// 新しいAPI呼び出し
async function loadCustomData() {
  const data = await fetchAPI('custom_endpoint', { param: 'value' });
  // データ処理
}
```

対応するGAS側のエンドポイントも `Code.gs` に追加:

```javascript
function handleAPI(e) {
  const endpoint = e.parameter.endpoint;
  
  switch(endpoint) {
    case 'custom_endpoint':
      return getCustomData(e.parameter.param);
    // ... 既存のケース
  }
}
```

---

## 🚀 パフォーマンス最適化

### キャッシュの活用

GASでキャッシュを使用してAPI応答を高速化:

```javascript
function getCachedRankings(seasonKey) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `rankings_${seasonKey}`;
  
  const cached = cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const rankings = getRankings(seasonKey);
  cache.put(cacheKey, JSON.stringify(rankings), 300); // 5分間キャッシュ
  
  return rankings;
}
```

### 画像の最適化

アイコンや画像を使用する場合は、WebP形式で最適化します。

### CDNの活用

静的ファイルをCDNで配信することで、世界中からの高速アクセスが可能になります。

---

## 📊 システム構成図

```
┌─────────────────────────────────────┐
│  📱 ユーザー（モバイル/PC）          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  📝 Googleフォーム（入力）           │
│  ・対戦記録入力フォーム              │
│  ・プレイヤー管理フォーム            │
└─────────────────────────────────────┘
              ↓ 自動送信
┌─────────────────────────────────────┐
│  📊 Google Sheets（データ基盤）      │
│  ・設定スプレッドシート              │
│    - シーズン管理                    │
│    - player_master                  │
│  ・各シーズンのスプレッドシート      │
│    - 対戦記録                        │
└─────────────────────────────────────┘
              ↓ 読み取り
┌─────────────────────────────────────┐
│  ⚙️ Google Apps Script（処理層）    │
│  ・データAPI提供                     │
│  ・統計計算                          │
│  ・スコア計算                        │
└─────────────────────────────────────┘
              ↓ JSON API
┌─────────────────────────────────────┐
│  🌐 軽量Webサイト（閲覧専用）        │
│  ・ランキング表示                    │
│  ・統計グラフ                        │
│  ・対戦記録一覧                      │
│  ・プレイヤー統計                    │
└─────────────────────────────────────┘
              ↑
┌─────────────────────────────────────┐
│  🤖 LINE bot（既存システム）         │
│  ・対戦記録入力                      │
│  ・スプレッドシート連携              │
└─────────────────────────────────────┘
```

---

## 📞 サポート

問題が発生した場合:

1. ブラウザの開発者ツール（F12）でConsoleを確認
2. GASエディタのログ（Ctrl+Enter）を確認
3. スプレッドシートの権限を確認
4. このドキュメントのトラブルシューティングを参照

---

## 🎉 完了！

セットアップが完了しました。軽量で高速な麻雀スコア管理システムをお楽しみください！
