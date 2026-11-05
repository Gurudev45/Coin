@echo off
echo ==============================================
echo  Starting Coin Management System (Backend + Web)
echo ==============================================

start "Coin Backend (Port 5000)" cmd /k "cd /d %~dp0backend && node src/server.js"
start "Coin Web App" cmd /k "cd /d %~dp0web && npm run dev -- --host"

echo.
echo Both Backend and Web servers are now running in separate windows!
echo Do not close those terminal windows while using the app.
echo.
pause

