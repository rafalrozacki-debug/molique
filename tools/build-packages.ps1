<#
  molique - budowanie paczek do pobrania
  --------------------------------------
  Generuje szesc paczek ZIP w dist/, krzyzujac dwa niezalezne wybory:
  format CSS (pelna / zminifikowana) i fonty (dolaczone / nie).

  Production (zawsze CSS + JS, bez scss/):
    - molique-<wersja>.zip             min,  bez fontow (domyslny)
    - molique-<wersja>-fonts.zip       min,  z fontami
    - molique-<wersja>-full.zip        pelna, bez fontow
    - molique-<wersja>-full-fonts.zip  pelna, z fontami

  Source (zawsze pelna CSS + scss/ - to jego sens, bez wariantu min):
    - molique-<wersja>-src.zip         bez fontow (domyslny)
    - molique-<wersja>-src-fonts.zip   z fontami

  Wymaga: npx (Node) + Dart Sass (npx sass). Uruchom z dowolnego miejsca:
    powershell -File tools/build-packages.ps1
#>

$version = '1.7.0'

# Katalog glowny repo (ten skrypt jest w tools/)
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$dist = Join-Path $root 'dist'
New-Item -ItemType Directory -Force $dist | Out-Null

# Staging w repo (nie w %TEMP% - unikamy sciezek 8.3 typu RAFA~1)
$stage = Join-Path $root '.pkgtmp'
if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }

$bundles = @(
  'molique-style','molique-style-admin','molique-style-shop','molique-style-blog',
  'molique-style-docs','molique-style-before-after','molique-style-share','molique-style-speed-dial'
)

Write-Host "1/4  Minifikacja bundli (sass --style=compressed)..."
$minDir = Join-Path $stage 'css-min'
New-Item -ItemType Directory -Force $minDir | Out-Null
foreach ($b in $bundles) {
  $scss = Join-Path $root "css/scss/$b.scss"
  $out  = Join-Path $minDir "$b.min.css"
  if (Test-Path $scss) {
    & npx --yes sass $scss $out --style=compressed --no-source-map --quiet
  }
}

# Buduje jeden folder paczki wedlug wybranych opcji (format CSS, fonty,
# zrodla scss/) i zwraca sciezke do niego. Wspolna dla Production i Source -
# rozni je tylko to, jakie parametry dostana.
function New-PackageFolder {
  param(
    [string]$Name,
    [ValidateSet('full', 'min')][string]$CssFormat,
    [bool]$WithFonts,
    [bool]$WithScssSource
  )

  $folder = Join-Path $stage $Name
  New-Item -ItemType Directory -Force (Join-Path $folder 'css') | Out-Null

  if ($CssFormat -eq 'full') {
    Get-ChildItem (Join-Path $root 'css') -Filter '*.css' |
      Where-Object { $_.Name -notlike '*.min.css' } |
      Copy-Item -Destination (Join-Path $folder 'css')
  } else {
    Get-ChildItem $minDir -Filter '*.min.css' | Copy-Item -Destination (Join-Path $folder 'css')
  }

  New-Item -ItemType Directory -Force (Join-Path $folder 'js/modules') | Out-Null
  Copy-Item (Join-Path $root 'js/molique-script.js') (Join-Path $folder 'js')
  Copy-Item (Join-Path $root 'js/modules/*.js') (Join-Path $folder 'js/modules')

  if ($WithFonts) {
    Copy-Item -Recurse (Join-Path $root 'fonts') (Join-Path $folder 'fonts')
  }

  New-Item -ItemType Directory -Force (Join-Path $folder 'img/flags') | Out-Null
  Copy-Item (Join-Path $root 'img/flags/*.svg') (Join-Path $folder 'img/flags')

  foreach ($f in @('starter.html', 'README.md', 'LICENSE', 'NOTICE', 'llms.txt', 'purgecss.safelist.cjs')) {
    if (Test-Path (Join-Path $root $f)) { Copy-Item (Join-Path $root $f) $folder }
  }

  if ($WithScssSource) {
    New-Item -ItemType Directory -Force (Join-Path $folder 'css/scss') | Out-Null
    # tylko zrodla .scss (bez luster .md i kontekstu AI)
    Copy-Item -Recurse (Join-Path $root 'css/scss/*') (Join-Path $folder 'css/scss')
    Get-ChildItem (Join-Path $folder 'css/scss') -Recurse -Include '*.md' | Remove-Item -Force
  }

  return $folder
}

function New-PackageZip {
  param([string]$Folder, [string]$ZipName)
  $zipPath = Join-Path $dist $ZipName
  if (Test-Path $zipPath) { Remove-Item $zipPath }
  Compress-Archive -Path $Folder -DestinationPath $zipPath
  return $zipPath
}

Write-Host "2/4  Budowanie 4 wariantow Production..."
$prodVariants = @(
  @{ suffix = '';            format = 'min';  fonts = $false },
  @{ suffix = '-fonts';      format = 'min';  fonts = $true },
  @{ suffix = '-full';       format = 'full'; fonts = $false },
  @{ suffix = '-full-fonts'; format = 'full'; fonts = $true }
)
$results = @()
foreach ($v in $prodVariants) {
  $name = "molique-$version$($v.suffix)"
  $folder = New-PackageFolder -Name $name -CssFormat $v.format -WithFonts $v.fonts -WithScssSource $false
  $results += New-PackageZip -Folder $folder -ZipName "$name.zip"
}

Write-Host "3/4  Budowanie 2 wariantow Source (pelna CSS + scss/)..."
$srcVariants = @(
  @{ suffix = '-src';       fonts = $false },
  @{ suffix = '-src-fonts'; fonts = $true }
)
foreach ($v in $srcVariants) {
  $name = "molique-$version$($v.suffix)"
  $folder = New-PackageFolder -Name $name -CssFormat 'full' -WithFonts $v.fonts -WithScssSource $true
  $results += New-PackageZip -Folder $folder -ZipName "$name.zip"
}

Remove-Item -Recurse -Force $stage

Write-Host ""
Write-Host "4/4  Gotowe:"
foreach ($zip in $results) {
  $kb = [math]::Round((Get-Item $zip).Length / 1KB)
  Write-Host ("  {0}  ({1} KB)" -f $zip, $kb)
}
