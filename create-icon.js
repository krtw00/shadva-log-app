const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createCircularIcon() {
  try {
    const logoSource = path.join(__dirname, 'src', 'renderer', 'src', 'assets', 'logo.png');
    const iconDest = path.join(__dirname, 'build', 'icon.png');
    
    console.log('Processing logo.png...');
    
    // まず画像のメタデータを取得
    const metadata = await sharp(logoSource).metadata();
    console.log(`Original size: ${metadata.width}x${metadata.height}`);
    
    // アイコンサイズ（512x512推奨）
    const size = 512;
    
    // 円形マスクのSVGを作成
    const circleSvg = `
      <svg width="${size}" height="${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
      </svg>
    `;
    
    // 画像を処理：リサイズ → 円形にクリップ
    await sharp(logoSource)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .composite([{
        input: Buffer.from(circleSvg),
        blend: 'dest-in'
      }])
      .png()
      .toFile(iconDest);
    
    console.log(`✅ Circular icon created: ${iconDest}`);
    console.log('Icon will be automatically converted to .ico and .icns by electron-builder');
    
    // 複数サイズのアイコンも生成（オプション）
    const sizes = [16, 32, 48, 64, 128, 256, 512];
    console.log('\nGenerating multiple sizes...');
    
    for (const iconSize of sizes) {
      const circleSmall = `
        <svg width="${iconSize}" height="${iconSize}">
          <circle cx="${iconSize/2}" cy="${iconSize/2}" r="${iconSize/2}" fill="white"/>
        </svg>
      `;
      
      const outputPath = path.join(__dirname, 'build', `icon_${iconSize}x${iconSize}.png`);
      
      await sharp(logoSource)
        .resize(iconSize, iconSize, {
          fit: 'cover',
          position: 'center'
        })
        .composite([{
          input: Buffer.from(circleSmall),
          blend: 'dest-in'
        }])
        .png()
        .toFile(outputPath);
      
      console.log(`  ✓ ${iconSize}x${iconSize}`);
    }
    
    console.log('\n🎉 All icons generated successfully!');
    
  } catch (error) {
    console.error('Error creating icon:', error);
    process.exit(1);
  }
}

createCircularIcon();
