const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'src', 'renderer', 'src', 'assets', 'logo.jpg');
const buildDir = path.join(__dirname, 'build');
const outputPath = path.join(buildDir, 'icon.ico');

// buildディレクトリが存在しない場合は作成
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// JPGからICOに変換（複数サイズ）
async function createIcon() {
  try {
    // Windowsアイコン用の複数サイズを作成
    const sizes = [16, 32, 48, 64, 128, 256];
    
    for (const size of sizes) {
      const outputPng = path.join(buildDir, `icon-${size}.png`);
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toFile(outputPng);
      console.log(`Created ${size}x${size} PNG`);
    }
    
    // ICOファイルの作成には追加のツールが必要
    console.log('\nPNG files created successfully.');
    console.log('To create ICO file, use an online converter or install png-to-ico package:');
    console.log('npm install --save-dev png-to-ico');
    console.log('Then run: npx png-to-ico build/icon-256.png > build/icon.ico');
    
  } catch (error) {
    console.error('Error creating icon:', error);
  }
}

createIcon();
