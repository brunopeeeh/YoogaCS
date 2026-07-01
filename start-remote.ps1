# Sobe frontend + backend para teste remoto (LAN)
$root = $PSScriptRoot
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.PrefixOrigin -ne "WellKnown" } | Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "=== Yooga CS — modo remoto ===" -ForegroundColor Green
Write-Host "Frontend: http://${ip}:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://${ip}:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Na mesma rede Wi-Fi/LAN, abra o link do Frontend no celular ou outro PC." -ForegroundColor Yellow
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-File", "$root\backend\start-remote.ps1"
Start-Sleep -Seconds 2
Set-Location $root
npm run dev -- --host 0.0.0.0 --port 5173
