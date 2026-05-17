@echo off
echo Starting legacy local environment...

:: Navigate to root directory from /scripts
cd ..

start "Frontend" cmd /k "cd legacy_v1\frontend && npm start"
start "Backend" cmd /k "cd backend && node index.js"

echo Keep this window open. Servers are running in new terminals!
