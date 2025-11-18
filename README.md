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
