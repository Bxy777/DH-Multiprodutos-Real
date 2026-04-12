@echo off
cd /d "%~dp0"
if not exist package.json (
  echo package.json nao encontrado. Esta pasta nao e o projeto.
  pause
  exit /b 1
)
npm run dev
