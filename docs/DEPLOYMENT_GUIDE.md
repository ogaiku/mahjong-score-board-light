# デプロイガイド

## 🚀 Webサイトのデプロイ

設定が完了したら、Webサイトを公開しましょう。

---

## ✅ 現在の設定

以下のURLが設定されています：

- **GAS Web App URL**: 
  ```
  https://script.google.com/macros/s/AKfycbwP28tt5bsSvHJaciIcOJccFyqsG9TXQgLv6Pai_-1YW7DHoDUgdSiaYPfgsgA6kebuwQ/exec
  ```

- **対戦記録フォームURL**: 
  ```
  https://docs.google.com/forms/d/e/1FAIpQLSdeDHH9OyDtz7lxwRl5cW1lVrMKcDSwunFVJ-8vQ1dSbDNhHQ/viewform
  ```

- **プレイヤー管理フォームURL**: 
  ```
  https://docs.google.com/forms/d/e/1FAIpQLSd7Hnq58VKftUAMo2s5OwazLF2QbrA2QbxJyX6nLcH2LoKWMQ/viewform
  ```

---

## 📦 デプロイオプション

### オプション1: GitHub Pages（推奨）

#### メリット
- ✅ 完全無料
- ✅ 自動デプロイ（git pushで更新）
- ✅ カスタムドメイン対応
- ✅ HTTPS自動設定

#### 手順

1. **GitHubリポジトリ設定を開く**
   ```
   https://github.com/ogaiku/mahjong-score-tracker/settings/pages
   ```

2. **Sourceを設定**
   - Branch: `feature/gas-lightweight-version`
   - Folder: `/gas-lightweight-version/website`
   - 「Save」をクリック

3. **デプロイ完了を待つ**（1-2分）
   - Actions タブでビルド状況を確認
   - 完了するとURLが表示されます

4. **公開URL**
   ```
   https://ogaiku.github.io/mahjong-score-tracker/
   ```

#### 注意事項
- ブランチを `main` にマージ後、ブランチ設定を `main` に変更
- `/gas-lightweight-version/website` を指定（ルートではない）

---

### オプション2: Cloudflare Pages

#### メリット
- ✅ 完全無料
- ✅ 超高速（世界中にCDN）
- ✅ 無制限リクエスト
- ✅ 自動デプロイ

#### 手順

1. **Cloudflare Pagesにアクセス**
   ```
   https://pages.cloudflare.com/
   ```

2. **プロジェクトを作成**
   - 「Create a project」をクリック
   - 「Connect to Git」を選択
   - GitHubアカウントを連携

3. **リポジトリを選択**
   - `ogaiku/mahjong-score-tracker` を選択
   - Branch: `feature/gas-lightweight-version`

4. **ビルド設定**
   ```
   Project name: mahjong-score-board
   Production branch: feature/gas-lightweight-version
   Build command: (空欄)
   Build output directory: gas-lightweight-version/website
   Root directory: (空欄)
   ```

5. **デプロイ**
   - 「Save and Deploy」をクリック
   - 数秒で完了

6. **公開URL**
   ```
   https://mahjong-score-board.pages.dev
   ```

#### カスタムドメイン設定（オプション）
```
1. Cloudflare Pagesダッシュボード
2. Custom domains → Add domain
3. DNSレコードを設定
```

---

### オプション3: Netlify

#### メリット
- ✅ 完全無料（個人利用）
- ✅ ドラッグ&ドロップで簡単デプロイ
- ✅ プレビューURL自動生成

#### 手順A: ドラッグ&ドロップ（最速）

1. **Netlifyにアクセス**
   ```
   https://app.netlify.com/drop
   ```

2. **フォルダをドラッグ&ドロップ**
   ```bash
   # ローカルでwebsiteフォルダを圧縮
   cd gas-lightweight-version
   zip -r website.zip website/
   ```
   
   `website.zip` をNetlifyにドラッグ

3. **デプロイ完了**
   - 即座にURLが発行されます
   - 例: `https://random-name-12345.netlify.app`

#### 手順B: Git連携（自動デプロイ）

1. **新しいサイトを作成**
   - 「Add new site」→「Import an existing project」
   - GitHubを連携

2. **リポジトリを選択**
   - `ogaiku/mahjong-score-tracker`
   - Branch: `feature/gas-lightweight-version`

3. **ビルド設定**
   ```
   Base directory: gas-lightweight-version/website
   Build command: (空欄)
   Publish directory: .
   ```

4. **デプロイ**
   - 「Deploy site」をクリック

---

### オプション4: Vercel

#### メリット
- ✅ 完全無料
- ✅ 高速デプロイ
- ✅ 自動プレビューURL

#### 手順

1. **Vercelにアクセス**
   ```
   https://vercel.com/new
   ```

2. **リポジトリをインポート**
   - GitHubを連携
   - `ogaiku/mahjong-score-tracker` を選択

3. **設定**
   ```
   Project Name: mahjong-score-board
   Framework Preset: Other
   Root Directory: gas-lightweight-version/website
   Build Command: (空欄)
   Output Directory: .
   ```

4. **デプロイ**
   - 「Deploy」をクリック

5. **公開URL**
   ```
   https://mahjong-score-board.vercel.app
   ```

---

## 🧪 デプロイ後のテスト

デプロイが完了したら、以下をテストしてください：

### 1. 基本動作確認
- [ ] ページが正常に読み込まれる
- [ ] ローディング画面が表示される
- [ ] シーズン選択ドロップダウンが表示される

### 2. データ読み込み確認
- [ ] ランキングタブにデータが表示される
- [ ] グラフが描画される
- [ ] 最近の対戦タブに記録が表示される

### 3. フォームリンク確認
- [ ] フッターの「対戦記録を入力」リンクが動作する
- [ ] Googleフォームが正しく開く

### 4. 各機能確認
- [ ] プレイヤー統計タブが動作する
- [ ] 対戦比較タブが動作する
- [ ] 検索・フィルター機能が動作する
- [ ] 更新ボタンが動作する

### 5. モバイル表示確認
- [ ] スマートフォンで正常に表示される
- [ ] タッチ操作が快適
- [ ] レスポンシブデザインが適用される

---

## 🐛 トラブルシューティング

### エラー: "GAS API URLが設定されていません"

**原因**: `config.js` が正しくデプロイされていない

**解決方法**:
```bash
# config.jsを確認
cat gas-lightweight-version/website/config.js

# GAS_API_URLが正しく設定されているか確認
```

### エラー: "データの読み込みに失敗しました"

**原因**: GAS Web AppのCORS設定またはアクセス権限

**解決方法**:
1. GASエディタを開く
2. デプロイ設定を確認
3. 「アクセスできるユーザー」が「全員」になっているか確認
4. 新しいバージョンでデプロイし直す

### フォームが開けない

**原因**: フォームの共有設定

**解決方法**:
1. Googleフォームの編集画面を開く
2. 「送信」→「リンク」
3. 「リンクを知っている全員」に設定されているか確認

### グラフが表示されない

**原因**: Chart.jsの読み込み失敗

**解決方法**:
1. ブラウザのコンソール（F12）を確認
2. CDNからChart.jsが読み込めるか確認
3. インターネット接続を確認

---

## 🔄 更新手順

### コードを更新した場合

```bash
# 変更をコミット
git add .
git commit -m "Update: [変更内容]"
git push

# GitHub Pages / Cloudflare Pages / Netlify / Vercel
# → 自動デプロイ（1-2分で反映）
```

### 設定を変更した場合

```bash
# website/config.js を編集
vim gas-lightweight-version/website/config.js

# コミット＆プッシュ
git add gas-lightweight-version/website/config.js
git commit -m "config: Update settings"
git push

# 自動デプロイされる
```

---

## 📊 デプロイ比較表

| サービス | 無料プラン | デプロイ速度 | CDN | カスタムドメイン | 推奨度 |
|---------|-----------|------------|-----|----------------|--------|
| **GitHub Pages** | ✅ | 1-2分 | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **Cloudflare Pages** | ✅ | 10秒 | ✅✅✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **Netlify** | ✅ | 30秒 | ✅✅ | ✅ | ⭐⭐⭐⭐ |
| **Vercel** | ✅ | 20秒 | ✅✅ | ✅ | ⭐⭐⭐⭐ |

**推奨**: 
- **GitHub Pages**: GitHubだけで完結したい場合
- **Cloudflare Pages**: 最高速度を求める場合

---

## 🎉 デプロイ完了！

おめでとうございます！軽量版麻雀スコア管理システムが公開されました。

### 公開URL例
```
https://ogaiku.github.io/mahjong-score-tracker/
```

このURLを：
- チームメンバーに共有
- ブックマークに登録
- LINEグループに投稿
- QRコードを生成して印刷

---

## 📱 次のステップ

1. **フォームURLをLINEで共有**
   ```
   📝 対戦記録入力フォーム
   https://docs.google.com/forms/d/e/1FAIpQLSdeDHH9OyDtz7lxwRl5cW1lVrMKcDSwunFVJ-8vQ1dSbDNhHQ/viewform
   ```

2. **Webサイトをブックマーク**
   ```
   🌐 スコアボード
   https://ogaiku.github.io/mahjong-score-tracker/
   ```

3. **既存のStreamlit版と比較**
   - 起動時間の違いを体感
   - モバイルでの使いやすさを確認

4. **フィードバックを収集**
   - チームメンバーに使ってもらう
   - 改善点を記録

---

**🚀 軽量で高速な新システムをお楽しみください！**
