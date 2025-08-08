# Use official Python slim image
FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Copy only requirements first to leverage Docker cache
COPY requirements.txt .

# Upgrade pip and install dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy the rest of the application
COPY . .

# Command to run the app
CMD ["uvicorn", "gemma_api:app", "--host", "0.0.0.0", "--port", "8080"]
