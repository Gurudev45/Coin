# Coin Management System Launcher
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting Coin Management System (Backend + Web)..." -ForegroundColor Cyan

Start-Process cmd -ArgumentList "/k cd /d `"$Root\backend`" && node src/server.js"
Start-Process cmd -ArgumentList "/k cd /d `"$Root\web`" && npm run dev -- --host"

Write-Host "`nBoth Backend and Web servers are now running in separate windows!" -ForegroundColor Green
Write-Host "Keep those windows open while using the app.`n" -ForegroundColor Yellow

