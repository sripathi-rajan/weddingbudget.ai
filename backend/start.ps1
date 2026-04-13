# WeddingBudget.AI — Backend Startup Script
# Uses the existing .venv (Python 3.11) in this directory

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$VenvPython = Join-Path $ScriptDir ".venv\Scripts\python.exe"

# ── Verify venv exists ─────────────────────────────────────────────────────────
if (-not (Test-Path $VenvPython)) {
    Write-Host "ERROR: .venv not found at $VenvPython" -ForegroundColor Red
    Write-Host "Create it with: py -3.11 -m venv .venv" -ForegroundColor Yellow
    exit 1
}

$PyVersion = & $VenvPython --version 2>&1
Write-Host "Using $PyVersion from .venv" -ForegroundColor Cyan

# ── Install / sync dependencies ────────────────────────────────────────────────
Write-Host "Checking dependencies..." -ForegroundColor Cyan
& $VenvPython -m pip install -q -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: pip install failed" -ForegroundColor Red
    exit 1
}

# ── Ensure data directory exists ───────────────────────────────────────────────
$DataDir = Join-Path $ScriptDir "data"
if (-not (Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir | Out-Null
}

# ── Start uvicorn ──────────────────────────────────────────────────────────────
$Port = if ($env:PORT) { $env:PORT } else { "8000" }
Write-Host "Starting backend on http://0.0.0.0:$Port ..." -ForegroundColor Green
Write-Host "Docs: http://localhost:$Port/docs" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop.`n" -ForegroundColor Yellow

& $VenvPython -m uvicorn main:app --host 0.0.0.0 --port $Port --reload
