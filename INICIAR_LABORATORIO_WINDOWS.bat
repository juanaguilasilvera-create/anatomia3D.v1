@echo off
setlocal
cd /d "%~dp0"
title Laboratorio Anatomico 3D
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 herramientas\servidor_modelos.py
  goto :fin
)
where python >nul 2>nul
if %errorlevel%==0 (
  python herramientas\servidor_modelos.py
  goto :fin
)
echo [ERROR] Se necesita Python 3.10 o posterior para iniciar el servidor local.
echo Descargalo desde https://www.python.org/downloads/
:fin
if errorlevel 1 pause
endlocal
