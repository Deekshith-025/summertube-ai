import os
import urllib.parse
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# from langchain.prompts import PromptTemplate # Not used, can be removed
from langchain_groq import ChatGroq
from langchain_community.document_loaders import UnstructuredURLLoader
from langchain.docstore.document import Document
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound, VideoUnavailable
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain.chains import RetrievalQA

# ----------------- App Initialization -----------------
app = FastAPI()

# ----------------- CORS Configuration -----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- API Key Configuration -----------------

from dotenv import load_dotenv
import os

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


# ----------------- In-memory Storage -----------------
knowledge_bases = {}
active_chains = {}

# ----------------- Pydantic Models -----------------
class URLRequest(BaseModel):
    url: str

class ChatRequest(BaseModel):
    url: str
    prompt: str

# ----------------- Helper Functions -----------------
def extract_video_id(url: str):
    parsed = urllib.parse.urlparse(url)
    if parsed.hostname == "youtu.be":
        return parsed.path[1:]
    if parsed.hostname in ["www.youtube.com", "youtube.com"]:
        query = urllib.parse.parse_qs(parsed.query)
        return query.get("v", [None])[0]
    return None

# ----------------- API Endpoints -----------------
@app.post("/create-knowledge-base")
async def create_knowledge_base(request: URLRequest):
    url = request.url
    if not url:
        raise HTTPException(status_code=400, detail="URL is required.")

    if url in knowledge_bases:
        active_chains[url] = knowledge_bases[url]
        return {"message": f"Knowledge base for '{url}' loaded from history."}

    try:
        # llm = ChatGroq(model="llama3-8b-8192", groq_api_key=GROQ_API_KEY)
        llm = ChatGroq(model="llama-3.1-8b-instant", groq_api_key=GROQ_API_KEY)

        docs_list = []
        if "youtube.com" in url or "youtu.be" in url:
            video_id = extract_video_id(url)
            if not video_id:
                raise HTTPException(status_code=400, detail="Could not extract YouTube video ID.")
            
            # The function call below is correct. The error is environmental.
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            text = " ".join([entry['text'] for entry in transcript])
            docs_list = [Document(page_content=text, metadata={"source": url})]
        else:
            loader = UnstructuredURLLoader(urls=[url], ssl_verify=False, headers={"User-Agent": "Mozilla/5.0"})
            docs_list = loader.load()

        if not docs_list:
            raise ValueError("Failed to load any content from the URL.")

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        split_docs = text_splitter.split_documents(docs_list)
        
        embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
        vectorstore = FAISS.from_documents(split_docs, embeddings)

        new_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vectorstore.as_retriever()
        )

        # ----------------- Generate 500-word Summary -----------------
        # Limit the text for the summary prompt to a reasonable size to save tokens/time
        combined_text = " ".join([doc.page_content for doc in split_docs[:10]]) 
        summary_prompt = (
            "Please provide a clear and concise summary of the following content in approximately 500 words:\n\n"
            f"{combined_text}"
        )
        summary_response = llm.invoke(summary_prompt)
        summary_text = summary_response.content if hasattr(summary_response, 'content') else summary_response

        # ----------------- Save Chain -----------------
        knowledge_bases[url] = new_chain
        active_chains[url] = new_chain

        return {
            "message": f"New knowledge base created for '{url}'.",
            "summary": summary_text.strip()
        }

    except (TranscriptsDisabled, NoTranscriptFound, VideoUnavailable):
        raise HTTPException(status_code=400, detail="YouTube transcript is disabled or unavailable for this video.")
    except Exception as e:
        # NOTE: This is the catch block where your error is being logged.
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")

@app.post("/chat")
async def chat_with_knowledge_base(request: ChatRequest):
    url = request.url
    prompt = request.prompt

    if not url or not prompt:
        raise HTTPException(status_code=400, detail="URL and prompt are required.")

    if url not in active_chains:
        raise HTTPException(status_code=404, detail="Knowledge base not found or not active. Please create or load it first.")
    
    active_chain = active_chains[url]
    try:
        response = active_chain.invoke({"query": prompt})
        return {"role": "assistant", "content": response['result']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing your request: {e}")

@app.get("/knowledge-bases")
async def get_knowledge_bases():
    return {"knowledge_bases": list(knowledge_bases.keys())}

@app.post("/clear-history")
async def clear_history():
    global knowledge_bases, active_chains
    knowledge_bases = {}
    active_chains = {}
    return {"message": "History and chats cleared."}