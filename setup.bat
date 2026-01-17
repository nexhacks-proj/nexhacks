@echo off
echo ============================================
echo SwipeHire Setup Script
echo ============================================
echo.

REM Try common Node.js installation paths
set "NODE_PATHS=C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;%APPDATA%\npm;%LOCALAPPDATA%\Programs\nodejs"

REM Check if npm is available
where npm >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] npm found in PATH
    goto :install
)

REM Try adding common paths
echo [INFO] npm not in PATH, trying common locations...
for %%P in (%NODE_PATHS%) do (
    if exist "%%P\npm.cmd" (
        echo [OK] Found npm at: %%P
        set "PATH=%PATH%;%%P"
        goto :install
    )
)

echo.
echo [ERROR] Node.js/npm not found!
echo.
echo Please install Node.js from: https://nodejs.org/
echo.
echo After installing:
echo   1. Restart this window
echo   2. Run: npm install
echo   3. Run: npm run dev
echo.
pause
exit /b 1

:install
echo.
echo [INFO] Installing dependencies...
echo This may take a few minutes...
echo.

call npm install

if %errorlevel% == 0 (
    echo.
    echo ============================================
    echo [SUCCESS] Setup complete!
    echo ============================================
    echo.
    echo Next steps:
    echo   1. Make sure .env.local has your API keys
    echo   2. Run: npm run dev
    echo   3. Open: http://localhost:3000
    echo.
) else (
    echo.
    echo [ERROR] Installation failed!
    echo Please check the error messages above.
    echo.
)

pause
