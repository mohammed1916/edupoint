#!/usr/bin/env python3
"""
Simple example script for video inference with Gemma3
This script demonstrates how to analyze videos using the Gemma3 vision model.
"""

import os
import sys

# Fix for Windows C compiler issues
if os.name == 'nt':  # Windows
    # Disable dynamic compilation to avoid C compiler issues
    os.environ['TORCHDYNAMO_DISABLE'] = '1'
    os.environ['TORCH_COMPILE_DISABLE'] = '1'
    
    # Set environment variables to avoid compiler issues
    os.environ['CC'] = 'cl.exe' if os.path.exists('C:/Program Files (x86)/Microsoft Visual Studio/2019/Community/VC/Tools/MSVC/14.29.30133/bin/Hostx64/x64/cl.exe') else ''
    os.environ['CXX'] = 'cl.exe' if os.path.exists('C:/Program Files (x86)/Microsoft Visual Studio/2019/Community/VC/Tools/MSVC/14.29.30133/bin/Hostx64/x64/cl.exe') else ''

import torch
from unsloth import FastVisionModel, get_chat_template
import cv2
import yt_dlp
import requests
from PIL import Image
import numpy as np
from typing import List, Optional
import tempfile
from pathlib import Path
from transformers import TextStreamer
import time

def setup_model():
    """Setup and load the vision model"""
    print("Loading vision model...")
    
    # Try different models in order of preference
    model_options = [
        "unsloth/llava-v1.6-mistral-7b-hf-bnb-4bit",  # Better vision model
        "unsloth/llava-1.5-7b-hf-bnb-4bit",           # Alternative LLaVA model
        "unsloth/gemma-3n-E4B",                       # Original Gemma3 model
    ]
    
    for model_name in model_options:
        try:
            print(f"Trying model: {model_name}")
            
            if "llava" in model_name.lower():
                # Use LLaVA models which are better for vision tasks
                model, processor = FastVisionModel.from_pretrained(
                    model_name,
                    load_in_4bit=True,
                    device_map="cuda"
                )
                
                # Set up chat template for LLaVA
                processor = get_chat_template(processor, "llava")
                
            else:
                # Use Gemma3 model
                model, processor = FastVisionModel.from_pretrained(
                    model_name,
                    load_in_4bit=True,
                    use_gradient_checkpointing="unsloth",
                    device_map="cuda"
                )
                
                # Set up chat template for Gemma3
                processor = get_chat_template(processor, "gemma-3n")
            
            # Set to inference mode
            FastVisionModel.for_inference(model)
            
            print(f"Model loaded successfully: {model_name}")
            return model, processor
            
        except Exception as e:
            print(f"Error loading {model_name}: {e}")
            continue
    
    # If all models fail, try a basic approach
    print("All models failed, trying basic approach...")
    try:
        model, processor = FastVisionModel.from_pretrained(
            "unsloth/gemma-3n-E4B",
            load_in_4bit=True,
            device_map="cuda",
            torch_dtype=torch.float16
        )
        
        processor = get_chat_template(processor, "gemma-3n")
        FastVisionModel.for_inference(model)
        
        print("Model loaded successfully with basic method!")
        return model, processor
        
    except Exception as e:
        print(f"All loading methods failed: {e}")
        raise

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
    """Analyze a single frame with vision model"""
    try:
        # Ensure image is in RGB format
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize image to a reasonable size for the model
        if image.size[0] > 1024 or image.size[1] > 1024:
            image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        
        # Prepare messages - use a simpler format
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
        
        # Generate response with better parameters
        with torch.no_grad():
            try:
                result = model.generate(
                    **inputs,
                    max_new_tokens=128,  # Reduced for better quality
                    use_cache=True,
                    temperature=0.1,     # Lower temperature for more focused output
                    top_p=0.9,           # Slightly lower for better quality
                    top_k=40,            # Lower for more focused output
                    do_sample=True,
                    repetition_penalty=1.2,  # Prevent repetition
                    pad_token_id=processor.tokenizer.eos_token_id,
                    eos_token_id=processor.tokenizer.eos_token_id
                )
            except RuntimeError as e:
                if "C compiler" in str(e):
                    print("C compiler error detected, trying alternative generation method...")
                    # Alternative generation method
                    result = model.generate(
                        **inputs,
                        max_new_tokens=128,
                        use_cache=False,
                        temperature=0.1,
                        top_p=0.9,
                        top_k=40,
                        do_sample=True,
                        repetition_penalty=1.2,
                        pad_token_id=processor.tokenizer.eos_token_id,
                        eos_token_id=processor.tokenizer.eos_token_id
                    )
                else:
                    raise e
        
        # Decode result
        generated_text = processor.tokenizer.decode(result[0], skip_special_tokens=True)
        input_length = inputs["input_ids"].shape[1]
        generated_part = generated_text[input_length:].strip()
        
        # Clean up the output
        generated_part = generated_part.replace('<|im_end|>', '').replace('<|endoftext|>', '').strip()
        
        # If output is still problematic, try a different approach
        if len(generated_part) < 10 or generated_part.startswith('<') or generated_part.count('>') > 5:
            print("Detected problematic output, trying alternative prompt...")
            # Try with a simpler prompt
            simple_messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "image", "image": image},
                        {"type": "text", "text": "What do you see in this image? Describe it briefly."}
                    ]
                }
            ]
            
            simple_input_text = processor.apply_chat_template(simple_messages, add_generation_prompt=True)
            simple_inputs = processor(
                image,
                simple_input_text,
                add_special_tokens=False,
                return_tensors="pt"
            ).to("cuda")
            
            with torch.no_grad():
                simple_result = model.generate(
                    **simple_inputs,
                    max_new_tokens=64,
                    temperature=0.1,
                    top_p=0.9,
                    top_k=40,
                    do_sample=True,
                    repetition_penalty=1.2,
                    pad_token_id=processor.tokenizer.eos_token_id,
                    eos_token_id=processor.tokenizer.eos_token_id
                )
            
            simple_generated_text = processor.tokenizer.decode(simple_result[0], skip_special_tokens=True)
            simple_input_length = simple_inputs["input_ids"].shape[1]
            generated_part = simple_generated_text[simple_input_length:].strip()
            generated_part = generated_part.replace('<|im_end|>', '').replace('<|endoftext|>', '').strip()
        
        return generated_part if generated_part else "Unable to analyze this frame."
        
    except Exception as e:
        print(f"Error analyzing frame: {e}")
        return f"Error: {str(e)}"

def main():
    """Main function to demonstrate video analysis"""
    
    # Check CUDA availability
    if not torch.cuda.is_available():
        print("CUDA not available. Please ensure you have a CUDA-compatible GPU.")
        return
    
    print("🚀 Starting Video Analysis with Vision Model")
    print("=" * 50)
    
    # Setup model
    model, processor = setup_model()
    
    # Example video URL (replace with your own)
    video_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # Example URL
    
    # Analysis prompt - make it more specific and clear
    prompt = "Describe what you see in this video frame. Focus on the main objects, people, actions, and overall scene. Be concise and clear."
    
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