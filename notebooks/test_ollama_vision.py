#!/usr/bin/env python3
"""
Test script to verify Ollama vision functionality with Gemma3
"""

import requests
import base64
import io
from PIL import Image
import numpy as np

def create_test_image():
    """Create a simple test image"""
    # Create a simple colored rectangle
    img_array = np.zeros((512, 512, 3), dtype=np.uint8)
    img_array[100:400, 100:400] = [255, 0, 0]  # Red rectangle
    img_array[200:300, 200:300] = [0, 255, 0]  # Green square inside
    
    return Image.fromarray(img_array)

def image_to_base64(image: Image.Image) -> str:
    """Convert PIL image to base64 string"""
    buffer = io.BytesIO()
    image.save(buffer, format='JPEG', quality=85)
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return img_str

def test_ollama_vision():
    """Test Ollama vision capabilities"""
    print("🧪 Testing Ollama Vision with Gemma3")
    print("=" * 40)
    
    # Test Ollama connection
    try:
        response = requests.get("http://localhost:11434/api/tags")
        if response.status_code == 200:
            models = response.json().get('models', [])
            print(f"✅ Connected to Ollama")
            print(f"📋 Available models: {[m['name'] for m in models]}")
            
            # Check if gemma3 is available
            model_names = [m['name'] for m in models]
            if 'gemma3' in model_names:
                print("✅ Gemma3 model found!")
            else:
                print("⚠️  Gemma3 model not found. Available models:")
                for model in models:
                    print(f"   - {model['name']}")
                print("\nTo install Gemma3, run: ollama pull gemma3")
                return False
        else:
            print("❌ Could not connect to Ollama")
            return False
    except Exception as e:
        print(f"❌ Error connecting to Ollama: {e}")
        print("Make sure Ollama is running with: ollama serve")
        return False
    
    # Create test image
    test_image = create_test_image()
    print("✅ Test image created")
    
    # Test vision capabilities
    try:
        # Convert image to base64
        image_base64 = image_to_base64(test_image)
        
        # Prepare the request payload
        payload = {
            "model": "gemma3",
            "prompt": "What colors do you see in this image? Describe what you observe.",
            "images": [image_base64],
            "stream": False,
            "options": {
                "temperature": 0.1,
                "top_p": 0.9,
                "top_k": 40,
                "num_predict": 128
            }
        }
        
        print("🔍 Testing vision analysis...")
        
        # Make request to Ollama
        response = requests.post(
            "http://localhost:11434/api/generate",
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            response_text = result.get('response', '').strip()
            
            print(f"✅ Ollama response: {response_text}")
            
            # Check if response is reasonable
            if len(response_text) > 10:
                print("🎉 SUCCESS! Ollama vision is working correctly!")
                return True
            else:
                print("⚠️  Response seems incomplete or incorrect")
                return False
        else:
            print(f"❌ Error from Ollama API: {response.status_code}")
            print(f"Response: {response.text}")
            
            # Check if it's a vision capability issue
            if "vision" in response.text.lower() or "image" in response.text.lower():
                print("⚠️  This model may not support vision capabilities")
                print("Try using a different model or check if Gemma3 supports vision")
            return False
            
    except Exception as e:
        print(f"❌ Error testing vision: {e}")
        return False

def test_text_only():
    """Test basic text generation without images"""
    print("\n🧪 Testing Text-Only Generation")
    print("=" * 40)
    
    try:
        payload = {
            "model": "gemma3",
            "prompt": "Hello! Can you tell me a short joke?",
            "stream": False,
            "options": {
                "temperature": 0.7,
                "num_predict": 64
            }
        }
        
        response = requests.post(
            "http://localhost:11434/api/generate",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            response_text = result.get('response', '').strip()
            print(f"✅ Text response: {response_text}")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_available_models():
    """Check what models are available and their capabilities"""
    print("\n🔍 Checking Available Models")
    print("=" * 40)
    
    try:
        response = requests.get("http://localhost:11434/api/tags")
        if response.status_code == 200:
            models = response.json().get('models', [])
            
            print("Available models:")
            for model in models:
                print(f"  - {model['name']}")
                
            # Check for vision-capable models
            vision_models = []
            for model in models:
                model_name = model['name'].lower()
                if any(vision_model in model_name for vision_model in ['llava', 'vision', 'clip', 'multimodal']):
                    vision_models.append(model['name'])
            
            if vision_models:
                print(f"\n🎯 Vision-capable models found: {vision_models}")
                print("These models are better suited for image analysis!")
            else:
                print("\n⚠️  No specific vision models found")
                print("Standard Gemma3 may have limited vision capabilities")
                
            return models
        else:
            print("❌ Could not fetch model list")
            return []
    except Exception as e:
        print(f"❌ Error checking models: {e}")
        return []

if __name__ == "__main__":
    print("🚀 Ollama Vision Test Suite")
    print("=" * 50)
    
    # Check available models first
    models = check_available_models()
    
    # Test text generation first
    text_success = test_text_only()
    
    # Test vision capabilities
    vision_success = test_ollama_vision()
    
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)
    print(f"Text Generation: {'✅ PASS' if text_success else '❌ FAIL'}")
    print(f"Vision Analysis: {'✅ PASS' if vision_success else '❌ FAIL'}")
    
    if text_success and vision_success:
        print("\n🎉 All tests passed! Ollama + Gemma3 is ready for video analysis.")
        print("You can now run: python video_inference_ollama.py")
    else:
        print("\n⚠️  Some tests failed. Please check your Ollama setup.")
        if not text_success:
            print("- Make sure Ollama is running: ollama serve")
            print("- Make sure Gemma3 is installed: ollama pull gemma3")
        if not vision_success:
            print("- Standard Gemma3 may have limited vision capabilities")
            print("- Try installing a vision-specific model:")
            print("  ollama pull llava")
            print("  ollama pull llava:7b")
            print("  ollama pull llava:13b")
            print("- Or try with the current model - it might work for basic analysis") 