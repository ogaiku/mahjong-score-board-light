/**
 * アプリケーション設定ファイル
 * 
 * このファイルを編集して、GAS Web AppのURLとGoogleフォームのURLを設定してください
 */

const APP_CONFIG = {
  // GAS Web App URL（デプロイ後に取得）
  // 例: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
  GAS_API_URL: 'https://script.google.com/macros/s/AKfycbwP28tt5bsSvHJaciIcOJccFyqsG9TXQgLv6Pai_-1YW7DHoDUgdSiaYPfgsgA6kebuwQ/exec',
  
  // Googleフォーム URL（対戦記録入力用）
  GAME_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSdeDHH9OyDtz7lxwRl5cW1lVrMKcDSwunFVJ-8vQ1dSbDNhHQ/viewform',
  
  // Googleフォーム URL（プレイヤー管理用）
  PLAYER_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSd7Hnq58VKftUAMo2s5OwazLF2QbrA2QbxJyX6nLcH2LoKWMQ/viewform',
  
  // デフォルト設定
  DEFAULT_RECENT_GAMES_LIMIT: 20,
  REFRESH_INTERVAL: 60000, // 60秒（自動更新間隔）
  
  // デバッグモード
  DEBUG_MODE: false
};

// URLが設定されているかチェック
function checkConfig() {
  if (APP_CONFIG.GAS_API_URL === 'YOUR_GAS_WEB_APP_URL_HERE') {
    console.warn('⚠️ GAS Web App URLが設定されていません。config.jsを編集してください。');
    return false;
  }
  return true;
}
