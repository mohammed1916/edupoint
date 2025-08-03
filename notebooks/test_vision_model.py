#!/usr/bin/env python3
"""
Test script to verify vision model functionality
"""

import os
import torch
from unsloth import FastVisionModel, get_chat_template
from PIL import Image
import numpy as np

# Fix for Windows C compiler issues
if os.name == 'nt':  # Windows
    os.environ['TORCHDYNAMO_DISABLE'] = '1'
    os.environ['TORCH_COMPILE_DISABLE'] = '1'

def create_test_image():
    """Create a simple test image"""
    # Create a simple colored rectangle
    img_array = np.zeros((512, 512, 3), dtype=np.uint8)
    img_array[100:400, 100:400] = [255, 0, 0]  # Red rectangle
    img_array[200:300, 200:300] = [0, 255, 0]  # Green square inside
    
    return Image.fromarray(img_array)

def test_model():
    """Test the vision model with a simple image"""
    print("🧪 Testing Vision Model")
    print("=" * 30)
    
    # Check CUDA
    if not torch.cuda.is_available():
        print("❌ CUDA not available")
        return
    
    print("✅ CUDA available")
    
    # Create test image
    test_image = create_test_image()
    print("✅ Test image created")
    
    # Try different models
    model_options = [
        "unsloth/llava-v1.6-mistral-7b-hf-bnb-4bit",
        "unsloth/llava-1.5-7b-hf-bnb-4bit", 
        "unsloth/gemma-3n-E4B"
    ]
    
    for model_name in model_options:
        try:
            print(f"\n🔍 Testing model: {model_name}")
            
            # Load model
            if "llava" in model_name.lower():
                model, processor = FastVisionModel.from_pretrained(
                    model_name,
                    load_in_4bit=True,
                    device_map="cuda"
                )
                processor = get_chat_template(processor, "llava")
            else:
                model, processor = FastVisionModel.from_pretrained(
                    model_name,
                    load_in_4bit=True,
                    device_map="cuda"
                )
                processor = get_chat_template(processor, "gemma-3n")
            
            FastVisionModel.for_inference(model)
            print("✅ Model loaded")
            
            # Test with simple prompt
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "image", "image": test_image},
                        {"type": "text", "text": "What colors do you see in this image?"}
                    ]
                }
            ]
            
            input_text = processor.apply_chat_template(messages, add_generation_prompt=True)
            inputs = processor(
                test_image,
                input_text,
                add_special_tokens=False,
                return_tensors="pt"
            ).to("cuda")
            
            # Generate response
            with torch.no_grad():
                result = model.generate(
                    **inputs,
                    max_new_tokens=64,
                    temperature=0.1,
                    top_p=0.9,
                    top_k=40,
                    do_sample=True,
                    repetition_penalty=1.2,
                    pad_token_id=processor.tokenizer.eos_token_id,
                    eos_token_id=processor.tokenizer.eos_token_id
                )
            
            # Decode result
            generated_text = processor.tokenizer.decode(result[0], skip_special_tokens=True)
            input_length = inputs["input_ids"].shape[1]
            generated_part = generated_text[input_length:].strip()
            
            # Clean up
            generated_part = generated_part.replace('<|im_end|>', '').replace('<|endoftext|>', '').strip()
            
            print(f"✅ Model response: {generated_part}")
            
            # Check if response is reasonable
            if len(generated_part) > 10 and not generated_part.startswith('<') and generated_part.count('>') < 3:
                print(f"🎉 SUCCESS! Model {model_name} is working correctly!")
                return model, processor
            else:
                print(f"⚠️  Model {model_name} produced problematic output")
                
        except Exception as e:
            print(f"❌ Error with {model_name}: {e}")
            continue
    
    print("❌ All models failed")
    return None, None

if __name__ == "__main__":
    model, processor = test_model()
    if model:
        print("\n✅ Vision model test completed successfully!")
    else:
        print("\n❌ Vision model test failed") 