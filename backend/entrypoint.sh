#!/bin/sh
set -e

# Pull the model at runtime (if not cached yet)
echo "Pulling model gemma2:2b..."
ollama pull gemma2:2b || true

# Start Ollama in background
echo "Starting Ollama..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to be ready
echo "Waiting for Ollama to be ready..."
until curl -s http://localhost:11434/api/tags > /dev/null; do
    sleep 1
done
echo "Ollama is ready."

# Start Uvicorn (Cloud Run will pass $PORT)
echo "Starting API..."
exec uvicorn gemma_api:app --host 0.0.0.0 --port ${PORT:-8000}
