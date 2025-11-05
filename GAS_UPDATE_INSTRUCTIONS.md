# 🔧 GAS更新手順

このエラーを修正するため、GASのコードを更新してください。

## ❌ 発生したエラー

```json
{
  "error": "Exception: 「Index」という HTML ファイルは見つかりませんでした。",
  "stack": "Exception: 「Index」という HTML ファイルは見つかりませんでした。\n    at serveHomePage (コード:866:28)\n    at doGet (コード:65:16)"
}
```

## ✅ 原因

現在のシステムは**静的Webサイト（GitHub Pages）**と**GAS JSON API**の分離アーキテクチャです。
GASから直接HTMLを配信する必要はありません。

---

## 🔧 修正手順

### ステップ1: GASエディタを開く

1. スプレッドシートを開く
2. メニュー → **「拡張機能」** → **「Apps Script」**

### ステップ2: Code.gs を更新

#### A. `doGet()` 関数を置き換え

**現在のコード（56-79行目）**:
```javascript
function doGet(e) {
  const action = e.parameter.action || 'home';
  const seasonKey = e.parameter.season || getCurrentSeason();
  
  try {
    switch(action) {
      case 'api':
        return handleAPI(e);
      case 'home':
        return serveHomePage();
      default:
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'Unknown action' }))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: error.toString(),
        stack: error.stack 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

**新しいコード（これに置き換え）**:
```javascript
/**
 * GETリクエストハンドラー
 * 
 * このGASはJSON APIとして動作します。
 * フロントエンドは別途GitHub Pagesなどでホスティングしてください。
 */
function doGet(e) {
  const action = e.parameter.action || 'api';
  
  try {
    switch(action) {
      case 'api':
        return handleAPI(e);
      case 'home':
        // 静的サイトへのリダイレクト案内
        return ContentService
          .createTextOutput(JSON.stringify({ 
            message: 'このAPIは麻雀スコアボードのバックエンドです',
            frontendUrl: 'https://ogaiku.github.io/mahjong-score-board-light/',
            documentation: 'https://github.com/ogaiku/mahjong-score-board-light',
            availableEndpoints: [
              '?action=api&endpoint=seasons',
              '?action=api&endpoint=rankings&season=SEASON_KEY',
              '?action=api&endpoint=recent_games&season=SEASON_KEY&limit=20',
              '?action=api&endpoint=player_stats&season=SEASON_KEY&playerId=ID',
              '?action=api&endpoint=head_to_head&season=SEASON_KEY&player1=ID&player2=ID'
            ]
          }))
          .setMimeType(ContentService.MimeType.JSON);
      default:
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'Unknown action' }))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: error.toString(),
        stack: error.stack 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

#### B. `doPost()` 関数を更新（画像解析対応）

**現在のコード（84-100行目あたり）**:
```javascript
function doPost(e) {
  try {
    const action = e.parameter.action;
    const data = JSON.parse(e.postData.contents);
    
    switch(action) {
      case 'add_game':
        return addGameRecord(data);
      // ...
```

**新しいコード（これに置き換え）**:
```javascript
function doPost(e) {
  try {
    const action = e.parameter.action;
    
    // 画像解析の場合は特別処理
    if (action === 'analyze_image') {
      return doPostImageAnalysis(e);
    }
    
    const data = JSON.parse(e.postData.contents);
    
    switch(action) {
      case 'add_game':
        return addGameRecord(data);
      // ... 以下は既存のまま
```

#### C. `serveHomePage()` 関数を削除または置き換え

**約882行目あたりにある以下のコード**:
```javascript
function serveHomePage() {
  const html = HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('麻雀スコアボード')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  
  return html;
}
```

**これを削除、またはコメントアウト**:
```javascript
// serveHomePage 関数は削除されました
// フロントエンドは GitHub Pages でホスティングされます
// URL: https://ogaiku.github.io/mahjong-score-board-light/
```

### ステップ3: ImageAnalysis.gs を追加

1. GASエディタで **「+」** → **「スクリプト」**
2. ファイル名を **`ImageAnalysis`** に変更
3. GitHubから内容を取得:
   ```
   https://github.com/ogaiku/mahjong-score-board-light/blob/main/gas/ImageAnalysis.gs
   ```
4. コードを貼り付けて保存

### ステップ4: 保存して再デプロイ

1. **「保存」**アイコンをクリック（💾）
2. **「デプロイ」** → **「デプロイを管理」**
3. 現在のデプロイの右側の **鉛筆アイコン（編集）**
4. **「バージョン」** → **「新バージョン」**を選択
5. **「デプロイ」**をクリック

---

## ✅ 確認

### テスト1: API動作確認

ブラウザで以下のURLにアクセス:
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

**期待される結果**:
```json
{
  "message": "このAPIは麻雀スコアボードのバックエンドです",
  "frontendUrl": "https://ogaiku.github.io/mahjong-score-board-light/",
  "documentation": "https://github.com/ogaiku/mahjong-score-board-light",
  "availableEndpoints": [...]
}
```

### テスト2: シーズン情報取得

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=api&endpoint=seasons
```

**期待される結果**:
```json
{
  "seasons": [...],
  "currentSeason": "2025_season1"
}
```

---

## 📝 まとめ

### 変更内容
- ✅ `doGet()`: HTML配信を削除、JSON APIのみに変更
- ✅ `doPost()`: 画像解析対応を追加
- ✅ `serveHomePage()`: 削除
- ✅ `ImageAnalysis.gs`: 新規追加

### アーキテクチャ
```
フロントエンド（GitHub Pages）
    ↓ AJAX
バックエンド（GAS JSON API）
    ↓ 読み書き
スプレッドシート（データベース）
```

---

## 🔗 関連リンク

- **GitHubリポジトリ**: https://github.com/ogaiku/mahjong-score-board-light
- **更新されたCode.gs**: https://github.com/ogaiku/mahjong-score-board-light/blob/main/gas/Code.gs
- **ImageAnalysis.gs**: https://github.com/ogaiku/mahjong-score-board-light/blob/main/gas/ImageAnalysis.gs

---

**質問があればお気軽にどうぞ！** 🙌
