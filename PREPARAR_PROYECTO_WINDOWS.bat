@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (set "PY=py -3") else (set "PY=python")
%PY% herramientas\instalar_dependencias.py
if errorlevel 1 echo No se instalo Three.js. El visor intentara utilizar el CDN.
%PY% herramientas\instalar_modelos.py --capas skeletal joints muscular cardiovascular lymphatic nervous visceral femenino
if errorlevel 1 echo Hay modelos no instalados. El atlas local sigue disponible.
echo.
echo Abra index.html con Live Server. Consulte README.md para conocer las limitaciones.
pause
