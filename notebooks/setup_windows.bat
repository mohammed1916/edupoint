@echo off
echo Setting up Gemma3 Video Inference for Windows...
echo ================================================

REM Set environment variables to avoid C compiler issues
set TORCHDYNAMO_DISABLE=1
set TORCH_COMPILE_DISABLE=1
set TORCH_LOGS=+dynamo

echo Environment variables set for Windows compatibility...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo Python found, checking version...
python --version

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install build tools for Windows
echo Installing build tools...
pip install setuptools wheel ninja

REM Install PyTorch with CUDA support
echo Installing PyTorch with CUDA support...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

REM Install other dependencies
echo Installing other dependencies...
pip install -r requirements.txt

echo.
echo ================================================
echo Setup completed!
echo.
echo To run the video inference:
echo 1. python video_inference_example.py
echo 2. Or open Gemma3_Video_Inference.ipynb in Jupyter
echo.
echo If you encounter C compiler errors, the script will
echo automatically use alternative methods to avoid them.
echo ================================================
pause 