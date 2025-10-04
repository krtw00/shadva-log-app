import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

// better-sqlite3関連のインポート
import Database from 'better-sqlite3'

// データベースファイルのパス
const dbPath = join(app.getPath('userData'), 'database.sqlite')
let db: Database.Database // better-sqlite3のデータベースインスタンスを保持する変数

function initializeDatabase() {
  try {
    // データベースを開く（存在しない場合は作成される）
    // verbose: true を設定すると、実行されたSQLクエリがコンソールに出力されます（デバッグ用）
    db = new Database(dbPath, { verbose: console.log })
    console.log('better-sqlite3 database opened successfully.')

    // matchesテーブルを作成（存在しない場合のみ）
    db.exec(`
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_date TEXT NOT NULL,
        player_rank TEXT NOT NULL,
        player_cr INTEGER,
        player_mp INTEGER,
        player_class TEXT NOT NULL,
        player_archetype TEXT,
        opponent_class TEXT NOT NULL,
        opponent_archetype TEXT,
        is_first INTEGER NOT NULL,
        result INTEGER NOT NULL,
        notes TEXT
      );
    `)
    console.log('Matches table checked/created with better-sqlite3.')

    // player_groupカラムを追加（既存テーブルには存在しない場合）
    try {
      db.exec(`ALTER TABLE matches ADD COLUMN player_group TEXT;`);
      console.log('Added player_group column to matches table.');
    } catch (error) {
      // カラムが既に存在する場合はエラーを無視
      console.log('player_group column already exists or could not be added.');
    }

    // archetypesテーブルを作成（存在しない場合のみ）
    db.exec(`
      CREATE TABLE IF NOT EXISTS archetypes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        class_name TEXT NOT NULL
      );
    `)
    
    // archetypesテーブルのUNIQUE制約をマイグレーション
    try {
      const hasUniqueConstraint = db.prepare(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='archetypes'"
      ).get() as { sql: string } | undefined;
      
      // UNIQUE(name, class_name)がない場合はマイグレーション
      if (hasUniqueConstraint && !hasUniqueConstraint.sql.includes('UNIQUE(name, class_name)')) {
        console.log('Migrating archetypes table to add UNIQUE constraint on (name, class_name)...');
        
        db.exec(`
          -- 一時テーブルを作成
          CREATE TABLE archetypes_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            class_name TEXT NOT NULL,
            UNIQUE(name, class_name)
          );
          
          -- 重複を除いてデータをコピー
          INSERT INTO archetypes_new (name, class_name)
          SELECT DISTINCT name, class_name FROM archetypes;
          
          -- 古いテーブルを削除
          DROP TABLE archetypes;
          
          -- 新しいテーブルをリネーム
          ALTER TABLE archetypes_new RENAME TO archetypes;
        `);
        
        console.log('Archetypes table migration completed.');
      }
    } catch (migrationError) {
      console.log('Archetypes table already has correct structure or migration not needed.');
    }
    
    // Migrate old class names to 'ナイトメア'
    db.exec(`
      UPDATE matches
      SET player_class = 'ナイトメア'
      WHERE player_class IN ('ネクロマンサー', 'ヴァンパイア');
    `);
    db.exec(`
      UPDATE matches
      SET opponent_class = 'ナイトメア'
      WHERE opponent_class IN ('ネクロマンサー', 'ヴァンパイア');
    `);
    db.exec(`
      UPDATE archetypes
      SET class_name = 'ナイトメア'
      WHERE class_name IN ('ネクロマンサー', 'ヴァンパイア');
    `);
    console.log('Class names migrated to ナイトメア.');
    console.log('Archetypes table checked/created with better-sqlite3.')
  } catch (error) {
    console.error('Failed to initialize database with better-sqlite3:', error)
  }
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1640,
    height: 950,
    minWidth: 1640,
    minHeight: 950,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false // contextBridgeを使用するため、sandboxを無効にするか、適切に設定する必要があります。
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC handlers for database operations
  ipcMain.handle('db:add-match', async (_event, match) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO matches (
          match_date, player_rank, player_group, player_cr, player_mp, player_class, player_archetype,
          opponent_class, opponent_archetype, is_first, result, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        match.match_date, match.player_rank, match.player_group, match.player_cr, match.player_mp, match.player_class, match.player_archetype,
        match.opponent_class, match.opponent_archetype, match.is_first, match.result, match.notes
      );
      return { success: true, lastInsertRowid: info.lastInsertRowid }
    } catch (error: any) {
      console.error('Failed to add match:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:get-matches', async () => {
    try {
      const matches = db.prepare('SELECT * FROM matches ORDER BY match_date DESC').all()
      return { success: true, data: matches }
    } catch (error: any) {
      console.error('Failed to get matches:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:delete-match', async (_event, id) => {
    try {
      const stmt = db.prepare('DELETE FROM matches WHERE id = ?')
      const info = stmt.run(id)
      return { success: true, changes: info.changes }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:add-archetype', async (_event, archetype) => {
    try {
      // 既存のアーキタイプをチェック
      const existing = db.prepare('SELECT id FROM archetypes WHERE name = ? AND class_name = ?')
        .get(archetype.name, archetype.class_name);
      
      if (existing) {
        // 既に存在する場合は既存のIDを返す
        return { success: true, lastInsertRowid: (existing as any).id, alreadyExists: true };
      }
      
      // 新規追加
      const stmt = db.prepare('INSERT INTO archetypes (name, class_name) VALUES (?, ?)');
      const info = stmt.run(archetype.name, archetype.class_name);
      return { success: true, lastInsertRowid: info.lastInsertRowid };
    } catch (error: any) {
      console.error('Failed to add archetype:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:get-archetypes', async (_event, className?: string) => {
    try {
      let archetypes;
      if (className) {
        archetypes = db.prepare('SELECT * FROM archetypes WHERE class_name = ? ORDER BY name').all(className);
      } else {
        archetypes = db.prepare('SELECT * FROM archetypes ORDER BY name').all();
      }
      return { success: true, data: archetypes };
    } catch (error: any) {
      console.error('Failed to get archetypes:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:update-archetype', async (_event, archetype) => {
    try {
      const stmt = db.prepare('UPDATE archetypes SET name = ?, class_name = ? WHERE id = ?');
      const info = stmt.run(archetype.name, archetype.class_name, archetype.id);
      return { success: true, changes: info.changes };
    } catch (error: any) {
      console.error('Failed to update archetype:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:delete-archetype', async (_event, id) => {
    try {
      const stmt = db.prepare('DELETE FROM archetypes WHERE id = ?');
      const info = stmt.run(id);
      return { success: true, changes: info.changes };
    } catch (error: any) {
      console.error('Failed to delete archetype:', error);
      return { success: false, error: error.message };
    }
  });

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // データベースの初期化をアプリケーション起動時に実行
  initializeDatabase()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// アプリケーション終了時にデータベースを閉じる
app.on('before-quit', () => {
  if (db) {
    db.close()
    console.log('better-sqlite3 database closed.')
  }
})
