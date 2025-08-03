#!/usr/bin/env python3
"""
Video Inference using Ollama with Gemma3
This script uses Ollama to analyze videos with Gemma3 model.
"""

import cv2
import yt_dlp
import requests
import os
from PIL import Image
import numpy as np
from typing import List, Optional
import tempfile
from pathlib import Path
import time
import json
import base64
import io

class OllamaVideoAnalyzer:
    """Video analyzer using Ollama with Gemma3"""
    
    def __init__(self, ollama_url: str = "http://localhost:11434", model_name: str = "gemma3"):
        self.ollama_url = ollama_url
        self.model_name = model_name
        self.temp_dir = tempfile.mkdtemp()
        
    def get_available_models(self):
        """Get list of available models"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags")
            if response.status_code == 200:
                models = response.json().get('models', [])
                return [m['name'] for m in models]
            return []
        except Exception as e:
            print(f"Error getting models: {e}")
            return []
    
    def find_best_vision_model(self):
        """Find the best available vision model"""
        models = self.get_available_models()
        
        # Priority order for vision models
        vision_models = [
            'llava:13b', 'llava:7b', 'llava',  # LLaVA models are excellent for vision
            'llava-v1.6-13b', 'llava-v1.6-7b', 'llava-v1.5-13b', 'llava-v1.5-7b',
            'gemma3',  # Standard Gemma3 (may have limited vision)
        ]
        
        for model in vision_models:
            if model in models:
                print(f"✅ Found vision model: {model}")
                return model
        
        # If no vision models found, use the first available model
        if models:
            print(f"⚠️  No specific vision models found. Using: {models[0]}")
            return models[0]
        
        return None
    
    def image_to_base64(self, image: Image.Image) -> str:
        """Convert PIL image to base64 string"""
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG', quality=85)
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return img_str
    
    def analyze_image_with_ollama(self, image: Image.Image, prompt: str) -> str:
        """Analyze a single image using Ollama"""
        try:
            # Convert image to base64
            image_base64 = self.image_to_base64(image)
            
            # Prepare the request payload
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "images": [image_base64],
                "stream": False,
                "options": {
                    "temperature": 0.1,
                    "top_p": 0.9,
                    "top_k": 40,
                    "num_predict": 256
                }
            }
            
            # Make request to Ollama
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('response', '').strip()
            else:
                print(f"Error from Ollama API: {response.status_code}")
                error_text = response.text.lower()
                
                # Check for specific error types
                if "vision" in error_text or "image" in error_text:
                    return "Error: This model doesn't support vision/image analysis. Try installing a vision model like 'llava'."
                elif "model" in error_text and "not found" in error_text:
                    return f"Error: Model '{self.model_name}' not found. Available models: {self.get_available_models()}"
                else:
                    return f"Error: {response.text}"
                
        except Exception as e:
            print(f"Error analyzing image with Ollama: {e}")
            return f"Error: {str(e)}"
    
    def download_video_from_url(self, url: str, output_path: Optional[str] = None) -> str:
        """Download video from URL using yt-dlp"""
        if output_path is None:
            output_path = os.path.join(self.temp_dir, "video.mp4")
        
        ydl_opts = {
            'format': 'best[height<=720]',  # Limit to 720p for efficiency
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
    
    def extract_frames(self, video_path: str, frame_interval: int = 30, max_frames: int = 10) -> List[Image.Image]:
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
                # Convert BGR to RGB
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_image = Image.fromarray(frame_rgb)
                
                # Resize if too large
                if pil_image.size[0] > 1024 or pil_image.size[1] > 1024:
                    pil_image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
                
                frames.append(pil_image)
                extracted_count += 1
                print(f"Extracted frame {extracted_count}/{max_frames} at frame {frame_count}")
            
            frame_count += 1
        
        cap.release()
        return frames
    
    def analyze_video_frames(self, frames: List[Image.Image], prompt: str) -> List[str]:
        """Analyze multiple frames from a video"""
        results = []
        
        for i, frame in enumerate(frames):
            print(f"\n--- Analyzing Frame {i+1}/{len(frames)} ---")
            
            result = self.analyze_image_with_ollama(frame, prompt)
            results.append(result)
            
            print(f"Frame {i+1} Analysis:")
            print(result)
            print("-" * 50)
            
            # Small delay to prevent overwhelming the API
            time.sleep(1)
        
        return results
    
    def analyze_video_from_url(self, video_url: str, prompt: str = "Describe what you see in this video frame in detail.", 
                              frame_interval: int = 30, max_frames: int = 5):
        """Analyze a video from URL"""
        print(f"Processing video from URL: {video_url}")
        
        # Download video
        video_path = self.download_video_from_url(video_url)
        if video_path is None:
            return None
        
        # Extract frames
        frames = self.extract_frames(video_path, frame_interval, max_frames)
        if not frames:
            print("No frames extracted from video")
            return None
        
        # Analyze frames
        results = self.analyze_video_frames(frames, prompt)
        
        return {
            'video_url': video_url,
            'frames_analyzed': len(frames),
            'results': results
        }
    
    def analyze_local_video(self, video_path: str, prompt: str = "Describe what you see in this video frame in detail.", 
                           frame_interval: int = 30, max_frames: int = 5):
        """Analyze a local video file"""
        print(f"Processing local video: {video_path}")
        
        if not os.path.exists(video_path):
            print(f"Error: Video file not found: {video_path}")
            return None
        
        # Extract frames
        frames = self.extract_frames(video_path, frame_interval, max_frames)
        if not frames:
            print("No frames extracted from video")
            return None
        
        # Analyze frames
        results = self.analyze_video_frames(frames, prompt)
        
        return {
            'video_path': video_path,
            'frames_analyzed': len(frames),
            'results': results
        }
    
    def cleanup(self):
        """Clean up temporary files"""
        import shutil
        if os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)
            print(f"Cleaned up temporary directory: {self.temp_dir}")

def main():
    """Main function to demonstrate video analysis with Ollama"""
    
    print("🚀 Starting Video Analysis with Ollama + Gemma3")
    print("=" * 50)
    
    # Initialize analyzer
    analyzer = OllamaVideoAnalyzer()
    
    # Test Ollama connection
    try:
        response = requests.get(f"{analyzer.ollama_url}/api/tags")
        if response.status_code == 200:
            models = response.json().get('models', [])
            print(f"✅ Connected to Ollama. Available models: {[m['name'] for m in models]}")
        else:
            print("❌ Could not connect to Ollama. Make sure it's running.")
            return
    except Exception as e:
        print(f"❌ Error connecting to Ollama: {e}")
        print("Make sure Ollama is running with: ollama serve")
        return
    
    # Find the best vision model
    best_model = analyzer.find_best_vision_model()
    if best_model:
        analyzer.model_name = best_model
        print(f"🤖 Using model: {analyzer.model_name}")
    else:
        print("❌ No models found. Please install a model first:")
        print("  ollama pull gemma3")
        print("  ollama pull llava")
        return
    
    # Example video URL (replace with your own)
    video_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # Example URL
    
    # Analysis prompt
    prompt = "Describe what you see in this video frame. Focus on the main objects, people, actions, and overall scene. Be concise and clear."
    
    print(f"📹 Processing video: {video_url}")
    print(f"🔍 Analysis prompt: {prompt}")
    
    # Run analysis
    results = analyzer.analyze_video_from_url(video_url, prompt, frame_interval=60, max_frames=3)
    
    if results:
        print("\n" + "="*50)
        print("ANALYSIS RESULTS")
        print("="*50)
        
        for i, result in enumerate(results['results']):
            print(f"\nFrame {i+1} Analysis:")
            print("-" * 30)
            print(result)
            print("-" * 30)
        
        # Save results
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        output_file = f"video_analysis_{timestamp}.json"
        
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        print(f"\n💾 Results saved to: {output_file}")
    else:
        print("❌ Analysis failed. Please check the video URL and try again.")
    
    # Cleanup
    analyzer.cleanup()
    
    print("\n✅ Video analysis completed!")

if __name__ == "__main__":
    main() 