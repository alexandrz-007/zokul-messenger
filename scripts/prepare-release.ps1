param(
  [string]$Target = "../zokul-deploy",
  [switch]$SkipChecks,
  [switch]$NoGitInit,
  [switch]$FreshServerData
)

$ErrorActionPreference = "Stop"

function Resolve-TargetPath([string]$PathValue, [string]$BaseDir) {
  if ([System.IO.Path]::IsPathRooted($PathValue)) {
    return [System.IO.Path]::GetFullPath($PathValue)
  }
  return [System.IO.Path]::GetFullPath((Join-Path $BaseDir $PathValue))
}

function Remove-TargetContentsExceptRuntime([string]$TargetDir) {
  $preserveNames = @("ssl", ".env")
  if (-not (Test-Path -LiteralPath $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
    return
  }

  Get-ChildItem -LiteralPath $TargetDir -Force | ForEach-Object {
    if ($preserveNames -contains $_.Name) {
      return
    }
    Remove-Item -LiteralPath $_.FullName -Recurse -Force
  }
}

function Copy-ReleaseTree([string]$Source, [string]$Destination) {
  $excludeDirNames = @(
    ".git",
    ".github",
    ".agents",
    ".codex",
    "docs",
    "node_modules",
    "dist",
    "__tests__",
    "reports",
    "uploads",
    "test-uploads"
  )
  $excludeFileNames = @(
    ".env",
    "tsconfig.d.ts",
    "vite.config.d.ts",
    "fixer-brain.md",
    "nginx.local.conf"
  )
  $excludeFilePatterns = @(
    "*.log",
    "*.tsbuildinfo",
    "*.local.yml"
  )

  if (-not (Test-Path -LiteralPath $Destination)) {
    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
  }

  $sourceRoot = (Resolve-Path -LiteralPath $Source).Path.TrimEnd('\')
  $stack = New-Object System.Collections.Stack
  $stack.Push((Get-Item -LiteralPath $sourceRoot))

  while ($stack.Count -gt 0) {
    $dir = $stack.Pop()
    $relativeDir = $dir.FullName.Substring($sourceRoot.Length).TrimStart('\')
    $targetDir = if ($relativeDir) { Join-Path $Destination $relativeDir } else { $Destination }
    if (-not (Test-Path -LiteralPath $targetDir)) {
      New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    Get-ChildItem -LiteralPath $dir.FullName -Force | ForEach-Object {
      if ($_.PSIsContainer) {
        if ($excludeDirNames -contains $_.Name) {
          return
        }
        $stack.Push($_)
        return
      }

      if ($excludeFileNames -contains $_.Name) {
        return
      }
      foreach ($pattern in $excludeFilePatterns) {
        if ($_.Name -like $pattern) {
          return
        }
      }

      $relativeFile = $_.FullName.Substring($sourceRoot.Length).TrimStart('\')
      $targetFile = Join-Path $Destination $relativeFile
      $targetParent = Split-Path -Parent $targetFile
      if (-not (Test-Path -LiteralPath $targetParent)) {
        New-Item -ItemType Directory -Path $targetParent -Force | Out-Null
      }
      Copy-Item -LiteralPath $_.FullName -Destination $targetFile -Force
    }
  }
}

function Write-FreshServerDataScript([string]$TargetDir) {
  $script = @'
#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" != "--confirm-delete-data" ]]; then
  echo "This will delete Zokul production Docker volumes: database, redis, uploads."
  echo "Run only for a fresh/empty server install or when you intentionally want to wipe all accounts/messages/files."
  echo "Usage: ./scripts/fresh-start-prod.sh --confirm-delete-data"
  exit 1
fi

docker compose -f docker-compose.prod.yml down -v --remove-orphans
docker compose -f docker-compose.prod.yml up -d --build

echo "Fresh Zokul production stack started with empty Docker volumes."
'@
  Set-Content -LiteralPath (Join-Path $TargetDir "scripts\fresh-start-prod.sh") -Value $script -Encoding UTF8
}

function Write-ReleaseManifest([string]$TargetDir, [string]$RepoDir, [string]$Branch, [string]$Commit) {
  $now = Get-Date -Format "yyyy-MM-dd HH:mm:ss K"
  $status = git -C $RepoDir status --short --branch | Out-String
  $statusBlock = (($status.TrimEnd() -split "`r?`n") | ForEach-Object { "    $_" }) -join "`n"
  $fileCount = (Get-ChildItem -LiteralPath $TargetDir -Recurse -File -Force | Measure-Object).Count
  $sizeMb = [math]::Round(((Get-ChildItem -LiteralPath $TargetDir -Recurse -File -Force | Measure-Object -Property Length -Sum).Sum / 1MB), 2)
  $sslState = if (Test-Path -LiteralPath (Join-Path $TargetDir "ssl")) {
    $sslFiles = Get-ChildItem -LiteralPath (Join-Path $TargetDir "ssl") -File -Force -ErrorAction SilentlyContinue
    if ($sslFiles.Count -gt 0) { "preserved ($($sslFiles.Count) file(s))" } else { "directory preserved, currently empty" }
  } else {
    "missing"
  }
  $envState = if (Test-Path -LiteralPath (Join-Path $TargetDir ".env")) { "preserved" } else { "missing; create from .env.example before production start" }

  $manifest = @"
# Zokul Release Manifest

Generated: $now
Source: $RepoDir
Target: $TargetDir
Branch: $Branch
Commit: $Commit

## Verification

- npm.cmd run build: $($(if ($SkipChecks) { "skipped by flag" } else { "passed before packaging" }))
- npm.cmd test: $($(if ($SkipChecks) { "skipped by flag" } else { "passed before packaging" }))
- git diff --check: $($(if ($SkipChecks) { "skipped by flag" } else { "passed before packaging; CRLF warnings may be printed by Git on Windows" }))

## Runtime Preservation

- ssl: $sslState
- .env: $envState
- fresh server data mode: $($(if ($FreshServerData) { "enabled; scripts/fresh-start-prod.sh included" } else { "disabled" }))

## Package

- Files: $fileCount
- Size: $sizeMb MB

## Excluded

- .git, .github, .agents, .codex
- docs, node_modules, dist, __tests__, reports
- uploads, test-uploads
- .env, *.log, *.tsbuildinfo, *.local.yml
- generated declaration shims and local-only notes

## Source Working Tree

$statusBlock

## Server Reminder

Before production start, ensure the deploy folder contains:

- .env with production secrets
- ssl/fullchain.pem and ssl/privkey.pem, or run scripts/setup-ssl.sh on the server

Start command on the server:

    docker compose -f docker-compose.prod.yml up -d --build

For a deliberately empty server, run:

    ./scripts/fresh-start-prod.sh --confirm-delete-data
"@

  Set-Content -LiteralPath (Join-Path $TargetDir "RELEASE_MANIFEST.md") -Value $manifest -Encoding UTF8
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoDir = [System.IO.Path]::GetFullPath((Join-Path $ScriptDir ".."))
$TargetDir = Resolve-TargetPath $Target $RepoDir
$StageDir = Join-Path ([System.IO.Path]::GetTempPath()) ("zokul-release-stage-" + [guid]::NewGuid().ToString("N"))
$Branch = (git -C $RepoDir branch --show-current).Trim()
$Commit = (git -C $RepoDir rev-parse --short HEAD).Trim()

Write-Host "==> Preparing Zokul release package" -ForegroundColor Green
Write-Host "    Source: $RepoDir"
Write-Host "    Target: $TargetDir"
Write-Host "    Runtime preserved in target: ssl/, .env"

if (-not $SkipChecks) {
  Write-Host "==> Running release checks..." -ForegroundColor Green
  Push-Location $RepoDir
  try {
    npm.cmd run build
    npm.cmd test
    git diff --check
  } finally {
    Pop-Location
  }
}

Write-Host "==> Creating staging copy..." -ForegroundColor Green
New-Item -ItemType Directory -Path $StageDir -Force | Out-Null
Copy-ReleaseTree -Source $RepoDir -Destination $StageDir

Write-Host "==> Replacing deploy code while preserving runtime files..." -ForegroundColor Green
Remove-TargetContentsExceptRuntime -TargetDir $TargetDir
Copy-ReleaseTree -Source $StageDir -Destination $TargetDir

if (-not (Test-Path -LiteralPath (Join-Path $TargetDir "ssl"))) {
  New-Item -ItemType Directory -Path (Join-Path $TargetDir "ssl") -Force | Out-Null
}

if ($FreshServerData) {
  Write-FreshServerDataScript -TargetDir $TargetDir
}

Write-ReleaseManifest -TargetDir $TargetDir -RepoDir $RepoDir -Branch $Branch -Commit $Commit

if (-not $NoGitInit) {
  Write-Host "==> Initializing release git repository..." -ForegroundColor Green
  Push-Location $TargetDir
  try {
    if (-not (Test-Path -LiteralPath ".git")) {
      git init | Out-Null
    }
    git add -A
  } finally {
    Pop-Location
  }
}

Remove-Item -LiteralPath $StageDir -Recurse -Force -ErrorAction SilentlyContinue

$fileCount = (Get-ChildItem -LiteralPath $TargetDir -Recurse -File -Force | Measure-Object).Count
$size = [math]::Round(((Get-ChildItem -LiteralPath $TargetDir -Recurse -File -Force | Measure-Object -Property Length -Sum).Sum / 1MB), 2)

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Release copy ready at: $TargetDir" -ForegroundColor Green
Write-Host "  Size: $size MB  Files: $fileCount"
Write-Host "  Preserved: ssl/, .env if present"
Write-Host ""
Write-Host "  Verify package Docker build:" -ForegroundColor Yellow
Write-Host "    cd $TargetDir"
Write-Host "    docker compose -f docker-compose.prod.yml build"
Write-Host ""
Write-Host "  Production start requires .env and SSL certificates:" -ForegroundColor Yellow
Write-Host "    docker compose -f docker-compose.prod.yml up -d --build"
Write-Host "================================================" -ForegroundColor Cyan
