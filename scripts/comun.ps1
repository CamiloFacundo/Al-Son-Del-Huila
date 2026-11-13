# Funciones compartidas por instalar.ps1 e iniciar.ps1
# Busca PHP 8.3+, Composer, MySQL y Node aunque no estén en el PATH (rutas típicas de XAMPP).

$ErrorActionPreference = 'Continue'

$Raiz     = Split-Path -Parent $PSScriptRoot
$Backend  = Join-Path $Raiz 'backend'
$Frontend = Join-Path $Raiz 'frontend'

function Paso($texto)    { Write-Host "`n==> $texto" -ForegroundColor Yellow }
function Ok($texto)      { Write-Host "    OK  $texto" -ForegroundColor Green }
function Aviso($texto)   { Write-Host "    !   $texto" -ForegroundColor DarkYellow }
function Fallar($texto)  { Write-Host "`nERROR: $texto`n" -ForegroundColor Red; exit 1 }

# PHP 8.3 o superior (el de XAMPP suele ser 8.2 y no sirve para Laravel 13)
function Buscar-Php {
    $candidatos = @()
    if ($env:PHP_BIN) { $candidatos += $env:PHP_BIN }
    $candidatos += 'C:\php84\php.exe', 'C:\php85\php.exe', 'C:\php83\php.exe'
    $enPath = Get-Command php -ErrorAction SilentlyContinue
    if ($enPath) { $candidatos += $enPath.Source }
    $candidatos += 'C:\xampp\php\php.exe'

    foreach ($c in $candidatos) {
        if (-not (Test-Path $c)) { continue }
        $version = & $c -r 'echo PHP_VERSION_ID;' 2>$null
        if ([int]$version -ge 80300) { return $c }
    }
    Fallar ("No encontré PHP 8.3 o superior.`n" +
        "  Descarga PHP 8.4 (VS17 x64 Thread Safe) de https://windows.php.net/download/,`n" +
        "  descomprímelo en C:\php84 y vuelve a ejecutar este script.")
}

# Extensiones que necesita el proyecto
function Revisar-Extensiones($php) {
    $modulos = (& $php -m) -join "`n"
    $faltan = @('pdo_mysql', 'mbstring', 'openssl', 'curl', 'fileinfo', 'zip', 'gd', 'exif') | Where-Object { $modulos -notmatch "(?im)^$_$" }
    if ($faltan) {
        $ini = & $php -r "echo php_ini_loaded_file() ?: '(no hay php.ini)';"
        Fallar ("A PHP le faltan extensiones: $($faltan -join ', ').`n" +
            "  Abre $ini y quita el ';' de las líneas extension=... correspondientes.`n" +
            "  Si no hay php.ini, copia php.ini-development como php.ini en la carpeta de PHP.")
    }
    $certificados = & $php -r "echo ini_get('curl.cainfo');"
    if (-not $certificados) {
        Aviso 'PHP no tiene curl.cainfo configurado: Huily (Groq) y el login con Google pueden fallar con "cURL error 60".'
        Aviso 'Solución: descarga https://curl.se/ca/cacert.pem y en php.ini pon curl.cainfo y openssl.cafile con su ruta.'
    }
}

# composer.phar, que se ejecuta con el PHP correcto
function Buscar-Composer {
    $candidatos = @('C:\ProgramData\ComposerSetup\bin\composer.phar', (Join-Path $Backend 'composer.phar'))
    $enPath = Get-Command composer -ErrorAction SilentlyContinue
    if ($enPath) { $candidatos += Join-Path (Split-Path $enPath.Source) 'composer.phar' }
    foreach ($c in $candidatos) { if (Test-Path $c) { return $c } }
    Fallar "No encontré Composer. Instálalo desde https://getcomposer.org/Composer-Setup.exe y vuelve a ejecutar este script."
}

# Carpeta bin de MySQL (Laravel usa el cliente mysql para cargar el esquema)
function Buscar-MysqlBin {
    $enPath = Get-Command mysql -ErrorAction SilentlyContinue
    if ($enPath) { return Split-Path $enPath.Source }
    foreach ($c in 'C:\xampp\mysql\bin', 'D:\xampp\mysql\bin') {
        if (Test-Path (Join-Path $c 'mysql.exe')) { return $c }
    }
    Fallar "No encontré MySQL. Instala XAMPP (https://www.apachefriends.org) o agrega la carpeta bin de MySQL al PATH."
}

function Revisar-Node {
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Fallar "No encontré Node.js. Instala la versión LTS desde https://nodejs.org y abre una consola nueva."
    }
    $mayor = [int]((& node -v) -replace '^v(\d+).*', '$1')
    if ($mayor -lt 20) { Fallar "Node.js $(& node -v) es muy viejo: se necesita la versión 20 o superior (https://nodejs.org)." }
}

# Vite escucha en ::1 (IPv6) y Laravel en 127.0.0.1: se prueban los dos
function Puerto-Abierto([int]$puerto) {
    foreach ($direccion in '127.0.0.1', '::1') {
        try {
            $c = New-Object Net.Sockets.TcpClient([Net.IPAddress]::Parse($direccion).AddressFamily)
            $c.Connect($direccion, $puerto); $c.Close(); return $true
        } catch { }
    }
    return $false
}

function Esperar-Puerto([int]$puerto, [int]$segundos) {
    for ($i = 0; $i -lt $segundos; $i++) {
        if (Puerto-Abierto $puerto) { return $true }
        Start-Sleep -Seconds 1
    }
    return $false
}

# Enciende el MySQL de XAMPP si está apagado
function Asegurar-Mysql($mysqlBin) {
    if (Puerto-Abierto 3306) { Ok 'MySQL está encendido'; return }
    $xampp = Split-Path (Split-Path $mysqlBin)
    $arranque = Join-Path $xampp 'mysql_start.bat'
    if (-not (Test-Path $arranque)) { Fallar 'MySQL está apagado. Enciéndelo (por ejemplo desde el panel de XAMPP) y vuelve a ejecutar el script.' }
    Write-Host '    Encendiendo MySQL de XAMPP...'
    Start-Process -FilePath $arranque -WorkingDirectory $xampp -WindowStyle Minimized
    if (-not (Esperar-Puerto 3306 30)) { Fallar 'MySQL no arrancó. Ábrelo desde el panel de XAMPP para ver el error.' }
    Ok 'MySQL encendido'
}

# Lee y escribe valores del .env
function Leer-Env($archivo, $clave) {
    $linea = Get-Content $archivo | Where-Object { $_ -match "^$clave=" } | Select-Object -First 1
    if (-not $linea) { return '' }
    return ($linea -replace "^$clave=", '').Trim().Trim('"')
}

function Escribir-Env($archivo, $clave, $valor) {
    $lineas = Get-Content $archivo
    if ($lineas -match "^$clave=") { $lineas = $lineas -replace "^$clave=.*", "$clave=$valor" }
    else { $lineas += "$clave=$valor" }
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    [IO.File]::WriteAllLines($archivo, [string[]]$lineas, $utf8)
}
