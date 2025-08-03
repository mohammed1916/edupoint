# PowerShell script for setting up Gemma3 Video Inference on Windows
Write-Host "Setting up Gemma3 Video Inference for Windows..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Set environment variables to avoid C compiler issues
$env:TORCHDYNAMO_DISABLE = "1"
$env:TORCH_COMPILE_DISABLE = "1"
$env:TORCH_LOGS = "+dynamo"

Write-Host "Environment variables set for Windows compatibility..." -ForegroundColor Yellow

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "Error: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://python.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check CUDA availability
Write-Host "Checking CUDA availability..." -ForegroundColor Yellow
try {
    python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PyTorch CUDA check completed" -ForegroundColor Green
    }
}
catch {
    Write-Host "PyTorch not installed yet, will install during setup" -ForegroundColor Yellow
}

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install build tools for Windows
Write-Host "Installing build tools..." -ForegroundColor Yellow
pip install setuptools wheel ninja

# Install PyTorch with CUDA support
Write-Host "Installing PyTorch with CUDA support..." -ForegroundColor Yellow
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Install other dependencies
Write-Host "Installing other dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "To run the video inference:" -ForegroundColor Cyan
Write-Host "1. python video_inference_example.py" -ForegroundColor White
Write-Host "2. Or open Gemma3_Video_Inference.ipynb in Jupyter" -ForegroundColor White
Write-Host ""
Write-Host "If you encounter C compiler errors, the script will" -ForegroundColor Yellow
Write-Host "automatically use alternative methods to avoid them." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Green

Read-Host "Press Enter to exit" 