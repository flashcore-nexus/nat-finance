@echo off
cd /d "%~dp0"
node scripts/build.mjs
if errorlevel 1 goto erro
node scripts/check-dist.mjs
if errorlevel 1 goto erro
echo Abra http://localhost:4173/nat-finance/ no navegador.
node scripts/serve.mjs
goto fim
:erro
echo Nao foi possivel iniciar. Confira se Node.js 22 ou superior esta instalado.
pause
:fim
