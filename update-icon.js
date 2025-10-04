const fs = require('fs');
const path = require('path');

// ロゴをコピー
const logoSource = path.join(__dirname, 'src', 'renderer', 'src', 'assets', 'logo.png');
const iconDest = path.join(__dirname, 'build', 'icon.png');

console.log('Copying logo.png to build/icon.png...');
fs.copyFileSync(logoSource, iconDest);
console.log('Done! Icon copied successfully.');
console.log('\nNote: electron-builder will automatically convert PNG to ICO/ICNS formats.');
