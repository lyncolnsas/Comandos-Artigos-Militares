@echo off
setlocal
cd /d "%~dp0"

echo ================================================================
echo       ENCERRANDO PROCESSOS COMANDOS ARTIGOS MILITARES
echo ================================================================
echo.

echo Finalizando janelas do Backend e Frontend...
taskkill /FI "WINDOWTITLE eq Comandos Store - Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Comandos Store - Frontend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Bizu Store - Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Bizu Store - Frontend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Gama Store - Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Gama Store - Frontend*" /T /F >nul 2>&1

echo Liberando portas 3000 e 3001 se estiverem em uso...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /PID %%a /F >nul 2>&1

echo [OK] Servicos encerrados com sucesso!
timeout /t 2 /nobreak >nul