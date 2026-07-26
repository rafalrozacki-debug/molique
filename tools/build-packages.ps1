<#
  molique - budowanie paczek do pobrania
  --------------------------------------
  Generuje 18 paczek ZIP w dist/, krzyzujac TRZY niezalezne wybory: jezyk
  komentarzy w kodzie (pl/en/de), format CSS (pelna / zminifikowana) i
  fonty (dolaczone / nie). Jezyk PL to oryginal (kod repo, bez zmian),
  EN/DE to podmiana tresci komentarzy w tymczasowej kopii - patrz
  tools/i18n-comments/ (apply-translations.mjs + dict.en.json/dict.de.json)
  - zeby ktos, kto trafil na download.en.html/download.de.html, nie dostal
  po cichu kodu skomentowanego wylacznie po polsku.

  Nazwy plikow: PL bez sufiksu jezyka (wsteczna zgodnosc z istniejacymi
  linkami), EN/DE dostaja "-en"/"-de" zaraz po numerze wersji.

  Production (zawsze CSS + JS, bez scss/), na kazdy jezyk:
    - molique-<wersja>[-en|-de].zip             min,  bez fontow (domyslny)
    - molique-<wersja>[-en|-de]-fonts.zip       min,  z fontami
    - molique-<wersja>[-en|-de]-full.zip        pelna, bez fontow
    - molique-<wersja>[-en|-de]-full-fonts.zip  pelna, z fontami

  Source (zawsze pelna CSS + scss/ - to jego sens, bez wariantu min), na
  kazdy jezyk:
    - molique-<wersja>[-en|-de]-src.zip         bez fontow (domyslny)
    - molique-<wersja>[-en|-de]-src-fonts.zip   z fontami

  Wymaga: npx (Node) + Dart Sass (npx sass). Uruchom z dowolnego miejsca:
    powershell -File tools/build-packages.ps1
#>

# Katalog glowny repo (ten skrypt jest w tools/)
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

# package.json "version" to JEDYNE zrodlo prawdy numeru wersji w calym repo
# (patrz tez {{ __version }} w vite.config.js) - zero recznego wpisywania
# tutaj, zeby nie rozjechalo sie z reszta strony przy kolejnym wydaniu.
$version = (Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json).version

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
# zrodla scss/, jezyk komentarzy) i zwraca sciezke do niego. Wspolna dla
# Production i Source - rozni je tylko to, jakie parametry dostana.
function New-PackageFolder {
  param(
    [string]$Name,
    [ValidateSet('full', 'min')][string]$CssFormat,
    [bool]$WithFonts,
    [bool]$WithScssSource,
    [ValidateSet('pl', 'en', 'de')][string]$Lang = 'pl'
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

  # EN/DE: podmien tresc komentarzy w skopiowanym .css/.scss/.js na jezyk
  # strony, z ktorej pochodzi link do pobrania - patrz tools/i18n-comments/.
  # PL (domyslny) zostaje kodem repo bez zadnej modyfikacji.
  if ($Lang -ne 'pl') {
    # Out-Null jest KRYTYCZNE: bez niego stdout node (console.log) trafia do
    # strumienia zwracanego przez funkcje PowerShell i dokleja sie do $folder
    # (ostatniej "zwroconej" wartosci), psujac sciezke przekazywana dalej do
    # Compress-Archive - zlapane na pierwszym uruchomieniu (18 spakowanych
    # do bledny "Compress-Archive: path does not exist" z tekstem logu node
    # wewnatrz sciezki).
    & node (Join-Path $root 'tools/i18n-comments/apply-translations.mjs') $Lang $folder | Out-Null
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

$prodVariants = @(
  @{ suffix = '';            format = 'min';  fonts = $false },
  @{ suffix = '-fonts';      format = 'min';  fonts = $true },
  @{ suffix = '-full';       format = 'full'; fonts = $false },
  @{ suffix = '-full-fonts'; format = 'full'; fonts = $true }
)
$srcVariants = @(
  @{ suffix = '-src';       fonts = $false },
  @{ suffix = '-src-fonts'; fonts = $true }
)
# "" (PL, wsteczna zgodnosc z istniejacymi linkami) musi byc PIERWSZY -
# apply-translations.mjs nigdy nie rusza folderu PL, wiec kolejnosc jezykow
# dla PL nie ma znaczenia, ale trzymamy PL jako baze/domyslny.
$langs = @(
  @{ code = 'pl'; suffix = '' },
  @{ code = 'en'; suffix = '-en' },
  @{ code = 'de'; suffix = '-de' }
)

Write-Host "2/4  Budowanie wariantow Production (4 formaty x 3 jezyki)..."
$results = @()
foreach ($lang in $langs) {
  foreach ($v in $prodVariants) {
    $name = "molique-$version$($lang.suffix)$($v.suffix)"
    $folder = New-PackageFolder -Name $name -CssFormat $v.format -WithFonts $v.fonts -WithScssSource $false -Lang $lang.code
    $results += New-PackageZip -Folder $folder -ZipName "$name.zip"
  }
}

Write-Host "3/4  Budowanie wariantow Source (pelna CSS + scss/, 2 formaty x 3 jezyki)..."
foreach ($lang in $langs) {
  foreach ($v in $srcVariants) {
    $name = "molique-$version$($lang.suffix)$($v.suffix)"
    $folder = New-PackageFolder -Name $name -CssFormat 'full' -WithFonts $v.fonts -WithScssSource $true -Lang $lang.code
    $results += New-PackageZip -Folder $folder -ZipName "$name.zip"
  }
}

Remove-Item -Recurse -Force $stage

Write-Host ""
Write-Host "4/4  Gotowe ($($results.Count) paczek):"
foreach ($zip in $results) {
  $kb = [math]::Round((Get-Item $zip).Length / 1KB)
  Write-Host ("  {0}  ({1} KB)" -f $zip, $kb)
}
