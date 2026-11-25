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
    @{ Name = "ZenVQ-EcoSystem"; Rel = "ZenVQ-EcoSystem" },
    @{ Name = "ZenVQ-Agency"; Rel = "ZenVQ-Agency" },
    @{ Name = "ZenVQ-Tools (OneApp Web)"; Rel = "ZenVQ-Tools\01-OneApp-Ecosystem\01-Apps\oneapp-website" },
    @{ Name = "ZenVQ-Tools (CV Maker)"; Rel = "ZenVQ-Tools\02-CV-and-Biodata-Maker" },
    @{ Name = "Templates Hub"; Rel = "ZenVQ-Tools\03-Templates-Hub" },
    @{ Name = "Rafij-portfolio"; Rel = "ZenVQ-Tools\03-Templates-Hub\Rafij-portfolio" },
    @{ Name = "Saif-portfolio"; Rel = "ZenVQ-Tools\03-Templates-Hub\Saif-portfolio" },
    @{ Name = "Puson-Dev"; Rel = "Puson-Dev" },
    @{ Name = "ZenVQ-Suggests"; Rel = "ZenVQ-Suggests\zenvq-suggest" },
    @{ Name = "Natures-Intimacy"; Rel = "Natures-Intimacy" }
)

$Report = @()

foreach ($site in $Sites) {
    $siteName = $site.Name
    $sitePath = Join-Path $ProjectsRoot $site.Rel
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
