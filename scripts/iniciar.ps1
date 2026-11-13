# Enciende Al Son del Huila: MySQL (si está apagado), la API de Laravel y la web de Vite, cada uno en su ventana.
# Uso: doble clic en iniciar.cmd. Para apagar, cierra las ventanas "API" y "Web".
param([switch]$SinNavegador)

. (Join-Path $PSScriptRoot 'comun.ps1')

Write-Host '=== Iniciando Al Son del Huila ===' -ForegroundColor Cyan

if (-not (Test-Path (Join-Path $Backend 'vendor')) -or -not (Test-Path (Join-Path $Frontend 'node_modules')) -or -not (Test-Path (Join-Path $Backend '.env'))) {
    Fallar 'Falta instalar el proyecto: ejecuta primero instalar.cmd'
}

$php      = Buscar-Php
$mysqlBin = Buscar-MysqlBin
Revisar-Node

Paso 'Base de datos'
Asegurar-Mysql $mysqlBin

Paso 'API (Laravel) en http://localhost:8000'
if (Puerto-Abierto 8000) {
    Aviso 'El puerto 8000 ya está en uso: se asume que la API ya está encendida'
} else {
    $cmdApi = "`$host.UI.RawUI.WindowTitle = 'Al Son del Huila - API'; `$env:PATH = '$mysqlBin;' + `$env:PATH; Set-Location '$Backend'; & '$php' artisan serve --port=8000"
    Start-Process powershell -ArgumentList '-NoExit', '-NoProfile', '-Command', $cmdApi
    if (Esperar-Puerto 8000 30) { Ok 'API encendida' } else { Aviso 'La API tarda en arrancar: revisa su ventana' }
}

Paso 'Web (Vite) en http://localhost:5173'
if (Puerto-Abierto 5173) {
    Aviso 'El puerto 5173 ya está en uso: se asume que la web ya está encendida'
} else {
    $cmdWeb = "`$host.UI.RawUI.WindowTitle = 'Al Son del Huila - Web'; Set-Location '$Frontend'; npm run dev"
    Start-Process powershell -ArgumentList '-NoExit', '-NoProfile', '-Command', $cmdWeb
    if (Esperar-Puerto 5173 40) { Ok 'Web encendida' } else { Aviso 'La web tarda en arrancar: revisa su ventana' }
}

if (-not $SinNavegador) { Start-Process 'http://localhost:5173' }
Write-Host "`n=== Listo: http://localhost:5173  (para apagar, cierra las ventanas API y Web) ===`n" -ForegroundColor Cyan
