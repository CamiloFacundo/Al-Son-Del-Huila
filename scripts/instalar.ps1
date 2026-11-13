# Instala Al Son del Huila en este equipo. Se ejecuta UNA vez (o después de un git pull con cambios de dependencias).
# Uso: doble clic en instalar.cmd (en la raíz del proyecto)

. (Join-Path $PSScriptRoot 'comun.ps1')

Write-Host '=== Instalación de Al Son del Huila ===' -ForegroundColor Cyan

Paso 'Revisando programas necesarios'
$php = Buscar-Php;            Ok "PHP $(& $php -r 'echo PHP_VERSION;') ($php)"
Revisar-Extensiones $php;     Ok 'Extensiones de PHP'
$composer = Buscar-Composer;  Ok "Composer ($composer)"
$mysqlBin = Buscar-MysqlBin;  Ok "MySQL ($mysqlBin)"
Revisar-Node;                 Ok "Node.js $(& node -v)"
$env:PATH = "$mysqlBin;$env:PATH"

Paso 'Base de datos'
Asegurar-Mysql $mysqlBin

Paso 'Configuración del backend (backend\.env)'
$envBack = Join-Path $Backend '.env'
if (-not (Test-Path $envBack)) {
    Copy-Item (Join-Path $Backend '.env.example') $envBack
    Ok 'Creado backend\.env a partir de .env.example'
} else { Ok 'backend\.env ya existe (no se cambia lo que tenga)' }

# Claves: se piden solo si están vacías. Enter para dejarlas para después.
$claves = [ordered]@{
    'GROQ_API_KEY'         = 'Clave de Groq para Huily (console.groq.com)'
    'GOOGLE_CLIENT_ID'     = 'Client ID de Google para el login'
    'GOOGLE_CLIENT_SECRET' = 'Client secret de Google'
}
foreach ($clave in $claves.Keys) {
    if (-not (Leer-Env $envBack $clave)) {
        $valor = Read-Host "    $($claves[$clave]) (Enter para omitir)"
        if ($valor) { Escribir-Env $envBack $clave $valor.Trim(); Ok "$clave guardada" }
        else { Aviso "$clave vacía: la función que la usa no andará hasta que la pongas en backend\.env" }
    }
}

Paso 'Dependencias de PHP (composer install)'
Push-Location $Backend
& $php $composer install --no-interaction --no-progress
if ($LASTEXITCODE -ne 0) { Pop-Location; Fallar 'composer install falló (mira el mensaje de arriba).' }
Ok 'Dependencias de PHP instaladas'

if (-not (Leer-Env $envBack 'APP_KEY')) {
    & $php artisan key:generate --force
    if ($LASTEXITCODE -ne 0) { Pop-Location; Fallar 'No se pudo generar APP_KEY.' }
}
Ok 'APP_KEY lista'

Paso 'Tablas y catálogo de destinos'
$db       = Leer-Env $envBack 'DB_DATABASE'
$usuario  = Leer-Env $envBack 'DB_USERNAME'
$clave    = Leer-Env $envBack 'DB_PASSWORD'
$mysqlArgs = @('-u', $usuario, '-h', (Leer-Env $envBack 'DB_HOST'), '-P', (Leer-Env $envBack 'DB_PORT'))
if ($clave) { $mysqlArgs += "-p$clave" }

& (Join-Path $mysqlBin 'mysql.exe') @mysqlArgs -e ('CREATE DATABASE IF NOT EXISTS `{0}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci' -f $db)
if ($LASTEXITCODE -ne 0) { Pop-Location; Fallar "No se pudo crear la base de datos '$db'. Revisa DB_USERNAME y DB_PASSWORD en backend\.env." }

$tieneTablas = & (Join-Path $mysqlBin 'mysql.exe') @mysqlArgs -N -e "SHOW TABLES LIKE 'destinos'" $db
if ($tieneTablas) {
    Ok "La base '$db' ya tiene datos: no se toca"
} else {
    & $php artisan migrate --seed --force
    if ($LASTEXITCODE -ne 0) { Pop-Location; Fallar 'No se pudieron crear las tablas (mira el mensaje de arriba).' }
    Ok "Base '$db' creada con el catálogo (185 destinos)"
}

if (-not (Test-Path (Join-Path $Backend 'public\storage'))) {
    & $php artisan storage:link
}
Ok 'Carpeta de fotos subidas enlazada (public\storage)'
Pop-Location

Paso 'Frontend (npm install)'
$envFront = Join-Path $Frontend '.env'
if (-not (Test-Path $envFront)) { Copy-Item (Join-Path $Frontend '.env.example') $envFront; Ok 'Creado frontend\.env' }
Push-Location $Frontend
& npm install --no-fund --no-audit
if ($LASTEXITCODE -ne 0) { Pop-Location; Fallar 'npm install falló (mira el mensaje de arriba).' }
Pop-Location
Ok 'Dependencias del frontend instaladas'

Write-Host "`n=== Listo. Para usar la app ejecuta iniciar.cmd ===`n" -ForegroundColor Cyan
