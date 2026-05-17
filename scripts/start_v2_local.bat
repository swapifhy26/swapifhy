@echo off
echo Starting Swapifhy V2 Ecosystem...

:: Navigate to root directory from /scripts
cd ..

:: Start Backend
start "Backend" cmd /k "cd backend && npm start"

:: Start Frontend V2
start "Frontend V2" cmd /k "cd frontend-v2 && npm run dev"

echo Successfully initialized backend and frontend servers!
echo Backend API running on http://localhost:3001
echo Frontend running on http://localhost:3000
