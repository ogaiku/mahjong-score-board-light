/**
 * Googleフォーム自動生成スクリプト
 * 
 * 使い方:
 * 1. GASエディタでこのスクリプトを貼り付け
 * 2. createMahjongGameForm() を実行
 * 3. createPlayerManagementForm() を実行
 */

/**
 * 対戦記録入力フォームを作成
 */
function createMahjongGameForm() {
  try {
    // フォームを作成
    const form = FormApp.create('麻雀対戦記録入力フォーム');
    
    // 説明を設定
    form.setDescription('麻雀の対戦結果を記録するフォームです。全てのプレイヤーの点数を入力してください。');
    
    // 回答を設定スプレッドシートに送信
    const seasonKey = getCurrentSeason();
    const seasonInfo = getSeasonInfo(seasonKey);
    
    if (seasonInfo) {
      const ss = SpreadsheetApp.openById(seasonInfo.spreadsheetId);
      form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    }
    
    // 対戦日（日付）
    form.addDateItem()
      .setTitle('対戦日')
      .setRequired(true)
      .setHelpText('対戦した日付を選択してください');
    
    // 対戦時刻（時間）
    form.addTimeItem()
      .setTitle('対戦時刻')
      .setRequired(false)
      .setHelpText('対戦開始時刻（任意）');
    
    // 対戦タイプ（選択式）
    form.addMultipleChoiceItem()
      .setTitle('対戦タイプ')
      .setChoiceValues(['四麻東風', '四麻半荘', '三麻東風', '三麻半荘'])
      .setRequired(true);
    
    // プレイヤー情報セクション
    form.addSectionHeaderItem()
      .setTitle('プレイヤー情報')
      .setHelpText('各プレイヤーの名前と最終点棒を入力してください');
    
    // player_masterから取得したプレイヤーリスト
    const players = getAllPlayers();
    const playerNames = players.map(p => p.name);
    
    // プレイヤー1
    if (playerNames.length > 0) {
      form.addListItem()
        .setTitle('プレイヤー1名')
        .setChoiceValues(playerNames)
        .setRequired(true);
    } else {
      form.addTextItem()
        .setTitle('プレイヤー1名')
        .setRequired(true);
    }
    
    form.addTextItem()
      .setTitle('プレイヤー1点数')
      .setRequired(true)
      .setValidation(FormApp.createTextValidation()
        .setHelpText('半角数字で入力してください（例: 28000）')
        .requireNumber()
        .build());
    
    // プレイヤー2
    if (playerNames.length > 0) {
      form.addListItem()
        .setTitle('プレイヤー2名')
        .setChoiceValues(playerNames)
        .setRequired(true);
    } else {
      form.addTextItem()
        .setTitle('プレイヤー2名')
        .setRequired(true);
    }
    
    form.addTextItem()
      .setTitle('プレイヤー2点数')
      .setRequired(true)
      .setValidation(FormApp.createTextValidation()
        .setHelpText('半角数字で入力してください（例: 25000）')
        .requireNumber()
        .build());
    
    // プレイヤー3
    if (playerNames.length > 0) {
      form.addListItem()
        .setTitle('プレイヤー3名')
        .setChoiceValues(playerNames)
        .setRequired(true);
    } else {
      form.addTextItem()
        .setTitle('プレイヤー3名')
        .setRequired(true);
    }
    
    form.addTextItem()
      .setTitle('プレイヤー3点数')
      .setRequired(true)
      .setValidation(FormApp.createTextValidation()
        .setHelpText('半角数字で入力してください（例: 22000）')
        .requireNumber()
        .build());
    
    // プレイヤー4（三麻の場合は不要）
    if (playerNames.length > 0) {
      form.addListItem()
        .setTitle('プレイヤー4名（四麻のみ）')
        .setChoiceValues(playerNames)
        .setRequired(false);
    } else {
      form.addTextItem()
        .setTitle('プレイヤー4名（四麻のみ）')
        .setRequired(false);
    }
    
    form.addTextItem()
      .setTitle('プレイヤー4点数（四麻のみ）')
      .setRequired(false)
      .setValidation(FormApp.createTextValidation()
        .setHelpText('半角数字で入力してください（例: 25000）')
        .requireNumber()
        .build());
    
    // メモ（任意）
    form.addParagraphTextItem()
      .setTitle('メモ')
      .setRequired(false)
      .setHelpText('特記事項があれば入力してください（任意）');
    
    // 確認メッセージ
    form.setConfirmationMessage('対戦記録を送信しました。ありがとうございます！');
    
    // フォームのURLを取得
    const formUrl = form.getPublishedUrl();
    const editUrl = form.getEditUrl();
    
    Logger.log('✅ 対戦記録フォームを作成しました');
    Logger.log('📝 フォームURL（共有用）: ' + formUrl);
    Logger.log('✏️ 編集URL: ' + editUrl);
    
    // スプレッドシートにフォーム回答を自動整形するトリガーを設定
    if (seasonInfo) {
      createFormSubmitTrigger(form, seasonInfo.spreadsheetId);
    }
    
    return {
      formUrl: formUrl,
      editUrl: editUrl,
      formId: form.getId()
    };
    
  } catch (error) {
    Logger.log('❌ エラー: ' + error.toString());
    throw error;
  }
}

/**
 * プレイヤー管理フォームを作成
 */
function createPlayerManagementForm() {
  try {
    // フォームを作成
    const form = FormApp.create('麻雀プレイヤー管理フォーム');
    
    // 説明を設定
    form.setDescription('新しいプレイヤーを登録するフォームです。');
    
    // 操作タイプ
    form.addMultipleChoiceItem()
      .setTitle('操作')
      .setChoiceValues(['プレイヤーを追加', 'プレイヤー名を変更'])
      .setRequired(true)
      .setHelpText('実行したい操作を選択してください');
    
    // プレイヤー名（新規追加用）
    form.addTextItem()
      .setTitle('プレイヤー名（追加時）')
      .setRequired(false)
      .setHelpText('新しく追加するプレイヤー名を入力してください');
    
    // 既存プレイヤー（変更時）
    const players = getAllPlayers();
    const playerNames = players.map(p => p.name);
    
    if (playerNames.length > 0) {
      form.addListItem()
        .setTitle('変更対象プレイヤー（変更時）')
        .setChoiceValues(playerNames)
        .setRequired(false)
        .setHelpText('名前を変更するプレイヤーを選択してください');
    }
    
    // 新しいプレイヤー名（変更用）
    form.addTextItem()
      .setTitle('新しいプレイヤー名（変更時）')
      .setRequired(false)
      .setHelpText('変更後のプレイヤー名を入力してください');
    
    // 確認メッセージ
    form.setConfirmationMessage('送信しました。管理者が確認後、反映されます。');
    
    // フォームのURLを取得
    const formUrl = form.getPublishedUrl();
    const editUrl = form.getEditUrl();
    
    Logger.log('✅ プレイヤー管理フォームを作成しました');
    Logger.log('📝 フォームURL（共有用）: ' + formUrl);
    Logger.log('✏️ 編集URL: ' + editUrl);
    
    return {
      formUrl: formUrl,
      editUrl: editUrl,
      formId: form.getId()
    };
    
  } catch (error) {
    Logger.log('❌ エラー: ' + error.toString());
    throw error;
  }
}

/**
 * フォーム送信時のトリガーを作成
 */
function createFormSubmitTrigger(form, spreadsheetId) {
  try {
    ScriptApp.newTrigger('onFormSubmit')
      .forForm(form)
      .onFormSubmit()
      .create();
    
    Logger.log('✅ フォーム送信トリガーを作成しました');
  } catch (error) {
    Logger.log('⚠️ トリガー作成エラー: ' + error.toString());
  }
}

/**
 * フォーム送信時の処理
 * スプレッドシートのフォーマットを整形
 */
function onFormSubmit(e) {
  try {
    const itemResponses = e.response.getItemResponses();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const formResponseSheet = ss.getSheets()[0]; // フォーム回答シート
    const dataSheet = ss.getSheetByName('Sheet1') || ss.getSheets()[1]; // データシート
    
    // フォーム回答の最終行を取得
    const lastRow = formResponseSheet.getLastRow();
    const responseData = formResponseSheet.getRange(lastRow, 1, 1, formResponseSheet.getLastColumn()).getValues()[0];
    
    // タイムスタンプ
    const timestamp = responseData[0];
    
    // 対戦日
    let gameDate = '';
    if (responseData[1]) {
      const date = new Date(responseData[1]);
      gameDate = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy/MM/dd');
    }
    
    // 対戦時刻
    let gameTime = '';
    if (responseData[2]) {
      gameTime = responseData[2];
    }
    
    // 対戦タイプ
    const gameType = responseData[3] || '四麻半荘';
    
    // プレイヤー情報
    const player1Name = responseData[4] || '';
    const player1Score = parseFloat(responseData[5]) || 0;
    const player2Name = responseData[6] || '';
    const player2Score = parseFloat(responseData[7]) || 0;
    const player3Name = responseData[8] || '';
    const player3Score = parseFloat(responseData[9]) || 0;
    const player4Name = responseData[10] || '';
    const player4Score = parseFloat(responseData[11]) || 0;
    const notes = responseData[12] || '';
    
    // データシートに追加
    if (dataSheet) {
      const dataRow = [
        gameDate,
        gameTime,
        gameType,
        player1Name,
        player1Score,
        player2Name,
        player2Score,
        player3Name,
        player3Score,
        player4Name,
        player4Score,
        notes,
        Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm:ss')
      ];
      
      dataSheet.appendRow(dataRow);
      Logger.log('✅ データを追加しました: ' + gameDate + ' ' + gameType);
    }
    
  } catch (error) {
    Logger.log('❌ フォーム送信処理エラー: ' + error.toString());
  }
}

/**
 * プレイヤーリストを更新（定期実行推奨）
 * フォームIDを指定して実行してください
 */
function updatePlayerListInForm(formId) {
  try {
    const players = getAllPlayers();
    const playerNames = players.map(p => p.name);
    
    if (playerNames.length === 0) {
      Logger.log('⚠️ プレイヤーマスターが空です');
      return;
    }
    
    // フォームを取得
    const form = FormApp.openById(formId);
    
    let updatedCount = 0;
    
    // プレイヤー選択項目を更新
    form.getItems().forEach(item => {
      if (item.getType() === FormApp.ItemType.LIST) {
        const listItem = item.asListItem();
        const title = listItem.getTitle();
        
        // プレイヤー名の選択項目のみ更新
        if (title.includes('プレイヤー') && title.includes('名')) {
          listItem.setChoiceValues(playerNames);
          updatedCount++;
          Logger.log(`✅ 更新: ${title}`);
        }
      }
    });
    
    Logger.log(`✅ プレイヤーリストを更新しました（${updatedCount}項目、${playerNames.length}人）`);
    return updatedCount;
    
  } catch (error) {
    Logger.log('❌ プレイヤーリスト更新エラー: ' + error.toString());
    throw error;
  }
}

/**
 * 対戦記録フォームのプレイヤーリストを更新
 * フォームIDは createMahjongGameForm() の実行ログから取得
 */
function updateGameFormPlayerList() {
  // TODO: フォーム作成時に取得したフォームIDを設定
  const gameFormId = 'YOUR_GAME_FORM_ID';
  
  if (gameFormId === 'YOUR_GAME_FORM_ID') {
    Logger.log('⚠️ フォームIDを設定してください');
    Logger.log('フォームIDは createMahjongGameForm() の実行ログから取得できます');
    return;
  }
  
  return updatePlayerListInForm(gameFormId);
}

/**
 * プレイヤー管理フォーム送信時の処理
 * プレイヤー追加・変更後に自動的にフォームを更新
 */
function onPlayerFormSubmit(e) {
  try {
    const itemResponses = e.response.getItemResponses();
    
    // 操作タイプを取得
    let operation = '';
    let playerName = '';
    let oldName = '';
    let newName = '';
    
    itemResponses.forEach(itemResponse => {
      const title = itemResponse.getItem().getTitle();
      const response = itemResponse.getResponse();
      
      if (title === '操作') {
        operation = response;
      } else if (title.includes('プレイヤー名（追加時）')) {
        playerName = response;
      } else if (title.includes('変更対象プレイヤー')) {
        oldName = response;
      } else if (title.includes('新しいプレイヤー名')) {
        newName = response;
      }
    });
    
    // player_masterに反映（Code.gsの関数を使用）
    if (operation === 'プレイヤーを追加' && playerName) {
      // プレイヤー追加処理
      Logger.log(`プレイヤー追加リクエスト: ${playerName}`);
      // TODO: player_masterへの追加処理を実装
      
    } else if (operation === 'プレイヤー名を変更' && oldName && newName) {
      // プレイヤー名変更処理
      Logger.log(`プレイヤー名変更リクエスト: ${oldName} → ${newName}`);
      // TODO: player_masterの更新処理を実装
    }
    
    // フォームのプレイヤーリストを自動更新
    // TODO: 対戦記録フォームIDを設定して有効化
    // updateGameFormPlayerList();
    
    Logger.log('✅ プレイヤー管理フォーム処理完了');
    
  } catch (error) {
    Logger.log('❌ プレイヤー管理フォーム処理エラー: ' + error.toString());
  }
}

/**
 * すべてのフォームを一括作成
 */
function createAllForms() {
  Logger.log('=== フォーム一括作成開始 ===');
  
  const gameForm = createMahjongGameForm();
  Logger.log('');
  
  const playerForm = createPlayerManagementForm();
  Logger.log('');
  
  Logger.log('=== フォーム一括作成完了 ===');
  Logger.log('');
  Logger.log('📋 対戦記録フォーム: ' + gameForm.formUrl);
  Logger.log('  フォームID: ' + gameForm.formId);
  Logger.log('👥 プレイヤー管理フォーム: ' + playerForm.formUrl);
  Logger.log('  フォームID: ' + playerForm.formId);
  Logger.log('');
  Logger.log('🔧 次のステップ:');
  Logger.log('1. updateGameFormPlayerList() 関数内のフォームIDを更新');
  Logger.log('2. プレイヤー追加時に自動更新するよう設定');
  
  // スクリプトプロパティに保存
  saveFormIds(gameForm.formId, playerForm.formId);
  
  return {
    gameForm: gameForm,
    playerForm: playerForm
  };
}

/**
 * フォームIDをスクリプトプロパティに保存
 */
function saveFormIds(gameFormId, playerFormId) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty('GAME_FORM_ID', gameFormId);
    scriptProperties.setProperty('PLAYER_FORM_ID', playerFormId);
    Logger.log('✅ フォームIDを保存しました');
  } catch (error) {
    Logger.log('⚠️ フォームID保存エラー: ' + error.toString());
  }
}

/**
 * 保存されたフォームIDを取得
 */
function getFormIds() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return {
    gameFormId: scriptProperties.getProperty('GAME_FORM_ID'),
    playerFormId: scriptProperties.getProperty('PLAYER_FORM_ID')
  };
}

/**
 * 対戦記録フォームのプレイヤーリストを更新（改善版）
 */
function updateGameFormPlayerListAuto() {
  try {
    const formIds = getFormIds();
    
    if (!formIds.gameFormId) {
      Logger.log('⚠️ フォームIDが見つかりません。createAllForms()を実行してください。');
      return;
    }
    
    return updatePlayerListInForm(formIds.gameFormId);
  } catch (error) {
    Logger.log('❌ 自動更新エラー: ' + error.toString());
    throw error;
  }
}
