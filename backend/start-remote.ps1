# Backend acessível na rede local (0.0.0.0:8000)
$env:PYTHONIOENCODING = "utf-8"
Set-Location $PSScriptRoot

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.PrefixOrigin -ne "WellKnown" } | Select-Object -First 1).IPAddress
Write-Host ""
Write-Host "Backend remoto: http://${ip}:8000" -ForegroundColor Cyan
Write-Host "Docs:           http://${ip}:8000/docs" -ForegroundColor DarkGray
Write-Host ""

if (Test-Path ".\.venv\Scripts\python.exe") {
    & .\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    py -3.12 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
} else {
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
}
