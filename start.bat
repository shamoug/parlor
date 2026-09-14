@echo off
REM The Parlor - start a local server and open the games in your browser.
cd /d "%~dp0"
set PORT=8120
where py >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:%PORT%/"
  py -3 -m http.server %PORT%
  goto :eof
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:%PORT%/"
  python -m http.server %PORT%
  goto :eof
)
echo Python was not found, so opening the file directly.
echo (Microphone features need a local server; everything else works.)
start "" "%~dp0index.html"
pause
