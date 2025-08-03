# Video Inference with Ollama + Gemma3

This project provides a simple and reliable way to analyze videos using Ollama with Gemma3. This approach is much simpler than the complex setup with Unsloth and should work more reliably.

## Features

- 🎥 **Video URL Processing**: Download and analyze videos from YouTube, Vimeo, and other platforms
- 🖼️ **Frame Extraction**: Extract frames at specified intervals for analysis
- 🤖 **AI Analysis**: Use Ollama with Gemma3 to analyze video content
- 📊 **Simple Setup**: No complex CUDA setup or model loading issues
- 💾 **Result Export**: Save analysis results in JSON format
- 🎯 **Customizable**: Adjust frame intervals, analysis prompts, and parameters

## Prerequisites

- **Ollama installed and running**: [Install Ollama](https://ollama.ai/)
- **Gemma3 model**: `ollama pull gemma3` (or `ollama pull gemma3:vision` for vision capabilities)
- **Python 3.8+**: Basic Python installation

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements_ollama.txt
```

### 2. Start Ollama
```bash
ollama serve
```

### 3. Pull Models
```bash
# For basic text + limited vision capabilities
ollama pull gemma3

# For better vision capabilities (recommended)
ollama pull llava

# Or try other vision models
ollama pull llava:7b
ollama pull llava:13b
```

### 4. Test the Setup
```bash
python test_ollama_vision.py
```

### 5. Run Video Analysis
```bash
python video_inference_ollama.py
```

## Usage

### Basic Video Analysis
```python
from video_inference_ollama import OllamaVideoAnalyzer

# Initialize analyzer
analyzer = OllamaVideoAnalyzer()

# Analyze video from URL
results = analyzer.analyze_video_from_url(
    "https://www.youtube.com/watch?v=example",
    prompt="Describe what you see in this video frame.",
    frame_interval=30,
    max_frames=5
)

# Analyze local video file
results = analyzer.analyze_local_video(
    "path/to/video.mp4",
    prompt="What's happening in this scene?",
    frame_interval=60,
    max_frames=3
)
```

### Custom Analysis Prompts

```python
# Scene description
prompt = "Describe the overall scene and setting in detail."

# Action analysis
prompt = "What actions or movements are happening in this frame?"

# Object detection
prompt = "List and describe all the objects you can see in this frame."

# Emotion analysis
prompt = "If there are people in this frame, describe their expressions and emotions."
```

## Configuration

### Ollama Settings
- **URL**: `http://localhost:11434` (default)
- **Model**: `gemma3` (default)
- **Timeout**: 60 seconds per request

### Video Processing
- **Frame Interval**: Extract every Nth frame (default: 30)
- **Max Frames**: Maximum frames to analyze (default: 5)
- **Video Quality**: Limited to 720p for efficiency
- **Frame Size**: Automatically resized to 1024x1024 if larger

### Analysis Parameters
- **Temperature**: 0.1 (low for focused output)
- **Top-p**: 0.9 (nucleus sampling)
- **Top-k**: 40 (top-k sampling)
- **Max Tokens**: 256 (maximum response length)

## Advantages of Ollama Approach

### ✅ **Pros**
- **Simple Setup**: No complex CUDA or model loading issues
- **Reliable**: Uses Ollama's stable API
- **Fast**: No model loading time
- **Cross-platform**: Works on Windows, Mac, Linux
- **No GPU Required**: Can run on CPU (slower but functional)
- **Easy Updates**: `ollama pull gemma3` to update

### ⚠️ **Cons**
- **Requires Ollama**: Need to install and run Ollama service
- **Internet Required**: For downloading videos
- **API Dependency**: Relies on Ollama API being available

## Troubleshooting

### Common Issues

1. **Ollama Not Running**
   ```bash
   # Start Ollama
   ollama serve
   
   # Check if it's running
   curl http://localhost:11434/api/tags
   ```

2. **Model Not Found**
   ```bash
   # Pull the model
   ollama pull gemma3
   
   # Check available models
   ollama list
   ```

3. **Vision Not Working**
   ```bash
   # Try vision-specific model
   ollama pull llava
   
   # Or check if your model supports vision
   python test_ollama_vision.py
   ```

4. **Video Download Fails**
   - Check URL accessibility
   - Ensure internet connection
   - Update yt-dlp: `pip install --upgrade yt-dlp`

### Performance Tips

- **Use GPU**: Ollama can use GPU if available for faster processing
- **Reduce Frames**: Lower `max_frames` for faster analysis
- **Increase Interval**: Higher `frame_interval` for fewer frames
- **Local Videos**: Use local files instead of URLs for faster processing

## Examples

### Example Output
```
🚀 Starting Video Analysis with Ollama + Gemma3
==================================================
✅ Connected to Ollama. Available models: ['gemma3']
📹 Processing video: https://www.youtube.com/watch?v=example
🔍 Analysis prompt: Describe what you see in this video frame.
🤖 Using model: gemma3

--- Analyzing Frame 1/3 ---
Frame 1 Analysis:
I can see a person walking in a park. There are trees in the background 
and the person appears to be wearing casual clothing. The scene is well-lit 
with natural sunlight.
--------------------------------------------------

--- Analyzing Frame 2/3 ---
Frame 2 Analysis:
The person is now sitting on a bench. There's a dog nearby and some 
buildings visible in the distance. The overall mood appears relaxed and peaceful.
--------------------------------------------------

--- Analyzing Frame 3/3 ---
Frame 3 Analysis:
The scene shows the person and dog walking together. The park setting 
includes a walking path and various green spaces. The lighting suggests 
it's late afternoon.
--------------------------------------------------

💾 Results saved to: video_analysis_20241201_143022.json
✅ Video analysis completed!
```

## Comparison with Previous Approach

| Feature | Ollama Approach | Unsloth Approach |
|---------|----------------|------------------|
| Setup Complexity | ⭐ Simple | ⭐⭐⭐ Complex |
| Reliability | ⭐⭐⭐ High | ⭐⭐ Medium |
| Performance | ⭐⭐ Good | ⭐⭐⭐ Excellent |
| GPU Required | ❌ No | ✅ Yes |
| Model Loading | ⭐ Instant | ⭐⭐⭐ Slow |
| Cross-platform | ✅ Yes | ⭐⭐ Limited |

## Next Steps

1. **Test the setup**: Run `python test_ollama_vision.py`
2. **Try video analysis**: Run `python video_inference_ollama.py`
3. **Customize prompts**: Modify the analysis prompts for your needs
4. **Batch processing**: Process multiple videos in sequence
5. **Fine-tuning**: If needed, you can still fine-tune models using the original notebook

---

**Note**: This approach is much more reliable and easier to set up than the complex Unsloth-based approach. It's perfect for getting started with video analysis quickly! 