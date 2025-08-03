# Gemma3 Video Inference Project

This project provides tools and notebooks for performing video inference using Google's Gemma3 vision model. It can analyze videos from URLs, extract frames, and generate detailed descriptions of video content.

## Features

- 🎥 **Video URL Processing**: Download and analyze videos from YouTube, Vimeo, and other platforms
- 🖼️ **Frame Extraction**: Extract frames at specified intervals for analysis
- 🤖 **AI Analysis**: Use Gemma3 vision model to analyze video content
- 📊 **Comprehensive Results**: Generate detailed descriptions and analysis
- 💾 **Result Export**: Save analysis results in JSON format
- 🎯 **Customizable**: Adjust frame intervals, analysis prompts, and parameters

## Quick Start

### Prerequisites

- CUDA-compatible GPU (recommended 8GB+ VRAM)
- Python 3.8 or higher
- CUDA toolkit installed

### Installation

#### Windows Users (Recommended)
1. **Clone or download the project files**

2. **Run the Windows setup script**:
   ```cmd
   # Option 1: Using batch file
   setup_windows.bat
   
   # Option 2: Using PowerShell (recommended)
   powershell -ExecutionPolicy Bypass -File setup_windows.ps1
   ```

3. **Run the example script**:
   ```cmd
   python video_inference_example.py
   ```

4. **Or open the Jupyter notebook**:
   ```cmd
   jupyter notebook Gemma3_Video_Inference.ipynb
   ```

#### Linux/Mac Users
1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the example script**:
   ```bash
   python video_inference_example.py
   ```

4. **Or open the Jupyter notebook**:
   ```bash
   jupyter notebook Gemma3_Video_Inference.ipynb
   ```

## Usage

### Basic Video Analysis

```python
from video_inference_example import setup_model, download_video, extract_frames, analyze_frame

# Setup model
model, processor = setup_model()

# Download video
video_path = download_video("https://www.youtube.com/watch?v=example")

# Extract frames
frames = extract_frames(video_path, frame_interval=30, max_frames=5)

# Analyze each frame
prompt = "Describe what you see in this video frame in detail."
for frame in frames:
    result = analyze_frame(model, processor, frame, prompt)
    print(result)
```

### Using the Jupyter Notebook

1. Open `Gemma3_Video_Inference.ipynb` in Jupyter
2. Run all cells to install dependencies and load the model
3. Modify the video URL and analysis parameters in the interactive section
4. Execute the analysis cells to get results

## Configuration

### Model Parameters

- **Model**: `unsloth/gemma-3n-E4B` (4-bit quantized for memory efficiency)
- **Device**: CUDA GPU
- **Quantization**: 4-bit for reduced memory usage

### Video Processing Parameters

- **Frame Interval**: Extract every Nth frame (default: 30)
- **Max Frames**: Maximum number of frames to analyze (default: 5)
- **Video Quality**: Limited to 720p for efficiency
- **Frame Size**: Automatically resized to 1024x1024 if larger

### Analysis Parameters

- **Temperature**: 0.7 (controls randomness)
- **Top-p**: 0.95 (nucleus sampling)
- **Top-k**: 64 (top-k sampling)
- **Max Tokens**: 256 (maximum response length)

## Examples

### Scene Description
```python
prompt = "Describe the overall scene and setting in detail. What is the environment like?"
```

### Action Analysis
```python
prompt = "What actions or movements are happening in this frame? Describe any activities you observe."
```

### Object Detection
```python
prompt = "List and describe all the objects, people, and items you can see in this frame."
```

### Emotion Analysis
```python
prompt = "If there are people in this frame, describe their expressions, emotions, and body language."
```

## Supported Video Sources

- **YouTube**: Full support for public videos
- **Vimeo**: Most public videos supported
- **Local Files**: MP4, AVI, MOV, MKV, and other common formats
- **Direct URLs**: HTTP/HTTPS video links

## Memory Management

The project includes several memory optimization features:

- **4-bit Quantization**: Reduces model memory usage by ~75%
- **Frame Resizing**: Automatically resizes large frames
- **GPU Cache Clearing**: Clears CUDA cache after processing
- **Temporary File Cleanup**: Removes downloaded videos after analysis

## Troubleshooting

### Common Issues

1. **C Compiler Error (Windows)**
   - **Solution**: Use the provided Windows setup scripts
   - Run `setup_windows.bat` or `setup_windows.ps1`
   - The script automatically disables dynamic compilation
   - Alternative generation methods are built into the code
   - Set environment variables: `TORCHDYNAMO_DISABLE=1`

2. **CUDA Out of Memory**
   - Reduce `max_frames` parameter
   - Increase `frame_interval`
   - Use smaller video resolutions
   - Restart kernel and clear GPU cache

3. **Video Download Fails**
   - Check URL accessibility
   - Ensure internet connection
   - Try different video formats
   - Update yt-dlp: `pip install --upgrade yt-dlp`

4. **Slow Processing**
   - Reduce `max_tokens` parameter
   - Use simpler prompts
   - Process fewer frames
   - Check GPU utilization

5. **Model Loading Issues**
   - Ensure sufficient disk space for model download
   - Check CUDA compatibility
   - Verify unsloth installation

### Performance Tips

- Use SSD storage for faster video processing
- Close other GPU-intensive applications
- Monitor GPU memory usage with `nvidia-smi`
- Use smaller video files for testing

## Resources

### Documentation
- [Gemma3 Documentation](https://ai.google.dev/gemma/docs)
- [Unsloth Documentation](https://docs.unsloth.ai/)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers/)
- [OpenCV Documentation](https://docs.opencv.org/)
- [yt-dlp Documentation](https://github.com/yt-dlp/yt-dlp)

### Research Papers
- **Gemma3: Open Models for the Open World** - Google Research
- **Vision-Language Models**: Recent advances in multimodal AI
- **Video Understanding**: State-of-the-art approaches

### Related Projects
- [LLaVA](https://github.com/haotian-liu/LLaVA): Large Language and Vision Assistant
- [Video-LLaVA](https://github.com/PKUWilliamYang/VLaVA): Video understanding with LLaVA
- [Video-ChatGPT](https://github.com/microsoft/Video-ChatGPT): Conversational video understanding

## License

This project is for educational and research purposes. Please ensure compliance with:
- YouTube's Terms of Service
- Gemma3's usage terms
- Respect for copyright and privacy

## Contributing

Contributions are welcome! Please feel free to:
- Report bugs and issues
- Suggest new features
- Submit pull requests
- Improve documentation

## Acknowledgments

- Google Research for Gemma3
- Unsloth team for optimization tools
- Hugging Face for transformers library
- OpenCV community for video processing tools

---

**Note**: This project is designed for research and educational purposes. Please respect copyright laws and platform terms of service when downloading and analyzing videos. 