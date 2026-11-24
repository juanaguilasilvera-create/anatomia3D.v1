@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 herramientas\instalar_dependencias_v39.py
) else (
  python herramientas\instalar_dependencias_v39.py
)
echo.
echo Si se instalo correctamente, abre index.html con Live Server.
pause
