@echo off
echo ============================================
echo Installing All Dependencies
echo ============================================
echo.

cd /d "%~dp0"

echo [1/4] Installing project dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Installing Claude SDK...
call npm install @anthropic-ai/sdk
if %errorlevel% neq 0 (
    echo [WARNING] Claude SDK installation failed - optional
)

echo.
echo [3/4] Installing testing tools...
call npm install -D tsx
if %errorlevel% neq 0 (
    echo [WARNING] tsx installation failed - optional
)

echo.
echo [4/4] Verifying installation...
call npm list --depth=0

echo.
echo ============================================
echo [SUCCESS] All dependencies installed!
echo ============================================
echo.
echo Next steps:
echo   1. Create .env.local with your API keys
echo   2. Run: npm run dev
echo   3. Open: http://localhost:3000
echo.
pause
