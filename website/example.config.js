/**
 * アプリケーション設定ファイル（サンプル）
 * 
 * このファイルをコピーして config.js を作成し、実際の値を設定してください
 * 
 * コピー方法:
 * cp example.config.js config.js
 */

const APP_CONFIG = {
  // GAS Web App URL（デプロイ後に取得）
  // 取得方法: GASエディタ → デプロイ → Web AppのURL
  // 例: 'https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXXXXXX/exec'
  GAS_API_URL: 'YOUR_GAS_WEB_APP_URL_HERE',
  
  // Googleフォーム URL（対戦記録入力用）
  // 取得方法: フォーム編集画面 → 送信 → リンク
  // 例: 'https://docs.google.com/forms/d/e/1FAIpQLSdXXXXXXXXXXXXXXXXXXXXXX/viewform'
  GAME_FORM_URL: 'YOUR_GAME_FORM_URL_HERE',
  
  // Googleフォーム URL（プレイヤー管理用）
  PLAYER_FORM_URL: 'YOUR_PLAYER_FORM_URL_HERE',
  
  // デフォルト設定
  DEFAULT_RECENT_GAMES_LIMIT: 20,      // 最近の対戦記録の表示件数
  REFRESH_INTERVAL: 60000,             // 自動更新間隔（ミリ秒）0で無効化
  
  // デバッグモード（開発時のみtrue）
  DEBUG_MODE: false
};

// URLが設定されているかチェック
function checkConfig() {
  if (APP_CONFIG.GAS_API_URL === 'YOUR_GAS_WEB_APP_URL_HERE') {
    console.warn('⚠️ GAS Web App URLが設定されていません。example.config.jsをコピーしてconfig.jsを作成し、正しいURLを設定してください。');
    return false;
  }
  return true;
}
