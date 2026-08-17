@echo off
cd /d "%~dp0"
echo Starting Agro-Rakshak Backend...
start cmd /k "cd backend && npm.cmd start"

echo Starting Agro-Rakshak Frontend...
start cmd /k "npm.cmd start"
