param(
  [string]$Target = "../zokul-deploy"
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoDir = Resolve-Path "$ScriptDir/.."
$TargetDir = if (Split-Path $Target -IsAbsolute) { $Target } else { Join-Path (Resolve-Path $ScriptDir) $Target }

Write-Host "==> Copying project to $TargetDir ..." -ForegroundColor Green

if (Test-Path $TargetDir) { Remove-Item -Recurse -Force $TargetDir }
New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null

# Robocopy with correct exclude syntax via cmd /c
$src = $RepoDir
$dst = $TargetDir
cmd /c "robocopy `"$src`" `"$dst`" /MIR /XD .git docs reports node_modules __tests__ dist .github uploads test-uploads /XF tsconfig.d.ts vite.config.d.ts *.local.yml fixer-brain.md /NJH /NJS /NP /NS /NC /NFL /NDL" 2>&1 | Out-Null

# Remove leftover dev-only files that robocopy may have included
Remove-Item -Force "$TargetDir\fixer-brain.md" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$TargetDir\server\uploads" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$TargetDir\server\test-uploads" -ErrorAction SilentlyContinue
Remove-Item -Force "$TargetDir\client\nginx.local.conf" -ErrorAction SilentlyContinue

Write-Host "==> Initializing fresh git repo ..." -ForegroundColor Green
Push-Location $TargetDir
git init 2>&1 | Out-Null
Pop-Location

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
$size = (Get-ChildItem -Recurse $TargetDir | Measure-Object -Property Length -Sum).Sum / 1MB
$fileCount = (Get-ChildItem -Recurse $TargetDir -File).Count
Write-Host "  Production copy ready at: $TargetDir" -ForegroundColor Green
Write-Host "  Size: $([math]::Round($size, 1)) MB  Files: $fileCount"
Write-Host ""
Write-Host "  To commit and push to GitHub:" -ForegroundColor Yellow
Write-Host "    cd $TargetDir"
Write-Host "    git config user.email 'your@email.com'"
Write-Host "    git config user.name 'Your Name'"
Write-Host "    git commit -m 'Production deploy'"
Write-Host "    git remote add origin git@github.com:YOUR_USER/zokul-deploy.git"
Write-Host "    git push -u origin master"
Write-Host "================================================" -ForegroundColor Cyan
