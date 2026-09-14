@echo off
REM The Parlor - commit and push to GitHub (GitHub Pages serves main /).
REM Usage: publish.bat "optional commit message"
setlocal
cd /d "%~dp0"
set REPO=https://github.com/shamoug/the-parlor.git

if not exist ".git" (
  git init -b main
  git remote add origin %REPO%
)
git remote get-url origin >nul 2>nul || git remote add origin %REPO%
git config windows.appendAtomically false
git config user.email >nul 2>nul || git config user.email "shamoug@gmail.com"
git config user.name  >nul 2>nul || git config user.name "Aladdin Shamoug"

node tests\run.js >nul 2>nul
if errorlevel 1 (
  echo Tests failed. Run "node tests\run.js" to see why. Publishing anyway is not recommended.
  pause
  exit /b 1
)

set MSG=%~1
if "%MSG%"=="" set MSG=Update The Parlor (%DATE% %TIME%)
git add -A
git diff --cached --quiet && (echo Nothing new to commit.) || git commit -m "%MSG%"
git push -u origin main
if errorlevel 1 (
  echo Push failed. Finish the GitHub sign-in if prompted, then run publish.bat again.
  pause
  exit /b 1
)
echo.
echo Published! Live site: https://shamoug.github.io/the-parlor/
echo (GitHub Pages can take a minute to refresh.)
pause
