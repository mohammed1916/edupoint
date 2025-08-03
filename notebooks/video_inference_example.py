#!/usr/bin/env python3
"""
Simple example script for video inference with Gemma3
This script demonstrates how to analyze videos using the Gemma3 vision model.
"""

import torch
from unsloth import FastVisionModel, get_chat_template
import cv2
import yt_dlp
import requests
import os
from PIL import Image
import numpy as np
from typing import List, Optional
import tempfile
from pathlib import Path
from transformers import TextStreamer
import time

def setup_model():
    """Setup and load the Gemma3 vision model"""
    print("Loading Gemma3 vision model...")
    
    model, processor = FastVisionModel.from_pretrained(
        "unsloth/gemma-3n-E4B",
        load_in_4bit=True,
        use_gradient_checkpointing="unsloth",
        device_map="cuda"
    )
    
    # Set up chat template
    processor = get_chat_template(processor, "gemma-3n")
    
    # Set to inference mode
    FastVisionModel.for_inference(model)
    
    print("Model loaded successfully!")
    return model, processor

def download_video(url: str, output_path: str = None) -> str:
    """Download video from URL"""
    if output_path is None:
        output_path = "temp_video.mp4"
    
    ydl_opts = {
        'format': 'best[height<=720]',
        'outtmpl': output_path,
        'quiet': True
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        print(f"Video downloaded to: {output_path}")
        return output_path
    except Exception as e:
        print(f"Error downloading video: {e}")
        return None

def extract_frames(video_path: str, frame_interval: int = 30, max_frames: int = 5) -> List[Image.Image]:
    """Extract frames from video"""
    frames = []
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print(f"Error: Could not open video file {video_path}")
        return frames
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps if fps > 0 else 0
    
    print(f"Video info: {total_frames} frames, {fps:.2f} fps, {duration:.2f} seconds")
    
    frame_count = 0
    extracted_count = 0
    
    while extracted_count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
        
        if frame_count % frame_interval == 0:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(frame_rgb)
            frames.append(pil_image)
            extracted_count += 1
            print(f"Extracted frame {extracted_count}/{max_frames} at frame {frame_count}")
        
        frame_count += 1
    
    cap.release()
    return frames

def analyze_frame(model, processor, image: Image.Image, prompt: str) -> str:
    """Analyze a single frame with Gemma3"""
    try:
        # Prepare messages
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": image},
                    {"type": "text", "text": prompt}
                ]
            }
        ]
        
        # Apply chat template
        input_text = processor.apply_chat_template(messages, add_generation_prompt=True)
        
        # Process inputs
        inputs = processor(
            image,
            input_text,
            add_special_tokens=False,
            return_tensors="pt"
        ).to("cuda")
        
        # Generate response
        with torch.no_grad():
            result = model.generate(
                **inputs,
                max_new_tokens=256,
                use_cache=True,
                temperature=0.7,
                top_p=0.95,
                top_k=64,
                do_sample=True
            )
        
        # Decode result
        generated_text = processor.tokenizer.decode(result[0], skip_special_tokens=True)
        input_length = inputs["input_ids"].shape[1]
        generated_part = generated_text[input_length:].strip()
        
        return generated_part
        
    except Exception as e:
        print(f"Error analyzing frame: {e}")
        return f"Error: {str(e)}"

def main():
    """Main function to demonstrate video analysis"""
    
    # Check CUDA availability
    if not torch.cuda.is_available():
        print("CUDA not available. Please ensure you have a CUDA-compatible GPU.")
        return
    
    print("🚀 Starting Video Analysis with Gemma3")
    print("=" * 50)
    
    # Setup model
    model, processor = setup_model()
    
    # Example video URL (replace with your own)
    video_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # Example URL
    
    # Analysis prompt
    prompt = "Describe what you see in this video frame in detail. Include objects, people, actions, and the overall scene."
    
    print(f"📹 Processing video: {video_url}")
    print(f"🔍 Analysis prompt: {prompt}")
    
    # Download video
    video_path = download_video(video_url)
    if not video_path:
        print("Failed to download video. Exiting.")
        return
    
    # Extract frames
    frames = extract_frames(video_path, frame_interval=60, max_frames=3)
    if not frames:
        print("No frames extracted. Exiting.")
        return
    
    # Analyze frames
    print("\n🤖 Analyzing frames...")
    results = []
    
    for i, frame in enumerate(frames):
        print(f"\n--- Analyzing Frame {i+1}/{len(frames)} ---")
        
        # Resize frame if too large
        if frame.size[0] > 1024 or frame.size[1] > 1024:
            frame.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        
        result = analyze_frame(model, processor, frame, prompt)
        results.append(result)
        
        print(f"Frame {i+1} Analysis:")
        print(result)
        print("-" * 50)
        
        # Small delay
        time.sleep(1)
    
    # Cleanup
    if os.path.exists(video_path):
        os.remove(video_path)
        print(f"Cleaned up temporary video file: {video_path}")
    
    # Clear GPU cache
    torch.cuda.empty_cache()
    
    print("\n✅ Video analysis completed!")
    print(f"📊 Analyzed {len(frames)} frames")
    
    # Print summary
    print("\n📋 Summary of Results:")
    for i, result in enumerate(results):
        print(f"Frame {i+1}: {result[:100]}...")

if __name__ == "__main__":
    main() 