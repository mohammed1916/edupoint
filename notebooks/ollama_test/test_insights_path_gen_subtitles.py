import os
import subprocess
import requests
from google.cloud import speech_v1 as speech
from google.cloud import storage, texttospeech
from pydub import AudioSegment

# CONFIGURATION
VIDEO_PATH = "temp/copy.mp4"
AUDIO_PATH = "temp/copy_audio.wav"
BUCKET_NAME = "staging.ngo-vidyasagar.appspot.com"  
BLOB_NAME = "copy_audio.wav"
OLLAMA_ENDPOINT = "http://localhost:11434/api/generate"  # Gemma via Ollama

# STEP 1: Extract Audio from Video
def extract_audio(video_path, audio_path):
    subprocess.run([
        "ffmpeg", "-i", video_path, "-ar", "16000", "-ac", "1", "-f", "wav", audio_path
    ], check=True)

# STEP 2: Upload to GCS
def upload_to_gcs(bucket_name, source_file_name, destination_blob_name):
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(source_file_name)
    return f"gs://{bucket_name}/{destination_blob_name}"

# STEP 3: Transcribe using Google Speech-to-Text
def transcribe_from_gcs(gcs_uri):
    client = speech.SpeechClient()
    audio = speech.RecognitionAudio(uri=gcs_uri)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code="en-US",
        enable_automatic_punctuation=True,
    )
    operation = client.long_running_recognize(config=config, audio=audio)
    print("Waiting for transcription...")
    response = operation.result(timeout=600)

    transcript = ""
    for result in response.results:
        transcript += result.alternatives[0].transcript + " "
    return transcript.strip()

# STEP 4: Query Gemma 3 (Ollama)
def query_gemma3(prompt):
    payload = {
        "model": "gemma3",
        "prompt": prompt,
        "stream": False
    }
    response = requests.post(OLLAMA_ENDPOINT, json=payload)
    return response.json()["response"]

# STEP 5: Convert Gemma Response to Speech (Optional)
def synthesize_speech(text, output_audio="response.mp3"):
    client = texttospeech.TextToSpeechClient()
    input_text = texttospeech.SynthesisInput(text=text)

    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US", name="en-US-Neural2-C"
    )
    audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)

    response = client.synthesize_speech(input=input_text, voice=voice, audio_config=audio_config)

    with open(output_audio, "wb") as out:
        out.write(response.audio_content)
    print(f"Gemma reply spoken: {output_audio}")

# MAIN FLOW
def main():
    extract_audio(VIDEO_PATH, AUDIO_PATH)
    gcs_uri = upload_to_gcs(BUCKET_NAME, AUDIO_PATH, BLOB_NAME)
    transcript = transcribe_from_gcs(gcs_uri)
    print("📝 Transcript:", transcript)

    gemma_reply = query_gemma3(transcript)
    print("🤖 Gemma:", gemma_reply)

    synthesize_speech(gemma_reply)

if __name__ == "__main__":
    main()
