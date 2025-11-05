/**
 * 画像解析機能
 * スクリーンショットから麻雀スコアを自動抽出
 */

// ========================================
// 設定
// ========================================

// 画像解析用の設定
const IMAGE_CONFIG = {
  // APIキーはScript Propertiesから取得（セキュリティのため）
  // 設定方法: GASエディタ → プロジェクトの設定 → スクリプト プロパティ
  VISION_API_KEY: PropertiesService.getScriptProperties().getProperty('VISION_API_KEY'),
  OPENAI_API_KEY: PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY'),
  
  // 制限
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  
  // OpenAI設定
  OPENAI_MODEL: 'gpt-4o-mini',
  OPENAI_TEMPERATURE: 0.1,
};

// ========================================
// メイン処理
// ========================================

/**
 * POST リクエスト処理（画像解析）
 */
function doPostImageAnalysis(e) {
  try {
    Logger.log('📷 画像解析リクエスト受信');
    
    // パラメータ取得
    const imageData = e.parameter.imageData;
    
    if (!imageData) {
      throw new Error('画像データが含まれていません');
    }
    
    // APIキーチェック
    if (!IMAGE_CONFIG.VISION_API_KEY || !IMAGE_CONFIG.OPENAI_API_KEY) {
      throw new Error('APIキーが設定されていません。Script Propertiesを確認してください。');
    }
    
    // 画像検証
    validateImage(imageData);
    
    // 1. Google Vision APIでOCR（テキスト抽出）
    Logger.log('🔍 Vision API: テキスト抽出開始');
    const extractedText = extractTextWithVision(imageData);
    Logger.log('✅ 抽出されたテキスト: ' + extractedText.substring(0, 100) + '...');
    
    // 2. OpenAI APIで構造化データに変換
    Logger.log('🤖 OpenAI API: データ解析開始');
    const gameData = parseTextWithOpenAI(extractedText);
    Logger.log('✅ 解析結果: ' + JSON.stringify(gameData));
    
    // 3. スプレッドシートに保存
    Logger.log('💾 スプレッドシートに保存中');
    const result = saveGameDataToSheet(gameData);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: '画像を解析してデータを保存しました',
        data: result
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('❌ エラー: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================================
// 画像検証
// ========================================

function validateImage(base64Data) {
  // サイズチェック（Base64デコード後のおおよそのサイズ）
  const estimatedSize = (base64Data.length * 3) / 4;
  if (estimatedSize > IMAGE_CONFIG.MAX_IMAGE_SIZE) {
    throw new Error('画像サイズが大きすぎます（最大10MB）');
  }
  
  return true;
}

// ========================================
// Vision API: OCR（テキスト抽出）
// ========================================

function extractTextWithVision(base64Image) {
  const apiKey = IMAGE_CONFIG.VISION_API_KEY;
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
  
  const payload = {
    requests: [{
      image: {
        content: base64Image
      },
      features: [{
        type: 'TEXT_DETECTION',
        maxResults: 1
      }]
    }]
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());
  
  // エラーチェック
  if (response.getResponseCode() !== 200) {
    Logger.log('Vision API エラー: ' + JSON.stringify(result));
    throw new Error('Vision API エラー: ' + (result.error?.message || 'Unknown error'));
  }
  
  // テキスト抽出
  if (result.responses && result.responses[0].textAnnotations) {
    const extractedText = result.responses[0].textAnnotations[0].description;
    return extractedText;
  } else {
    throw new Error('画像からテキストを抽出できませんでした');
  }
}

// ========================================
// OpenAI API: 構造化データ解析
// ========================================

function parseTextWithOpenAI(text) {
  const apiKey = IMAGE_CONFIG.OPENAI_API_KEY;
  const url = 'https://api.openai.com/v1/chat/completions';
  
  // システムプロンプト
  const systemPrompt = `あなたは麻雀の対戦記録を解析するエキスパートです。
OCRで抽出されたテキストから以下の情報を抽出してJSON形式で返してください。

【抽出項目】
- players: プレイヤー名の配列（順位順）
- scores: 最終点棒の配列（プレイヤー順）
- gameType: "四麻" または "三麻"
- roundType: "東風" または "半荘"（不明な場合は "半荘"）
- date: "YYYY-MM-DD" 形式（不明な場合は今日の日付）
- time: "HH:MM" 形式（不明な場合は "12:00"）

【JSON形式】
{
  "players": ["プレイヤー1", "プレイヤー2", ...],
  "scores": [30000, 25000, ...],
  "gameType": "四麻",
  "roundType": "半荘",
  "date": "2025-11-05",
  "time": "14:30"
}

【注意事項】
- プレイヤー名に番号が付いている場合は除去（例: "1. 山田太郎" → "山田太郎"）
- 点数は数値のみ（カンマなし）
- プレイヤー数と点数の配列長は一致させる
- 対戦タイプは"四麻"か"三麻"のみ
- ラウンドタイプは"東風"か"半荘"のみ`;

  const payload = {
    model: IMAGE_CONFIG.OPENAI_MODEL,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `以下のテキストから麻雀の対戦記録を抽出してください：\n\n${text}`
      }
    ],
    temperature: IMAGE_CONFIG.OPENAI_TEMPERATURE,
    response_format: { type: 'json_object' }
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());
  
  // エラーチェック
  if (response.getResponseCode() !== 200) {
    Logger.log('OpenAI API エラー: ' + JSON.stringify(result));
    throw new Error('OpenAI API エラー: ' + (result.error?.message || 'Unknown error'));
  }
  
  // 結果パース
  const content = result.choices[0].message.content;
  const gameData = JSON.parse(content);
  
  // データ検証
  validateGameData(gameData);
  
  return gameData;
}

// ========================================
// データ検証
// ========================================

function validateGameData(data) {
  // 必須フィールドチェック
  if (!data.players || !Array.isArray(data.players) || data.players.length === 0) {
    throw new Error('プレイヤー情報が不正です');
  }
  
  if (!data.scores || !Array.isArray(data.scores) || data.scores.length === 0) {
    throw new Error('スコア情報が不正です');
  }
  
  if (data.players.length !== data.scores.length) {
    throw new Error('プレイヤー数とスコア数が一致しません');
  }
  
  if (!['四麻', '三麻'].includes(data.gameType)) {
    throw new Error('対戦タイプが不正です（四麻または三麻）');
  }
  
  if (!['東風', '半荘'].includes(data.roundType)) {
    throw new Error('ラウンドタイプが不正です（東風または半荘）');
  }
  
  // プレイヤー数チェック
  const expectedPlayers = data.gameType === '四麻' ? 4 : 3;
  if (data.players.length !== expectedPlayers) {
    throw new Error(`${data.gameType}はプレイヤー数が${expectedPlayers}人である必要があります`);
  }
  
  return true;
}

// ========================================
// スプレッドシートへの保存
// ========================================

function saveGameDataToSheet(gameData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(getCurrentSeason() + '_game_records');
  
  if (!sheet) {
    throw new Error('シートが見つかりません: ' + getCurrentSeason() + '_game_records');
  }
  
  // 開始点棒を取得
  const startPoints = gameData.gameType === '四麻' ? 25000 : 35000;
  
  // プレイヤーマスターと照合
  const playerMaster = getPlayerMaster();
  const validatedPlayers = gameData.players.map(name => {
    // プレイヤー名を検証（存在しない場合は追加）
    if (!playerMaster.includes(name)) {
      Logger.log(`⚠️ 新規プレイヤー: ${name}`);
      // 自動でプレイヤーマスターに追加
      addPlayerToMaster(name);
    }
    return name;
  });
  
  // 各プレイヤーのレコードを作成
  const timestamp = new Date();
  const records = [];
  
  gameData.scores.forEach((score, index) => {
    const playerName = validatedPlayers[index];
    const rank = index + 1; // 順位はインデックス+1
    
    // 点数計算
    const uma = calculateUma(rank, gameData.gameType);
    const rawScore = (score - startPoints) / 1000;
    const finalScore = rawScore + uma + 10; // 参加得点+10
    
    records.push([
      timestamp,                  // タイムスタンプ
      gameData.date,             // 対戦日
      gameData.time,             // 対戦時刻
      gameData.gameType,         // 対戦タイプ
      gameData.roundType,        // ラウンドタイプ
      playerName,                // プレイヤー名
      score,                     // 最終点棒
      rank,                      // 順位
      finalScore.toFixed(2),     // スコア
      '画像解析により自動入力'     // メモ
    ]);
  });
  
  // シートに追加
  if (records.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, records.length, records[0].length)
         .setValues(records);
    Logger.log(`✅ ${records.length}件のレコードを保存しました`);
  }
  
  return {
    recordsAdded: records.length,
    gameType: gameData.gameType,
    players: validatedPlayers
  };
}

// ========================================
// ヘルパー関数
// ========================================

/**
 * ウマを計算
 */
function calculateUma(rank, gameType) {
  if (gameType === '四麻') {
    // 四麻: 1位+15, 2位+5, 3位-5, 4位-15
    const umas = [15, 5, -5, -15];
    return umas[rank - 1];
  } else {
    // 三麻: 1位+15, 2位±0, 3位-15
    const umas = [15, 0, -15];
    return umas[rank - 1];
  }
}

/**
 * プレイヤーマスターを取得
 */
function getPlayerMaster() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('player_master');
  const data = sheet.getDataRange().getValues();
  
  // ヘッダー行をスキップして、名前列（2列目）を取得
  return data.slice(1).map(row => row[1]).filter(name => name);
}

/**
 * プレイヤーマスターに新規プレイヤーを追加
 */
function addPlayerToMaster(playerName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('player_master');
  
  // 最後の行を取得
  const lastRow = sheet.getLastRow();
  const newId = lastRow; // ID = 行番号（ヘッダー除く）
  
  // 追加
  sheet.appendRow([
    newId,
    playerName,
    new Date(), // 登録日時
    '画像解析により自動追加'
  ]);
  
  Logger.log(`✅ 新規プレイヤーを追加: ${playerName}`);
  
  // フォームのプレイヤーリストを更新
  try {
    updateGameFormPlayerListAuto();
  } catch (error) {
    Logger.log('⚠️ フォーム更新エラー: ' + error.toString());
  }
}

// ========================================
// テスト用関数
// ========================================

/**
 * セットアップテスト
 */
function testImageAnalysisSetup() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const visionKey = scriptProperties.getProperty('VISION_API_KEY');
  const openaiKey = scriptProperties.getProperty('OPENAI_API_KEY');
  
  Logger.log('=== 画像解析セットアップチェック ===');
  Logger.log('Vision API Key: ' + (visionKey ? '設定済み ✓' : '未設定 ✗'));
  Logger.log('OpenAI API Key: ' + (openaiKey ? '設定済み ✓' : '未設定 ✗'));
  
  if (!visionKey || !openaiKey) {
    throw new Error('❌ APIキーが設定されていません。Script Propertiesを確認してください。');
  }
  
  Logger.log('✅ APIキーの設定が完了しています');
  return true;
}

/**
 * サンプルテキスト解析テスト
 */
function testParseText() {
  const sampleText = `
麻雀 対戦結果

日付: 2025-11-05
時刻: 14:30

1位: 山田太郎 - 35000点
2位: 佐藤花子 - 28000点
3位: 鈴木一郎 - 22000点
4位: 田中美咲 - 15000点

対戦タイプ: 四麻
ラウンド: 半荘
  `;
  
  Logger.log('=== テキスト解析テスト ===');
  const result = parseTextWithOpenAI(sampleText);
  Logger.log('解析結果: ' + JSON.stringify(result, null, 2));
  
  return result;
}
