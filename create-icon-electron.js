const { promises: fs } = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function createIcon() {
  console.log('Installing electron-icon-builder...');
  
  try {
    execSync('npm install --save-dev electron-icon-builder', { stdio: 'inherit' });
    
    console.log('Creating icon configuration...');
    
    const iconConfig = {
      input: path.join(__dirname, 'src/renderer/src/assets/logo.jpg'),
      output: path.join(__dirname, 'build'),
      flatten: true,
      icons: {
        ico: true,
        png: false,
        icns: false
      }
    };
    
    await fs.writeFile(
      path.join(__dirname, 'icon-config.json'),
      JSON.stringify(iconConfig, null, 2)
    );
    
    console.log('Generating icon...');
    execSync('npx electron-icon-builder --input=src/renderer/src/assets/logo.jpg --output=build --flatten', { stdio: 'inherit' });
    
    console.log('✓ Icon generated successfully!');
  } catch (error) {
    console.error('Failed to generate icon:', error.message);
    console.log('\nPlease try manual conversion:');
    console.log('1. Go to https://convertio.co/png-ico/');
    console.log('2. Upload build/icon-256.png');
    console.log('3. Download the converted icon.ico');
    console.log('4. Save it as build/icon.ico');
  }
}

createIcon();
