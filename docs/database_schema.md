# データベーススキーマ設計

## 概要
シャドウバースワールドビヨンド戦績管理アプリのSQLiteデータベーススキーマ設計。

## テーブル定義

### `matches` テーブル
対戦記録を保存するテーブル。

| カラム名         | データ型     | 制約       | 説明                     |
|------------------|--------------|------------|--------------------------|
| `id`             | INTEGER      | PRIMARY KEY AUTOINCREMENT | 対戦ID (主キー)          |
| `match_date`     | TEXT         | NOT NULL   | 対戦日時 (YYYY-MM-DD HH:MM:SS) |
| `player_rank`    | TEXT         | NOT NULL   | プレイヤーのランク       |
| `player_cr`      | INTEGER      |            | プレイヤーのCR           |
| `player_mp`      | INTEGER      |            | プレイヤーのMP           |
| `player_class`   | TEXT         | NOT NULL   | プレイヤーのクラス       |
| `player_archetype`| TEXT         |            | プレイヤーのアーキタイプ |
| `opponent_class` | TEXT         | NOT NULL   | 相手のクラス             |
| `opponent_archetype`| TEXT         |            | 相手のアーキタイプ       |
| `is_first`       | INTEGER      | NOT NULL   | 先手(1)/後手(0)          |
| `notes`          | TEXT         |            | 備考                     |
