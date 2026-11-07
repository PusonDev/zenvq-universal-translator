# ==============================================================================
# ZenVQ Universal Live Translator — Project Health and Audit Verifier
# ==============================================================================
# Audits target project codebase for translation engine, dock and RTL anchors.
# Strict Zero Oxford Comma and Project Isolation Compliant.
# ==============================================================================

param (
    [Parameter(Mandatory = $true, HelpMessage = "Absolute path to the target project directory")]
    [string]$TargetProject
)

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  ZenVQ Live Translator: Health and Readiness Audit                  " -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan

if (-not (Test-Path $TargetProject)) {
    Write-Error "Target project path not found: $TargetProject"
    exit 1
}

$ResolvedTarget = (Resolve-Path $TargetProject).Path
Write-Host "Auditing Target: $ResolvedTarget`n" -ForegroundColor Gray

$Passed = 0
$Warnings = 0

# Check 1: Engine script presence
$EnginePaths = @(
    (Join-Path $ResolvedTarget "public\lib\zenvq-translate.js"),
    (Join-Path $ResolvedTarget "lib\zenvq-translate.js")
)
$FoundEngine = @($EnginePaths | Where-Object { Test-Path $_ })

if ($FoundEngine.Count -gt 0) {
    Write-Host "[PASS] Translation Engine Script detected at: $($FoundEngine[0])" -ForegroundColor Green
    $Passed++
} else {
    Write-Host "[WARN] Translation Engine Script not found in public/lib or lib" -ForegroundColor Yellow
    $Warnings++
}

# Check 2: React Dock presence
$DockPaths = @(
    (Join-Path $ResolvedTarget "components\ZenVQLanguageDock.tsx"),
    (Join-Path $ResolvedTarget "src\components\ZenVQLanguageDock.tsx")
)
$FoundDock = @($DockPaths | Where-Object { Test-Path $_ })

if ($FoundDock.Count -gt 0) {
    Write-Host "[PASS] React Language Dock detected at: $($FoundDock[0])" -ForegroundColor Green
    $Passed++
} else {
    Write-Host "[INFO] React Language Dock component not found (may be static HTML project)" -ForegroundColor Gray
}

# Check 3: Script tag injection in layout or html
$LayoutFiles = Get-ChildItem -Path $ResolvedTarget -Recurse -File -Include "layout.tsx", "layout.jsx", "index.html" | Where-Object { $_.FullName -notmatch '\\(node_modules|\.next|\.git|dist|out)\\' }
$ScriptInjected = $false

foreach ($file in $LayoutFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if ($content -match "zenvq-translate\.js") {
        Write-Host "[PASS] Script injection found in: $($file.FullName)" -ForegroundColor Green
        $ScriptInjected = $true
        $Passed++
        break
    }
}

if (-not $ScriptInjected) {
    Write-Host "[WARN] No script tag loading zenvq-translate.js found in layout.tsx or index.html" -ForegroundColor Yellow
    $Warnings++
}

# Check 4: RTL Navigation Anchor presence
$NavAnchorFound = $false
$SourceFiles = Get-ChildItem -Path $ResolvedTarget -Recurse -File -Include "*.tsx", "*.jsx", "*.html" | Where-Object { $_.FullName -notmatch '\\(node_modules|\.next|\.git|dist|out)\\' }

foreach ($file in $SourceFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if ($content -match "data-zenvq-nav-anchor" -or $content -match "data-zenvq-dock") {
        Write-Host "[PASS] Zero-displacement navigation anchor detected in: $($file.FullName)" -ForegroundColor Green
        $NavAnchorFound = $true
        $Passed++
        break
    }
}

if (-not $NavAnchorFound) {
    Write-Host "[WARN] data-zenvq-nav-anchor attribute not found on header container" -ForegroundColor Yellow
    $Warnings++
}

Write-Host "`n---------------------------------------------------------------------" -ForegroundColor Cyan
Write-Host "Audit Results: $Passed checks passed | $Warnings warnings" -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Cyan
