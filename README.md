# 🀄 麻雀スコア管理システム - 軽量版

**Googleフォーム + 軽量Webサイト**で実現する、高速・軽量・モバイル最適化された麻雀スコア管理システム

---

## ✨ 特徴

### 🚀 高速起動
- **1〜2秒で表示開始**（従来のStreamlit版: 30秒〜1分）
- サーバー不要の静的HTML配信
- CDNによるグローバル配信

### 📱 モバイル完全対応
- スマホで快適に入力・閲覧
- レスポンシブデザイン
- タッチ操作最適化

### 🔗 LINE bot連携維持
- 既存のスプレッドシート構造を保持
- LINE botからの入力も継続可能
- データの一元管理

### 💾 無料運用
- GitHub Pages / Cloudflare Pages で無料ホスティング
- Google Apps Script で無料API提供
- サーバーコスト $0

---

## 📁 プロジェクト構成

```
mahjong-score-board-light/
├── gas/                           # Google Apps Script
│   ├── Code.gs                   # メインロジック・API
│   ├── FormGenerator.gs          # フォーム自動生成
│   └── ImageAnalysis.gs          # 画像解析機能 🆕
├── website/                       # 軽量Webサイト
│   ├── index.html                # メインHTML
│   ├── styles.css                # スタイルシート
│   ├── app.js                    # メインJavaScript
│   └── config.js                 # 設定ファイル
├── docs/                          # ドキュメント
│   ├── SETUP.md                  # セットアップガイド
│   └── IMAGE_ANALYSIS_SETUP.md   # 画像解析セットアップ 🆕
└── README.md                      # このファイル
```

---

## 🎯 システム構成

```
📝 Googleフォーム（入力）
     ↓ 自動送信
📊 Google Sheets（データ基盤）
     ↓ 読み取り
⚙️ Google Apps Script（API・処理）
     ↓ JSON API
🌐 軽量Webサイト（閲覧専用）
```

---

## 🚀 クイックスタート

### 必要なもの
- Googleアカウント
- 既存のスプレッドシート（LINE bot連携済み）

### セットアップ手順（5分）

1. **GASプロジェクトを作成**
   ```
   1. script.google.com にアクセス
   2. 新しいプロジェクトを作成
   3. gas/Code.gs と gas/FormGenerator.gs をコピー
   ```

2. **Web Appとしてデプロイ**
   ```
   1. 「デプロイ」→「新しいデプロイ」
   2. 種類: ウェブアプリ
   3. アクセス: 全員
   4. Web App URLをコピー
   ```

3. **Googleフォームを作成**
   ```
   GASエディタで createAllForms() を実行
   → フォームURLをコピー
   ```

4. **Webサイトを設定**
   ```
   website/config.js を編集:
   - GAS_API_URL: コピーしたWeb App URL
   - GAME_FORM_URL: 対戦記録フォームURL
   ```

5. **デプロイ**
   ```
   GitHub Pages / Cloudflare Pages / Netlifyにデプロイ
   ```

**詳細は [SETUP.md](docs/SETUP.md) を参照**

---

## 📊 機能一覧

### 入力機能（Googleフォーム）
- ✅ 対戦記録入力
  - 対戦日、対戦時刻
  - 対戦タイプ（四麻/三麻、東風/半荘）
  - プレイヤー名（player_masterから選択）
  - 最終点棒
  - メモ
- ✅ プレイヤー管理
  - プレイヤー追加
  - プレイヤー名変更

### 🆕 画像解析機能
- 📷 **スクリーンショット自動解析**
  - 麻雀アプリの結果画面をアップロード
  - Google Vision API + OpenAI APIで自動解析
  - 自動でスプレッドシートに記録
  - 対応アプリ: 天鳳、雀魂など
  - セットアップ: [IMAGE_ANALYSIS_SETUP.md](docs/IMAGE_ANALYSIS_SETUP.md)

### 閲覧機能（Webサイト）
- ✅ **ランキング**
  - 総合ランキングテーブル
  - 平均スコア比較グラフ
  - 順位分布グラフ
  - クリックで詳細表示

- ✅ **最近の対戦**
  - 対戦記録一覧（直近20件）
  - プレイヤー名で検索
  - 対戦タイプでフィルター
  - 日付・時刻表示

- ✅ **プレイヤー統計**
  - 対戦数、平均スコア
  - 平均順位、1位率
  - 最高点棒、最低点棒
  - スコア推移グラフ
  - 順位分布グラフ

- ✅ **対戦比較**
  - 2人の直接対決成績
  - 勝率、引き分け数
  - 対戦履歴一覧

### データ管理
- ✅ シーズン管理
- ✅ プレイヤーマスター管理
- ✅ 自動同期（60秒間隔）
- ✅ 手動更新ボタン

---

## 🎨 スクリーンショット

### ランキング画面
![ランキング](docs/images/ranking.png)

### 最近の対戦
![対戦記録](docs/images/recent-games.png)

### プレイヤー統計
![統計](docs/images/player-stats.png)

*（画像は後で追加）*

---

## 🔧 技術スタック

### フロントエンド
- HTML5 / CSS3 / JavaScript（バニラJS）
- Chart.js（グラフ描画）
- レスポンシブデザイン

### バックエンド
- Google Apps Script（GAS）
- Google Sheets API
- RESTful API設計
- Google Cloud Vision API（OCR）🆕
- OpenAI API（gpt-4o-mini）🆕

### ホスティング
- GitHub Pages（推奨）
- Cloudflare Pages
- Netlify

---

## 📈 パフォーマンス比較

| 項目 | Streamlit版 | 軽量版 |
|------|------------|--------|
| 初回起動時間 | 30秒〜1分 | **1〜2秒** |
| ページ切り替え | 1〜2秒 | **瞬時** |
| モバイル対応 | △ | **◎** |
| サーバーコスト | 有料 | **無料** |
| メンテナンス | 必要 | **最小限** |

---

## 🎯 ロードマップ

### Phase 1: 基本機能（完了✅）
- [x] GAS API実装
- [x] Googleフォーム自動生成
- [x] 軽量Webサイト実装
- [x] ランキング表示
- [x] プレイヤー統計
- [x] 対戦比較

### Phase 2: 追加機能（🆕 実装中）
- [x] 📷 **画像解析機能**（スクリーンショット自動解析）
- [ ] PWA対応（オフライン閲覧）
- [ ] データエクスポート（CSV/Excel）
- [ ] 詳細フィルター機能
- [ ] カスタムテーマ
- [ ] 多言語対応

### Phase 3: 高度な機能（検討中）
- [ ] リアルタイム更新（WebSocket）
- [ ] AIによるゲーム分析
- [ ] トーナメント機能
- [ ] チーム戦対応

---

## 🤝 貢献

プルリクエスト大歓迎！以下の手順で貢献できます：

1. このリポジトリをFork
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにPush (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

---

## 📝 ライセンス

MIT License

---

## 📞 サポート

- **ドキュメント**: [SETUP.md](docs/SETUP.md)
- **Issues**: GitHub Issues
- **質問**: Discussions

---

## 🙏 謝辞

- [Chart.js](https://www.chartjs.org/) - グラフ描画ライブラリ
- Google Apps Script - バックエンドプラットフォーム
- GitHub Pages - ホスティングサービス

---

## ⚡ 従来版からの移行

現在Streamlit版を使用している場合、以下の手順で移行できます：

1. **データは既存のまま**（スプレッドシートIDを変更しない）
2. 新しいGASプロジェクトを作成
3. Googleフォームを作成
4. Webサイトをデプロイ
5. **並行運用可能**（Streamlit版も継続可能）

LINE botとの連携も維持されます。

---

## 📊 スコア計算ルール

```
[点数] = ([ゲーム終了時の点棒] - [ゲーム開始時の点棒]) ÷ 1000 
       + [順位に応じたウマ] + [参加得点]

- 開始点棒: 四麻25000点、三麻35000点
- ウマ（四麻）: 1位+15, 2位+5, 3位-5, 4位-15
- ウマ（三麻）: 1位+15, 2位±0, 3位-15
- 参加得点: +10
```

---

<div align="center">

**🀄 麻雀を、もっとデータで楽しく！**

[デモを見る](#) | [セットアップガイド](docs/SETUP.md) | [貢献する](#貢献)

</div>
