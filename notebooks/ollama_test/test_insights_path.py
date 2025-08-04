#!/usr/bin/env python3
"""
Extract insights from a video using Ollama's Gemma 3 model
"""

import subprocess
import os
import base64
import requests
from PIL import Image
from glob import glob

# -------- CONFIG --------
VIDEO_PATH = "copy.mp4"
FRAMES_DIR = "frames"
FRAME_RATE = 1  # Extract 1 frame per second
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "gemma3"
INSIGHT_PROMPT = "Give a brief summary of what is happening in this frame."

# -------- STEP 1: Extract Frames --------
def extract_frames(video_path, output_dir, frame_rate=1):
    os.makedirs(output_dir, exist_ok=True)
    cmd = [
        "ffmpeg", "-i", video_path,
        "-vf", f"fps={frame_rate}",
        f"{output_dir}/frame_%04d.png"
    ]
    subprocess.run(cmd, check=True)

# -------- STEP 2: Encode Image to Base64 --------
def encode_image_base64(image_path):
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

# -------- STEP 3: Send to Ollama --------
def get_insight_from_frame(image_b64):
    response = requests.post(OLLAMA_URL, json={
        "model": MODEL_NAME,
        "prompt": INSIGHT_PROMPT,
        "images": [image_b64],
        "stream": False
    })
    return response.json().get("response", "").strip()

# -------- MAIN --------
def main():
    print("Extracting frames...")
    extract_frames(VIDEO_PATH, FRAMES_DIR, frame_rate=FRAME_RATE)

    frame_files = sorted(glob(os.path.join(FRAMES_DIR, "frame_*.png")))
    print(f"Extracted {len(frame_files)} frames.")

    for i, frame_path in enumerate(frame_files):
        print(f"\nAnalyzing Frame {i+1} → {frame_path}")
        image_b64 = encode_image_base64(frame_path)
        insight = get_insight_from_frame(image_b64)
        print(f"Insight: {insight}")

if __name__ == "__main__":
    main()
