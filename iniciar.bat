@echo off
title Viaja Inteligente - Servidor de Simulación
color 0B
echo =======================================================
echo           INICIANDO VIAJA INTELIGENTE
echo   Planifica mejor, consume menos - IA Predictiva
echo =======================================================
echo.

:: Verificar la existencia de la carpeta del entorno virtual
if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] No se detecto el entorno virtual en la carpeta .venv/
    echo Por favor, crea el entorno virtual e instala los requerimientos:
    echo python -m venv .venv
    echo .venv\Scripts\pip install -r requirements.txt
    echo.
    pause
    exit /b
)

:: Dar un breve momento para iniciar el servidor antes de abrir la pagina
echo [INFO] Iniciando servidor local Flask...
echo [INFO] La aplicacion estara disponible en http://127.0.0.1:5000
echo.

:: Lanzar el navegador predeterminado en segundo plano
start "" "http://127.0.0.1:5000"

:: Ejecutar Flask
.venv\Scripts\python.exe app.py

pause
