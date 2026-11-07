# ==============================================================================
# ZenVQ Universal Live Translator — 1-Click Project Installer
# ==============================================================================
# Mounts translation engine, React language dock and agent rules into any project.
# Strict Zero Oxford Comma and Project Isolation Compliant.
# ==============================================================================

param (
    [Parameter(Mandatory = $true, HelpMessage = "Absolute path to the target project directory")]
    [string]$TargetProject
)

$ErrorActionPreference = "Stop"

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  ZenVQ Universal Live Translator: 1-Click Installer                " -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan

# 1. Path Verification
if (-not (Test-Path $TargetProject)) {
    Write-Error "Target project path does not exist: $TargetProject"
    exit 1
}

$ResolvedTarget = (Resolve-Path $TargetProject).Path
Write-Host "Target Project: $ResolvedTarget" -ForegroundColor Gray

# Security boundary check
if ($ResolvedTarget -match "AppData" -or $ResolvedTarget -match "C:\\Windows" -or $ResolvedTarget -eq "C:\Users\BaBaPuson" -or $ResolvedTarget -match "\\Temp(\\|$)" -or $ResolvedTarget -match "\\tmp(\\|$)") {
    Write-Error "Target path violates system isolation boundary policy. Aborting."
    exit 1
}

$HubRoot = Split-Path -Parent $PSScriptRoot
$SourceEngine = Join-Path $HubRoot "core\zenvq-translate.js"
$SourceDock = Join-Path $HubRoot "components\ZenVQLanguageDock.tsx"
$SourceRule = Join-Path $HubRoot "rules\auto-translate-zenvq.md"

if (-not (Test-Path $SourceEngine)) {
    Write-Error "Source translation engine not found at: $SourceEngine"
    exit 1
}

# 2. Detect Project Archetype
$IsNextJs = (Test-Path (Join-Path $ResolvedTarget "package.json")) -and ((Get-Content (Join-Path $ResolvedTarget "package.json") -Raw) -match "next")
$HasSrc = Test-Path (Join-Path $ResolvedTarget "src")

Write-Host "Detected Archetype: $(if ($IsNextJs) { 'Next.js Project' } else { 'Standard Web Project' })" -ForegroundColor Yellow

# 3. Deploy Translation Engine
$TargetPublicLib = if ($IsNextJs) {
    Join-Path $ResolvedTarget "public\lib"
} else {
    Join-Path $ResolvedTarget "lib"
}

if (-not (Test-Path $TargetPublicLib)) {
    New-Item -ItemType Directory -Path $TargetPublicLib -Force | Out-Null
}

$DestEngine = Join-Path $TargetPublicLib "zenvq-translate.js"
Copy-Item -Path $SourceEngine -Destination $DestEngine -Force
Write-Host "[OK] Translation Engine copied to: $DestEngine" -ForegroundColor Green

# 4. Deploy React Component if applicable
if ($IsNextJs) {
    $TargetComponents = if ($HasSrc) {
        Join-Path $ResolvedTarget "src\components"
    } else {
        Join-Path $ResolvedTarget "components"
    }

    if (-not (Test-Path $TargetComponents)) {
        New-Item -ItemType Directory -Path $TargetComponents -Force | Out-Null
    }

    $DestDock = Join-Path $TargetComponents "ZenVQLanguageDock.tsx"
    Copy-Item -Path $SourceDock -Destination $DestDock -Force
    Write-Host "[OK] React Language Dock copied to: $DestDock" -ForegroundColor Green
}

# 5. Mount Agent Rule for Future Pair Programming
$TargetAgentRules = Join-Path $ResolvedTarget ".agents\rules"
if (-not (Test-Path $TargetAgentRules)) {
    New-Item -ItemType Directory -Path $TargetAgentRules -Force | Out-Null
}

$DestRule = Join-Path $TargetAgentRules "auto-translate-zenvq.md"
Copy-Item -Path $SourceRule -Destination $DestRule -Force
Write-Host "[OK] Agent Rule mounted to: $DestRule" -ForegroundColor Green

# 6. Verification and Integration Guidance
Write-Host "`n---------------------------------------------------------------------" -ForegroundColor Cyan
Write-Host "Integration Steps Required:" -ForegroundColor White
Write-Host "---------------------------------------------------------------------" -ForegroundColor Cyan

if ($IsNextJs) {
    Write-Host "1. In app/layout.tsx, add the engine script to <head>:" -ForegroundColor White
    Write-Host '   <script src="/lib/zenvq-translate.js" defer />' -ForegroundColor Gray
    Write-Host "`n2. In your navigation header component, import and mount the dock:" -ForegroundColor White
    Write-Host '   import { ZenVQLanguageDock } from "@/components/ZenVQLanguageDock";' -ForegroundColor Gray
    Write-Host '   <ZenVQLanguageDock variant="header" theme="engineering" />' -ForegroundColor Gray
    Write-Host "`n3. Ensure your header action wrapper includes:" -ForegroundColor White
    Write-Host '   dir="ltr" data-zenvq-nav-anchor="true"' -ForegroundColor Gray
} else {
    Write-Host "1. In index.html, add the script tag before </body>:" -ForegroundColor White
    Write-Host '   <script src="lib/zenvq-translate.js" data-auto-widget="true" defer></script>' -ForegroundColor Gray
}

Write-Host "`nAll Translation Engine assets and rules have been successfully installed!" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Cyan
