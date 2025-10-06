import Database from 'better-sqlite3';
import { join } from 'path';

// Electronのメインプロセス外でapp.getPath('userData')は利用できないため、
// このスクリプトではデータベースパスをプロジェクトルートからの相対パスとします。
// 実際のアプリケーションのデータベースを使用したい場合は、生成されたdatabase.sqliteを
// Electronのユーザーデータディレクトリに手動でコピーする必要があります。
const DB_PATH = join(__dirname, '../database.sqlite');

const db = new Database(DB_PATH, { verbose: console.log });

const PLAYER_CLASSES = ['エルフ', 'ロイヤル', 'ウィッチ', 'ドラゴン', 'ナイトメア', 'ビショップ', 'ネメシス'];
const RANKS = ['Beginner', 'D', 'C', 'B', 'A', 'AA', 'Master', 'Grand Master'];
const GROUPS = ['エメラルド', 'トパーズ', 'ルビー', 'サファイア', 'ダイヤモンド'];

const ARCHETYPES_BY_CLASS: { [key: string]: string[] } = {
  'エルフ': ['アグロエルフ', 'OTKエルフ', 'コントロールエルフ'],
  'ロイヤル': ['ミッドレンジロイヤル', '連携ロイヤル', '進化ロイヤル'],
  'ウィッチ': ['超越ウィッチ', '土の秘術ウィッチ', 'マナリアウィッチ'],
  'ドラゴン': ['ランプドラゴン', 'ディスカードドラゴン', '武装ドラゴン'],
  'ナイトメア': ['アグロナイトメア', '復讐ナイトメア', '狂乱ナイトメア'],
  'ビショップ': ['守護ビショップ', '回復ビショップ', 'アミュレットビショップ'],
  'ネメシス': ['AFネメシス', '操り人形ネメシス', '共鳴ネメシス'],
};

interface Match {
  match_date: string;
  player_rank: string;
  player_group?: string;
  player_cr?: number;
  player_mp?: number;
  player_class: string;
  player_archetype?: string;
  opponent_class: string;
  opponent_archetype?: string;
  is_first: number;
  result: number;
  notes?: string;
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function generateDummyMatch(): Match {
  const playerClass = getRandomElement(PLAYER_CLASSES);
  const opponentClass = getRandomElement(PLAYER_CLASSES);
  const playerRank = getRandomElement(RANKS);

  let playerArchetype: string | undefined = undefined;
  if (Math.random() > 0.2 && ARCHETYPES_BY_CLASS[playerClass]) { // 80% chance to have an archetype
    playerArchetype = getRandomElement(ARCHETYPES_BY_CLASS[playerClass]);
  }

  let opponentArchetype: string | undefined = undefined;
  if (Math.random() > 0.2 && ARCHETYPES_BY_CLASS[opponentClass]) { // 80% chance to have an archetype
    opponentArchetype = getRandomElement(ARCHETYPES_BY_CLASS[opponentClass]);
  }

  const matchDate = getRandomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()); // Last year

  const match: Match = {
    match_date: matchDate,
    player_rank: playerRank,
    player_class: playerClass,
    player_archetype: playerArchetype,
    opponent_class: opponentClass,
    opponent_archetype: opponentArchetype,
    is_first: Math.random() > 0.5 ? 1 : 0,
    result: Math.random() > 0.5 ? 1 : 0,
    notes: Math.random() > 0.7 ? 'ダミーノート' : undefined, // 30% chance for notes
  };

  // Add rank-specific data
  if (playerRank === 'Master' || playerRank === 'Grand Master') {
    match.player_mp = Math.floor(Math.random() * 20000) + 10000; // 10000-30000 MP
  }
  if (playerRank === 'Grand Master') {
    match.player_cr = Math.floor(Math.random() * 1000) + 1000; // 1000-2000 CR
  }
  if (['Beginner', 'D', 'C', 'B', 'A', 'AA'].includes(playerRank)) {
    match.player_group = getRandomElement(GROUPS);
  }

  return match;
}

function insertDummyData(numMatches: number) {
  try {
    // Ensure tables exist (copy-pasted from main process for simplicity, but ideally should be shared)
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
    `);
    db.exec(`
      CREATE TABLE IF NOT EXISTS archetypes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        class_name TEXT NOT NULL,
        UNIQUE(name, class_name)
      );
    `);

    // Insert dummy archetypes first
    const insertArchetypeStmt = db.prepare('INSERT OR IGNORE INTO archetypes (name, class_name) VALUES (?, ?)');
    for (const className of PLAYER_CLASSES) {
      if (ARCHETYPES_BY_CLASS[className]) {
        for (const archetype of ARCHETYPES_BY_CLASS[className]) {
          insertArchetypeStmt.run(archetype, className);
        }
      }
    }
    console.log('Dummy archetypes inserted.');

    const insertMatchStmt = db.prepare(`
      INSERT INTO matches (
        match_date, player_rank, player_group, player_cr, player_mp, player_class, player_archetype,
        opponent_class, opponent_archetype, is_first, result, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    db.transaction(() => {
      for (let i = 0; i < numMatches; i++) {
        const match = generateDummyMatch();
        insertMatchStmt.run(
          match.match_date, match.player_rank, match.player_group, match.player_cr, match.player_mp, match.player_class, match.player_archetype,
          match.opponent_class, match.opponent_archetype, match.is_first, match.result, match.notes
        );
      }
    })(); // Immediately invoke the transaction

    console.log(`${numMatches} dummy matches inserted successfully.`);
  } catch (error) {
    console.error('Error inserting dummy data:', error);
  } finally {
    db.close();
  }
}

// Run with 100 dummy matches by default, or from command line argument
const numToGenerate = process.argv[2] ? parseInt(process.argv[2], 10) : 100;
if (isNaN(numToGenerate) || numToGenerate <= 0) {
  console.error('生成するマッチ数を正しく指定してください (例: ts-node scripts/generate-dummy-data.ts 50)');
  process.exit(1);
}

insertDummyData(numToGenerate);
