# SHADVALOG

Shadowverse対戦記録管理アプリケーション

## 概要

SHADVALOGは、Shadowverseの対戦履歴を記録・管理するためのElectronアプリケーションです。

## 主な機能

- 📊 対戦記録の登録・編集・削除
- 📈 詳細な統計情報の表示
- 🎴 デッキアーキタイプの管理
- 💾 CSVインポート/エクスポート
- 🔍 ランク別フィルタリング（Beginner-AA / Master / Grand Master）

## 技術スタック

- **Electron** - デスクトップアプリケーションフレームワーク
- **Vue 3** - UIフレームワーク
- **TypeScript** - 型安全な開発
- **Vuetify** - マテリアルデザインコンポーネント
- **Better-SQLite3** - ローカルデータベース
- **Vite** - 高速ビルドツール

## 開発環境のセットアップ

### 必要要件

- Node.js 16以上
- npm または yarn

### インストール

```bash
# 依存関係のインストール
npm install

# 開発モードで起動
npm run dev

# 本番ビルド
npm run build:win  # Windows
npm run build:mac  # macOS
npm run build:linux  # Linux
```

## ビルド

```bash
# Windowsインストーラーのビルド
npm run build:win

# ポータブル版も同時に生成されます
```

ビルドされたファイルは `dist` ディレクトリに出力されます。

## ライセンス

このプロジェクトは個人使用を目的としています。

## 開発者

開発に関する質問や提案は、Issuesセクションにお願いします。
