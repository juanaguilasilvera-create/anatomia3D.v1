@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 herramientas\instalar_modelos.py
) else (
  python herramientas\instalar_modelos.py
)
echo.
echo Revise el resultado anterior. Luego abra index.html con Live Server.
pause
