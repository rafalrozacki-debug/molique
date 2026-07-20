<#
  molique - budowanie paczek do pobrania
  --------------------------------------
  Generuje dwie paczki ZIP w dist/:
    - molique-<wersja>.zip        (Production: skompilowane CSS min+full, JS, fonty, starter)
    - molique-<wersja>-src.zip    (Source: to co wyzej + zrodla scss/)

  Wymaga: npx (Node) + Dart Sass (npx sass). Uruchom z dowolnego miejsca:
    powershell -File tools/build-packages.ps1
#>

$version = '1.6.0'

# Katalog glowny repo (ten skrypt jest w tools/)
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$dist = Join-Path $root 'dist'
New-Item -ItemType Directory -Force $dist | Out-Null

# Staging w repo (nie w %TEMP% - unikamy sciezek 8.3 typu RAFA~1)
$stage = Join-Path $root '.pkgtmp'
if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }
$prod = Join-Path $stage "molique-$version"
New-Item -ItemType Directory -Force (Join-Path $prod 'css') | Out-Null

Write-Host "1/5  Kopiowanie skompilowanych bundli CSS (full)..."
Get-ChildItem (Join-Path $root 'css') -Filter '*.css' |
  Where-Object { $_.Name -notlike '*.min.css' } |
  Copy-Item -Destination (Join-Path $prod 'css')

Write-Host "2/5  Minifikacja bundli (sass --style=compressed)..."
$bundles = @(
  'molique-style','molique-style-admin','molique-style-shop','molique-style-blog',
  'molique-style-docs','molique-style-before-after','molique-style-share','molique-style-speed-dial'
)
foreach ($b in $bundles) {
  $scss = Join-Path $root "css/scss/$b.scss"
  $out  = Join-Path $prod "css/$b.min.css"
  if (Test-Path $scss) {
    & npx --yes sass $scss $out --style=compressed --no-source-map --quiet
  }
}

Write-Host "3/5  Kopiowanie JS, fontow, flag i plikow root..."
New-Item -ItemType Directory -Force (Join-Path $prod 'js/modules') | Out-Null
Copy-Item (Join-Path $root 'js/molique-script.js') (Join-Path $prod 'js')
Copy-Item (Join-Path $root 'js/modules/*.js') (Join-Path $prod 'js/modules')

Copy-Item -Recurse (Join-Path $root 'fonts') (Join-Path $prod 'fonts')

New-Item -ItemType Directory -Force (Join-Path $prod 'img/flags') | Out-Null
Copy-Item (Join-Path $root 'img/flags/*.svg') (Join-Path $prod 'img/flags')

foreach ($f in @('starter.html','README.md','LICENSE','NOTICE','llms.txt')) {
  if (Test-Path (Join-Path $root $f)) { Copy-Item (Join-Path $root $f) $prod }
}

Write-Host "4/5  Pakowanie Production..."
$prodZip = Join-Path $dist "molique-$version.zip"
if (Test-Path $prodZip) { Remove-Item $prodZip }
Compress-Archive -Path $prod -DestinationPath $prodZip

Write-Host "5/5  Budowanie i pakowanie Source (+ scss/)..."
$srcRoot = Join-Path $stage "molique-$version-src"
Copy-Item -Recurse $prod $srcRoot
New-Item -ItemType Directory -Force (Join-Path $srcRoot 'css/scss') | Out-Null
# tylko zrodla .scss (bez luster .md i kontekstu AI)
Copy-Item -Recurse (Join-Path $root 'css/scss/*') (Join-Path $srcRoot 'css/scss')
Get-ChildItem (Join-Path $srcRoot 'css/scss') -Recurse -Include '*.md' | Remove-Item -Force
$srcZip = Join-Path $dist "molique-$version-src.zip"
if (Test-Path $srcZip) { Remove-Item $srcZip }
Compress-Archive -Path $srcRoot -DestinationPath $srcZip

Remove-Item -Recurse -Force $stage

$prodKB = [math]::Round((Get-Item $prodZip).Length / 1KB)
$srcKB  = [math]::Round((Get-Item $srcZip).Length / 1KB)
Write-Host ""
Write-Host "Gotowe:"
Write-Host "  $prodZip  ($prodKB KB)"
Write-Host "  $srcZip  ($srcKB KB)"
