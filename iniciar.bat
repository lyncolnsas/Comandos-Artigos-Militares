@echo off
setlocal enabledelayedexpansion
title Comandos Artigos Militares - Inicializador

echo ================================================================
echo       COMANDOS ARTIGOS MILITARES - INICIALIZADOR
echo ================================================================
echo.

set "PATH=C:\Program Files\nodejs;%PATH%"

where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Node.js nao foi detectado!
    echo Certifique-se de que o Node.js esta instalado.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detectado com sucesso.
echo.

if not exist "%~dp0.env" (
    echo [INFO] Criando arquivo .env...
    copy "%~dp0.env.example" "%~dp0.env" >nul
)

echo ================================================================
echo       INICIANDO SERVICOS (BACKEND + FRONTEND)
echo ================================================================
echo.

echo [1/2] Iniciando Backend API (Porta 3001)...
start "Comandos Store - Backend" cmd /k "title Comandos Store - Backend (Porta 3001) && cd /d "%~dp0" && set PATH=C:\Program Files\nodejs;%%PATH%% && node src/server.js"

:: Pausa de 3 segundos compativel com qualquer versao do Windows
ping 127.0.0.1 -n 4 >nul

echo [2/2] Iniciando Frontend Vite (Porta 3000)...
start "Comandos Store - Frontend" cmd /k "title Comandos Store - Frontend (Porta 3000) && cd /d "%~dp0frontend" && set PATH=C:\Program Files\nodejs;%%PATH%% && npm run dev"

:: Pausa de 3 segundos
ping 127.0.0.1 -n 4 >nul

echo [INFO] Abrindo loja no seu navegador...
start http://localhost:3000

echo.
echo ================================================================
echo       SISTEMA INICIADO COM SUCESSO!
echo ================================================================
echo  * Loja Virtual:   http://localhost:3000
echo  * Painel Admin:   http://localhost:3000/admin
echo  * Swagger API:    http://localhost:3001/api-docs
echo.
echo  Credenciais do Administrador:
echo  - Email: admin@comandosartigosmilitares.com
echo  - Senha: admin123
echo ================================================================
echo.
echo Mantenha esta janela ou as janelas abertas enquanto estiver testando.
echo Para fechar tudo, voce pode executar o arquivo parar.bat.
echo.
pause