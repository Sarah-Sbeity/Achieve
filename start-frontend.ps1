# Run this script to start the frontend. Then open the URL it prints in your browser.
Set-Location $PSScriptRoot\frontend
Write-Host "Starting frontend... Open the URL below in your browser (use the ROOT url, e.g. http://localhost:5173 with nothing after the port)." -ForegroundColor Cyan
Write-Host ""
npx --yes serve -s . -l 5173
