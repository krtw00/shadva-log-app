@echo off
echo Creating icon from logo.jpg
echo =============================
echo.

echo Installing required packages...
call npm install --save-dev sharp png2ico

echo.
echo Generating icon...
node generate-icon.js

echo.
echo Done!
pause
