@echo off
echo Installing dependencies for SwipeHire...
echo.

REM Add Node.js to PATH for this session
set "PATH=%PATH%;C:\Program Files\nodejs"

REM Install dependencies
call npm install

echo.
echo Setup complete! You can now run:
echo   npm run dev
echo.
pause
