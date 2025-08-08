# Use official Python slim image
FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Install curl and Ollama dependencies
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Install Ollama (official script)
RUN curl -fsSL https://ollama.com/install.sh | sh

# Copy requirements and install Python dependencies
COPY requirements.txt .

# Upgrade pip and install dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy the rest of the application
COPY . .

# Download the Gemma model (optional, or do this at runtime)
RUN ollama pull gemma:2b

# Command to run the app
CMD ["ollama", "serve", "&", "uvicorn", "gemma_api:app", "--host", "0.0.0.0", "--port", "8000"]
