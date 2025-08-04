import os
import subprocess
import base64
import random
import requests
from glob import glob
from PIL import Image

# --- CONFIG ---
VIDEO_PATH = "temp/copy.mp4"
AUDIO_PATH = "temp/copy_audio.wav"
FRAMES_DIR = "temp/frames"
DOWNSAMPLED_DIR = "temp/downsampled"
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "gemma3"
NUM_FRAMES = 5
DOWNSAMPLE_FACTOR = 2

# --- HELPERS ---
def extract_audio():
    os.makedirs(os.path.dirname(AUDIO_PATH), exist_ok=True)
    subprocess.run([
        "ffmpeg", "-y", "-i", VIDEO_PATH,
        "-vn", "-acodec", "pcm_s16le", "-ar", "16000", AUDIO_PATH
    ], check=True)

def extract_frames(fps=1):
    os.makedirs(FRAMES_DIR, exist_ok=True)
    subprocess.run([
        "ffmpeg", "-y", "-i", VIDEO_PATH,
        "-vf", f"fps={fps}",
        f"{FRAMES_DIR}/frame_%04d.png"
    ], check=True)

def downsample_random_frames(n=5, factor=2):
    os.makedirs(DOWNSAMPLED_DIR, exist_ok=True)
    frames = sorted(glob(os.path.join(FRAMES_DIR, "*.png")))
    selected = random.sample(frames, min(n, len(frames)))
    out_paths = []
    for f in selected:
        img = Image.open(f)
        img_small = img.resize((img.width // factor, img.height // factor))
        out_path = os.path.join(DOWNSAMPLED_DIR, os.path.basename(f))
        img_small.save(out_path)
        out_paths.append(out_path)
    return out_paths

def encode_image_base64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

def ollama_generate(prompt, images_b64=None):
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False
    }
    if images_b64:
        payload["images"] = images_b64
    response = requests.post("http://localhost:11434/api/generate", json=payload)
    response.raise_for_status()
    return response.json().get("response", "").strip()

# --- MAIN ---
def main():
    print("Step 1: Extracting audio...")
    extract_audio()

    print("Step 2: Transcribing and summarizing audio with Gemma 3...")
    transcript_prompt = (
        "Please summarize what is being said in the audio. "
        f"Assume you have access to the audio file from the video."
    )
    transcript_summary = ollama_generate(transcript_prompt)
    print("\nAudio Summary:\n", transcript_summary)

    print("\nStep 3: Extracting frames...")
    extract_frames()

    print("Step 4: Downsampling 5 random frames...")
    frames = downsample_random_frames(NUM_FRAMES, DOWNSAMPLE_FACTOR)
    images_b64 = [encode_image_base64(p) for p in frames]

    print("Step 5: Getting visual insight from frames using Gemma 3...")
    visual_prompt = "Analyze these video frames and describe what is happening in them collectively."
    visual_summary = ollama_generate(visual_prompt, images_b64)
    print("\nVisual Summary:\n", visual_summary)

    print("\nStep 6: Combining audio and visual insight...")
    combined_prompt = (
        f"Based on this audio summary:\n{transcript_summary}\n\n"
        f"And this visual summary:\n{visual_summary}\n\n"
        "Give a unified explanation of what is happening in the video."
    )
    final_summary = ollama_generate(combined_prompt)
    print("\n🎯 Final Video Insight:\n", final_summary)

if __name__ == "__main__":
    main()
