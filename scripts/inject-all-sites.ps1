# ==============================================================================
# ZenVQ Universal Translator — Ecosystem-Wide Auto-Deployer
# ==============================================================================
# Injects the live translation engine, React dock and agent rules into every
# website in the ZenVQ ecosystem with a single command execution.
# Strict Zero Oxford Comma and Project Isolation Compliant.
# ==============================================================================

param (
    [string]$ProjectsRoot = "D:\All coding installation tools\All My Main Project in real world"
)

$ErrorActionPreference = "Continue"

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  ZenVQ Universal Live Translator: Ecosystem-Wide Injector            " -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "Projects Root: $ProjectsRoot`n" -ForegroundColor Gray

$HubRoot = Split-Path -Parent $PSScriptRoot
$Installer = Join-Path $PSScriptRoot "install-translator.ps1"
$Verifier = Join-Path $PSScriptRoot "verify-translator.ps1"

$Sites = @(
    "ZenVQ-EcoSystem",
    "ZenVQ-Agency",
    "ZenVQ-Tools",
    "templetes.zenvq.com",
    "Puson-Dev",
    "ZenVQ-Suggests",
    "Rafij-portfolio",
    "Natures-Intimacy"
)

$Report = @()

foreach ($siteName in $Sites) {
    $sitePath = Join-Path $ProjectsRoot $siteName
    Write-Host "---------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "Processing: $siteName" -ForegroundColor Yellow

    if (-not (Test-Path $sitePath)) {
        Write-Host "[SKIP] Directory not found: $sitePath" -ForegroundColor DarkYellow
        $Report += [PSCustomObject]@{
            Site = $siteName
            Status = "Not Found"
            Engine = "Missing"
        }
        continue
    }

    try {
        & powershell -ExecutionPolicy Bypass -File $Installer -TargetProject $sitePath | Out-Null
        Write-Host "[OK] Translation assets successfully injected into $siteName" -ForegroundColor Green

        $hasEngine = (Test-Path (Join-Path $sitePath "public\lib\zenvq-translate.js")) -or (Test-Path (Join-Path $sitePath "lib\zenvq-translate.js"))
        $Report += [PSCustomObject]@{
            Site = $siteName
            Status = "Active"
            Engine = if ($hasEngine) { "Installed" } else { "Pending" }
        }
    } catch {
        Write-Host "[ERROR] Failed to inject into ${siteName}: $($_.Exception.Message)" -ForegroundColor Red
        $Report += [PSCustomObject]@{
            Site = $siteName
            Status = "Error"
            Engine = "Failed"
        }
    }
}

Write-Host "`n=====================================================================" -ForegroundColor Cyan
Write-Host "  Ecosystem Deployment Summary Table                                 " -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
$Report | Format-Table -AutoSize
