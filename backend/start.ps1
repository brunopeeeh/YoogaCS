# Inicia o backend Yooga CS Coach (Python 3.12+ recomendado)
$env:PYTHONIOENCODING = "utf-8"
Set-Location $PSScriptRoot

if (Test-Path ".\.venv\Scripts\python.exe") {
    & .\.venv\Scripts\pip.exe install -r requirements.txt -q
    & .\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
} else {
    py -3.12 -m pip install -r requirements.txt -q
    py -3.12 -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
}
