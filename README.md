# SummerTube AI  
AI-powered summarizer for YouTube videos and website content.

SummerTube AI is a full-stack web application that extracts text/transcripts from YouTube videos or webpages and generates a clean summary using modern NLP and LLM models.

---

## Features
- Summarize **YouTube video transcripts**
- Summarize **website/article content**
- Uses AI / LLM models for high-quality summaries
- Fast & simple user interface
- Full-stack architecture (frontend + backend)
- Easy to extend with more models or data sources

---

## Setup Instructions

1. Go to the backend folder and install dependencies:
- cd backend
- pip install -r requirements.txt
- uvicorn main:app --reload

2. Go to the frontend folder and install dependencies:
cd frontend /
npm install /
npm start /

3. Make sure your environment variables are set correctly (backend .env and frontend .env).

4. Run both frontend and backend simultaneously
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

5. Open the frontend in the browser and the app will automatically communicate with the backend.
