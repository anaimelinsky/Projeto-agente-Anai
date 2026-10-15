@echo off
title SENAI Conecta Educacao
echo ========================================================
echo    SENAI CONECTA EDUCACAO - DIVULGACAO PARA SECRETARIAS
echo ========================================================
echo.
echo Iniciando o servidor Python e conectando ao Agente Anai-Ribeiro...
echo.

if exist ".venv\Scripts\python.exe" (
    ".venv\Scripts\python.exe" server.py 5000
) else (
    python server.py 5000
)

pause
