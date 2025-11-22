FROM python:3.11-slim

# Prevent Python from buffering logs (good for Render logs)
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (VERY IMPORTANT for some ML libs)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy & install dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Expose port Render expects
EXPOSE 8000

# FastAPI run command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
