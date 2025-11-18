# summertube-ai

Automated summarization of YouTube videos and websites using Deep Learning & NLP

## Project Overview  
SummerTube AI is a full-stack application that allows users to paste a YouTube video link or website URL and receive an optimized summary generated via deep learning & natural language processing techniques.  
- Front end built with React (or your chosen framework) for an interactive UI.  
- Back end built with Node.js/Express (or your chosen stack) to handle API requests, summarization logic and integration with language models.  
- Uses LangChain, Hugging Face hosted models and web-scraping (or YouTube data API) to fetch content, process it and generate summaries.

## Features  
- Input: YouTube video link **or** webpage URL.  
- Processing:  
  - Fetches transcript from the video (or extracts text from webpage).  
  - Preprocesses text (tokenization, cleaning).  
  - Feeds into deep learning / LLM pipeline (via LangChain) to generate a concise summary.  
- Output: A human-readable summary shown in the UI.  
- Optional: Download summary as text/pdf, or save to history.  
- Responsive UI for desktop and mobile.

## Repository Structure  
summertube-ai/
├── backend/ ← Back end code (Express.js, API endpoints, summarization logic)
├── frontend/ ← Front end code (React app)
├── .gitignore
├── LICENSE
└── README.md


## Getting Started (Local Development)  
### Prerequisites  
- Node.js (v16+ recommended)  
- npm or yarn  
- (Optional) Docker & docker-compose if you want containerized setup  
- Git (to clone the repo)  
- (Optional) A free-tier account on Hugging Face, YouTube Data API key, or other model access depending on your summarization pipeline  

### Clone the Repo  
```bash
git clone https://github.com/Deekshith-025/summertube-ai.git  
cd summertube-ai

### Setup Back End
cd backend  
cp .env.example .env  
# In .env set:  
#   MONGO_URI=your_mongo_connection_string  
#   OPENAI_API_KEY=your_openai_or_model_api_key  
#   OTHER_SECRETS=...  
npm install  
npm run dev   # or npm start for production mode

### Setup Front End
cd ../frontend  
cp .env.example .env  
# In .env set:  
#   REACT_APP_API_URL=http://localhost:5000   # or your backend URL  
npm install  
npm start   # launches development server (usually http://localhost:3000)
