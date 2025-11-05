/**
 * 麻雀スコア管理システム - Google Apps Script
 * 
 * 機能:
 * 1. データAPI（統計、ランキング、プレイヤー情報）
 * 2. Googleフォーム自動生成
 * 3. LINE bot連携維持（既存構造を保持）
 * 4. スプレッドシート操作
 */

// ========================================
// 設定
// ========================================

const CONFIG = {
  // スプレッドシートID（設定用）
  CONFIG_SPREADSHEET_ID: '10UTxzbPu-yARrO0vcyWC8a529zlDYLZRN9d6kqC2w3g',
  
  // スコア計算設定
  SCORING: {
    startingPoints: {
      '四麻東風': 25000,
      '四麻半荘': 25000,
      '三麻東風': 35000,
      '三麻半荘': 35000
    },
    uma4Player: {
      1: 15,
      2: 5,
      3: -5,
      4: -15
    },
    uma3Player: {
      1: 15,
      2: 0,
      3: -15
    },
    participationPoints: 10,
    pointDivisor: 1000
  },
  
  // シート名
  SHEETS: {
    CONFIG: 'Sheet1',
    PLAYER_MASTER: 'player_master'
  }
};

// ========================================
// Web App エンドポイント
// ========================================

/**
 * GETリクエストハンドラー
 */
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

/**
 * POSTリクエストハンドラー
 */
function doPost(e) {
  try {
    const action = e.parameter.action;
    const data = JSON.parse(e.postData.contents);
    
    switch(action) {
      case 'add_game':
        return addGameRecord(data);
      case 'add_player':
        return addPlayer(data);
      case 'delete_player':
        return deletePlayer(data);
      case 'update_player':
        return updatePlayer(data);
      default:
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'Unknown action' }))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================================
// API ハンドラー
// ========================================

function handleAPI(e) {
  const endpoint = e.parameter.endpoint;
  const seasonKey = e.parameter.season || getCurrentSeason();
  
  let result;
  
  switch(endpoint) {
    case 'rankings':
      result = getRankings(seasonKey);
      break;
    case 'player_stats':
      const playerName = e.parameter.player;
      result = getPlayerStats(seasonKey, playerName);
      break;
    case 'recent_games':
      const limit = parseInt(e.parameter.limit) || 20;
      result = getRecentGames(seasonKey, limit);
      break;
    case 'all_players':
      result = getAllPlayers();
      break;
    case 'seasons':
      result = getAllSeasons();
      break;
    case 'game_records':
      result = getAllGameRecords(seasonKey);
      break;
    case 'head_to_head':
      const player1 = e.parameter.player1;
      const player2 = e.parameter.player2;
      result = getHeadToHeadStats(seasonKey, player1, player2);
      break;
    default:
      result = { error: 'Unknown endpoint' };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// データ取得関数
// ========================================

/**
 * 現在のシーズンを取得
 */
function getCurrentSeason() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.CONFIG_SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.CONFIG);
    
    if (!sheet) {
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const userIdIndex = headers.indexOf('user_id');
    const seasonKeyIndex = headers.indexOf('season_key');
    const isCurrentIndex = headers.indexOf('is_current');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][isCurrentIndex] === 'TRUE' || data[i][isCurrentIndex] === true) {
        return data[i][seasonKeyIndex];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current season:', error);
    return null;
  }
}

/**
 * 全シーズン情報を取得
 */
function getAllSeasons() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.CONFIG_SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.CONFIG);
    
    if (!sheet) {
      return { error: 'Config sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const seasons = [];
    let currentSeason = null;
    
    for (let i = 1; i < data.length; i++) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = data[i][index];
      });
      
      seasons.push({
        key: row.season_key,
        name: row.season_name,
        spreadsheetId: row.spreadsheet_id,
        url: row.spreadsheet_url,
        isCurrent: row.is_current === 'TRUE' || row.is_current === true,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      });
      
      if (row.is_current === 'TRUE' || row.is_current === true) {
        currentSeason = row.season_key;
      }
    }
    
    return {
      seasons: seasons,
      currentSeason: currentSeason
    };
  } catch (error) {
    return { error: error.toString() };
  }
}

/**
 * シーズン情報を取得
 */
function getSeasonInfo(seasonKey) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.CONFIG_SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.CONFIG);
    
    if (!sheet) {
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    for (let i = 1; i < data.length; i++) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = data[i][index];
      });
      
      if (row.season_key === seasonKey) {
        return {
          key: row.season_key,
          name: row.season_name,
          spreadsheetId: row.spreadsheet_id,
          url: row.spreadsheet_url
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting season info:', error);
    return null;
  }
}

/**
 * 全プレイヤーマスターを取得
 */
function getAllPlayers() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.CONFIG_SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.PLAYER_MASTER);
    
    if (!sheet) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const players = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1]) { // player_name列
        players.push({
          name: data[i][1],
          createdAt: data[i][2],
          updatedAt: data[i][3]
        });
      }
    }
    
    return players.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
  } catch (error) {
    return { error: error.toString() };
  }
}

/**
 * 対戦記録を取得
 */
function getAllGameRecords(seasonKey) {
  const seasonInfo = getSeasonInfo(seasonKey);
  
  if (!seasonInfo) {
    return { error: 'Season not found' };
  }
  
  try {
    const ss = SpreadsheetApp.openById(seasonInfo.spreadsheetId);
    const sheet = ss.getSheets()[0];
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const records = [];
    
    for (let i = 1; i < data.length; i++) {
      const record = {
        rowIndex: i + 1,
        date: data[i][0],
        time: data[i][1],
        gameType: data[i][2],
        player1Name: data[i][3],
        player1Score: parseFloat(data[i][4]) || 0,
        player2Name: data[i][5],
        player2Score: parseFloat(data[i][6]) || 0,
        player3Name: data[i][7],
        player3Score: parseFloat(data[i][8]) || 0,
        player4Name: data[i][9],
        player4Score: parseFloat(data[i][10]) || 0,
        notes: data[i][11],
        timestamp: data[i][12]
      };
      
      records.push(record);
    }
    
    return records;
  } catch (error) {
    return { error: error.toString() };
  }
}

/**
 * 最近の対戦記録を取得
 */
function getRecentGames(seasonKey, limit = 20) {
  const records = getAllGameRecords(seasonKey);
  
  if (records.error) {
    return records;
  }
  
  // 日付と時刻でソート（降順）
  records.sort((a, b) => {
    const dateTimeA = `${a.date} ${a.time}`;
    const dateTimeB = `${b.date} ${b.time}`;
    return dateTimeB.localeCompare(dateTimeA);
  });
  
  return records.slice(0, limit);
}

// ========================================
// スコア計算関数
// ========================================

/**
 * ゲームタイプから参加人数を取得
 */
function getPlayerCount(gameType) {
  return gameType.includes('三麻') ? 3 : 4;
}

/**
 * 開始点棒を取得
 */
function getStartingPoints(gameType) {
  return CONFIG.SCORING.startingPoints[gameType] || 25000;
}

/**
 * ウマポイントを取得
 */
function getUmaPoints(rank, playerCount) {
  if (playerCount === 3) {
    return CONFIG.SCORING.uma3Player[rank] || 0;
  }
  return CONFIG.SCORING.uma4Player[rank] || 0;
}

/**
 * ゲームスコアを計算
 */
function calculateGameScore(finalPoints, gameType, rank, playerCount) {
  const startingPoints = getStartingPoints(gameType);
  const umaPoints = getUmaPoints(rank, playerCount);
  const participationPoints = CONFIG.SCORING.participationPoints;
  const divisor = CONFIG.SCORING.pointDivisor;
  
  return (finalPoints - startingPoints) / divisor + umaPoints + participationPoints;
}

/**
 * 順位を計算
 */
function calculateRank(playerScore, allScores) {
  const sorted = allScores.slice().sort((a, b) => b - a);
  return sorted.indexOf(playerScore) + 1;
}

// ========================================
// 統計計算関数
// ========================================

/**
 * ランキングを取得
 */
function getRankings(seasonKey) {
  const records = getAllGameRecords(seasonKey);
  
  if (records.error) {
    return records;
  }
  
  const playerStats = {};
  
  // 各記録を処理
  records.forEach(record => {
    const players = [];
    
    for (let i = 1; i <= 4; i++) {
      const name = record[`player${i}Name`];
      const score = record[`player${i}Score`];
      
      if (name && name.trim()) {
        players.push({ name, score });
      }
    }
    
    if (players.length === 0) return;
    
    const gameType = record.gameType;
    const playerCount = getPlayerCount(gameType);
    const allScores = players.map(p => p.score);
    
    players.forEach(player => {
      if (!playerStats[player.name]) {
        playerStats[player.name] = {
          name: player.name,
          totalGames: 0,
          totalScore: 0,
          totalRawScore: 0,
          maxScore: -Infinity,
          minScore: Infinity,
          ranks: { 1: 0, 2: 0, 3: 0, 4: 0 }
        };
      }
      
      const stats = playerStats[player.name];
      const rank = calculateRank(player.score, allScores);
      const gameScore = calculateGameScore(player.score, gameType, rank, playerCount);
      
      stats.totalGames++;
      stats.totalScore += gameScore;
      stats.totalRawScore += player.score;
      stats.maxScore = Math.max(stats.maxScore, player.score);
      stats.minScore = Math.min(stats.minScore, player.score);
      stats.ranks[rank]++;
    });
  });
  
  // ランキングデータを作成
  const rankings = Object.values(playerStats).map(stats => {
    const avgScore = stats.totalScore / stats.totalGames;
    const avgRawScore = stats.totalRawScore / stats.totalGames;
    const avgRank = (
      stats.ranks[1] * 1 + 
      stats.ranks[2] * 2 + 
      stats.ranks[3] * 3 + 
      stats.ranks[4] * 4
    ) / stats.totalGames;
    const winRate = (stats.ranks[1] / stats.totalGames) * 100;
    
    return {
      name: stats.name,
      totalGames: stats.totalGames,
      avgScore: Math.round(avgScore * 100) / 100,
      avgRawScore: Math.round(avgRawScore * 10) / 10,
      avgRank: Math.round(avgRank * 100) / 100,
      winRate: Math.round(winRate * 10) / 10,
      maxScore: stats.maxScore,
      minScore: stats.minScore,
      rankDistribution: stats.ranks
    };
  });
  
  // 平均スコアでソート
  rankings.sort((a, b) => b.avgScore - a.avgScore);
  
  return rankings;
}

/**
 * プレイヤー統計を取得
 */
function getPlayerStats(seasonKey, playerName) {
  const records = getAllGameRecords(seasonKey);
  
  if (records.error) {
    return records;
  }
  
  const playerRecords = [];
  
  records.forEach((record, index) => {
    for (let i = 1; i <= 4; i++) {
      const name = record[`player${i}Name`];
      
      if (name === playerName) {
        const players = [];
        
        for (let j = 1; j <= 4; j++) {
          const pName = record[`player${j}Name`];
          const pScore = record[`player${j}Score`];
          
          if (pName && pName.trim()) {
            players.push({ name: pName, score: pScore });
          }
        }
        
        const playerScore = record[`player${i}Score`];
        const allScores = players.map(p => p.score);
        const rank = calculateRank(playerScore, allScores);
        const playerCount = getPlayerCount(record.gameType);
        const gameScore = calculateGameScore(
          playerScore, 
          record.gameType, 
          rank, 
          playerCount
        );
        
        playerRecords.push({
          gameId: index,
          date: record.date,
          time: record.time,
          gameType: record.gameType,
          score: playerScore,
          rank: rank,
          gameScore: gameScore,
          otherPlayers: players.filter(p => p.name !== playerName)
        });
        
        break;
      }
    }
  });
  
  if (playerRecords.length === 0) {
    return {
      name: playerName,
      totalGames: 0,
      avgScore: 0,
      avgRawScore: 0,
      totalScore: 0,
      maxScore: 0,
      minScore: 0,
      ranks: { 1: 0, 2: 0, 3: 0, 4: 0 },
      avgRank: 0,
      winRate: 0,
      records: []
    };
  }
  
  // 統計を計算
  let totalScore = 0;
  let totalRawScore = 0;
  let maxScore = -Infinity;
  let minScore = Infinity;
  const ranks = { 1: 0, 2: 0, 3: 0, 4: 0 };
  
  playerRecords.forEach(record => {
    totalScore += record.gameScore;
    totalRawScore += record.score;
    maxScore = Math.max(maxScore, record.score);
    minScore = Math.min(minScore, record.score);
    ranks[record.rank]++;
  });
  
  const avgScore = totalScore / playerRecords.length;
  const avgRawScore = totalRawScore / playerRecords.length;
  const avgRank = (
    ranks[1] * 1 + 
    ranks[2] * 2 + 
    ranks[3] * 3 + 
    ranks[4] * 4
  ) / playerRecords.length;
  const winRate = (ranks[1] / playerRecords.length) * 100;
  
  return {
    name: playerName,
    totalGames: playerRecords.length,
    avgScore: Math.round(avgScore * 100) / 100,
    avgRawScore: Math.round(avgRawScore * 10) / 10,
    totalScore: Math.round(totalScore * 100) / 100,
    maxScore: maxScore,
    minScore: minScore,
    ranks: ranks,
    avgRank: Math.round(avgRank * 100) / 100,
    winRate: Math.round(winRate * 10) / 10,
    records: playerRecords
  };
}

/**
 * 対戦成績を取得（2人比較）
 */
function getHeadToHeadStats(seasonKey, player1, player2) {
  const records = getAllGameRecords(seasonKey);
  
  if (records.error) {
    return records;
  }
  
  const commonGames = [];
  
  records.forEach(record => {
    let player1Data = null;
    let player2Data = null;
    
    for (let i = 1; i <= 4; i++) {
      const name = record[`player${i}Name`];
      const score = record[`player${i}Score`];
      
      if (name === player1) {
        player1Data = { score, position: i };
      } else if (name === player2) {
        player2Data = { score, position: i };
      }
    }
    
    if (player1Data && player2Data) {
      commonGames.push({
        date: record.date,
        time: record.time,
        gameType: record.gameType,
        player1Score: player1Data.score,
        player2Score: player2Data.score,
        winner: player1Data.score > player2Data.score ? player1 : 
                player1Data.score < player2Data.score ? player2 : 'draw'
      });
    }
  });
  
  const player1Wins = commonGames.filter(g => g.winner === player1).length;
  const player2Wins = commonGames.filter(g => g.winner === player2).length;
  const draws = commonGames.filter(g => g.winner === 'draw').length;
  
  return {
    player1: player1,
    player2: player2,
    totalGames: commonGames.length,
    player1Wins: player1Wins,
    player2Wins: player2Wins,
    draws: draws,
    games: commonGames
  };
}

// ========================================
// データ追加・更新関数
// ========================================

/**
 * 対戦記録を追加
 */
function addGameRecord(data) {
  const seasonInfo = getSeasonInfo(data.season);
  
  if (!seasonInfo) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Season not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    const ss = SpreadsheetApp.openById(seasonInfo.spreadsheetId);
    const sheet = ss.getSheets()[0];
    
    const rowData = [
      data.date || '',
      data.time || '',
      data.gameType || '四麻半荘',
      data.player1Name || '',
      data.player1Score || 0,
      data.player2Name || '',
      data.player2Score || 0,
      data.player3Name || '',
      data.player3Score || 0,
      data.player4Name || '',
      data.player4Score || 0,
      data.notes || '',
      new Date().toLocaleString('ja-JP')
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: '記録を追加しました' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * プレイヤーを追加
 */
function addPlayer(data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.CONFIG_SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.PLAYER_MASTER);
    
    if (!sheet) {
      throw new Error('player_master sheet not found');
    }
    
    // 既存チェック
    const existingData = sheet.getDataRange().getValues();
    for (let i = 1; i < existingData.length; i++) {
      if (existingData[i][1] === data.playerName) {
        return ContentService
          .createTextOutput(JSON.stringify({ 
            error: 'プレイヤーは既に存在します' 
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    const now = new Date().toLocaleString('ja-JP');
    const rowData = [
      'user_id',  // TODO: 実際のユーザーIDを使用
      data.playerName,
      now,
      now
    ];
    
    sheet.appendRow(rowData);
    
    // フォームのプレイヤーリストを自動更新
    try {
      updateGameFormPlayerListAuto();
    } catch (updateError) {
      Logger.log('⚠️ フォーム更新エラー: ' + updateError.toString());
      // フォーム更新に失敗してもプレイヤー追加は成功とする
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'プレイヤーを追加しました' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * プレイヤーを削除
 */
function deletePlayer(data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.CONFIG_SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.PLAYER_MASTER);
    
    if (!sheet) {
      throw new Error('player_master sheet not found');
    }
    
    const existingData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < existingData.length; i++) {
      if (existingData[i][1] === data.playerName) {
        sheet.deleteRow(i + 1);
        
        // フォームのプレイヤーリストを自動更新
        try {
          updateGameFormPlayerListAuto();
        } catch (updateError) {
          Logger.log('⚠️ フォーム更新エラー: ' + updateError.toString());
        }
        
        return ContentService
          .createTextOutput(JSON.stringify({ 
            success: true, 
            message: 'プレイヤーを削除しました' 
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: 'プレイヤーが見つかりません' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * プレイヤー名を更新
 */
function updatePlayer(data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.CONFIG_SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.PLAYER_MASTER);
    
    if (!sheet) {
      throw new Error('player_master sheet not found');
    }
    
    const existingData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < existingData.length; i++) {
      if (existingData[i][1] === data.oldName) {
        sheet.getRange(i + 1, 2).setValue(data.newName);
        sheet.getRange(i + 1, 4).setValue(new Date().toLocaleString('ja-JP'));
        
        // フォームのプレイヤーリストを自動更新
        try {
          updateGameFormPlayerListAuto();
        } catch (updateError) {
          Logger.log('⚠️ フォーム更新エラー: ' + updateError.toString());
        }
        
        return ContentService
          .createTextOutput(JSON.stringify({ 
            success: true, 
            message: 'プレイヤー名を更新しました' 
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: 'プレイヤーが見つかりません' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================================
// ホームページ提供
// ========================================

function serveHomePage() {
  const html = HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('麻雀スコアボード')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  
  return html;
}

// ========================================
// ユーティリティ関数
// ========================================

/**
 * テスト用関数
 */
function testAPI() {
  const seasonKey = getCurrentSeason();
  Logger.log('Current Season: ' + seasonKey);
  
  const rankings = getRankings(seasonKey);
  Logger.log('Rankings: ' + JSON.stringify(rankings));
  
  const players = getAllPlayers();
  Logger.log('Players: ' + JSON.stringify(players));
}
