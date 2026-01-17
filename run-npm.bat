@echo off
REM Quick npm runner for PowerShell users
REM Use this if npm doesn't work in PowerShell

cd /d "%~dp0"

if "%1"=="" (
    echo Usage: run-npm.bat [npm command]
    echo Example: run-npm.bat "install"
    echo Example: run-npm.bat "install @anthropic-ai/sdk"
    echo Example: run-npm.bat "run dev"
    exit /b 1
)

call npm %*
