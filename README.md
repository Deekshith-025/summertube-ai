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

## Tech Stack

### **Frontend**
- React / Vite (or CRA depending on your project)
- Axios for API calls
- TailwindCSS / CSS

### **Backend**
- Node.js + Express
- LangChain / LLM pipeline
- YouTube transcript extraction / Web scraping
- MongoDB (optional if you store history)

---

## Project Structure
summertube-ai/
│── backend/       # API + summarization logic
│── frontend/      # UI code (React)
│── README.md

---

## 🔧 Setup Instructions

### Backend
cd backend
npm install
npm start        # or: npm run dev

### Frontend
cd frontend
npm install
npm start

### Open the App
Frontend: http://localhost:3000
Backend:  http://localhost:5000

### ** Clone the Repository**
```bash
git clone https://github.com/Deekshith-025/summertube-ai.git
cd summertube-ai
