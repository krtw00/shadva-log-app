/**
 * アイコン生成スクリプト
 * logo.jpgからWindows用のICOファイルを生成します
 * 
 * 使用方法:
 * 1. npm install --save-dev sharp png2ico
 * 2. node generate-icon.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const inputPath = path.join(__dirname, 'src', 'renderer', 'src', 'assets', 'logo.jpg');
const buildDir = path.join(__dirname, 'build');
const iconPath = path.join(buildDir, 'icon.ico');

// buildディレクトリが存在しない場合は作成
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

async function createWindowsIcon() {
  try {
    console.log('Generating Windows icon from logo.jpg...');
    
    // 複数サイズのPNGを作成（ICOファイルには複数サイズが必要）
    const sizes = [16, 32, 48, 256];
    const pngPaths = [];
    
    for (const size of sizes) {
      const pngPath = path.join(buildDir, `icon-${size}.png`);
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toFile(pngPath);
      pngPaths.push(pngPath);
      console.log(`✓ Created ${size}x${size} PNG`);
    }
    
    // png2icoを使用してICOに変換
    try {
      // png2icoコマンドラインツールを使用
      const png2icoPath = path.join(__dirname, 'node_modules', '.bin', 'png2ico');
      const command = `"${png2icoPath}" ${iconPath} ${pngPaths.map(p => `"${p}"`).join(' ')}`;
      
      execSync(command, { stdio: 'inherit' });
      console.log('✓ Created icon.ico successfully!');
      
      // 一時PNGファイルを削除（オプション）
      // pngPaths.forEach(p => fs.unlinkSync(p));
      
    } catch (error) {
      console.log('\n⚠ png2ico package not found or failed to execute.');
      console.log('Please install it first:');
      console.log('  npm install --save-dev png2ico');
      console.log('\nAlternatively, you can use the created PNG files:');
      pngPaths.forEach(p => console.log(`  - ${p}`));
      console.log('\nAnd convert them manually using:');
      console.log('  - Online converter: https://convertio.co/png-ico/');
      console.log('  - Or use icon-256.png as a temporary solution');
    }
    
  } catch (error) {
    console.error('Error creating icon:', error);
  }
}

createWindowsIcon();
