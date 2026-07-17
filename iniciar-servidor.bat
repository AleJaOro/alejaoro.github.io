@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  ========================================
echo   PagoFacil - servidor local
echo  ========================================
echo.
echo  Abre en el navegador:
echo    http://localhost:8080/index.html
echo    http://localhost:8080/login.html
echo.
echo  No cierres esta ventana mientras uses la app.
echo  ========================================
echo.

where py >nul 2>&1
if %errorlevel%==0 (
  py -m http.server 8080
  goto :eof
)

where python >nul 2>&1
if %errorlevel%==0 (
  python -m http.server 8080
  goto :eof
)

where node >nul 2>&1
if %errorlevel%==0 (
  npx --yes serve -l 8080
  goto :eof
)

echo ERROR: Necesitas Python o Node.js instalado.
echo Instala Python desde https://www.python.org/downloads/
echo o Node desde https://nodejs.org/
pause
