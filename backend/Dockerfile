FROM python:3.12-slim

# System deps for pdfplumber + Tesseract OCR
RUN apt-get update && apt-get install -y \
    tesseract-ocr tesseract-ocr-eng \
    libpoppler-cpp-dev poppler-utils \
    gcc g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
