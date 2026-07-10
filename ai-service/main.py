import os
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-service")

app = FastAPI(title="Bookfair AI RAG Assistant")

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    logger.warning("GEMINI_API_KEY environment variable is not set!")

class QueryRequest(BaseModel):
    user_query: str

def load_context():
    context_text = ""
    doc_paths = [
        "docs/README.md",
        "docs/setup.md",
        "docs/architecture.md",
        "../README.md",
        "../setup.md",
        "../architecture.md",
        "README.md",
        "setup.md",
        "architecture.md"
    ]
    
    loaded_any = False
    for path in doc_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                    filename = os.path.basename(path)
                    context_text += f"\n\n--- DOCUMENT: {filename} ---\n{content}\n"
                    logger.info(f"Loaded context from {path}")
                    loaded_any = True
            except Exception as e:
                logger.error(f"Error reading {path}: {str(e)}")
                
    if not loaded_any:
        logger.warning("No documentation files found. RAG assistant will run without project context.")
    return context_text

@app.get("/")
def read_root():
    return {"status": "online", "message": "Bookfair AI Assistant is active"}

@app.post("/query")
def query_assistant(request: QueryRequest):
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured on the server.")
        
    try:
        context = load_context()
        
        # Instantiate LangChain ChatGoogleGenerativeAI
        llm = ChatGoogleGenerativeAI(
            model="gemini-3.5-flash",
            google_api_key=api_key,
            temperature=0.2
        )
        
        # Define Prompt Template
        prompt = ChatPromptTemplate.from_messages([
            ("system", (
                "You are the Bookfair RAG Assistant. Your job is to answer questions about the bookfair reservation system "
                "based strictly on the documentation provided below. If you cannot find the answer in the provided documents, "
                "politely state that you do not know the answer based on the current documentation.\n\n"
                "CONTEXT DOCUMENTS:\n"
                "{context}"
            )),
            ("human", "{question}")
        ])
        
        # Build LangChain Chain (LCEL)
        chain = prompt | llm | StrOutputParser()
        
        response_text = chain.invoke({
            "context": context,
            "question": request.user_query
        })
        
        return {"answer": response_text}
        
    except Exception as e:
        logger.error(f"Gemini generation failed: {str(e)}. Attempting g4f fallback...")
        try:
            import g4f
            
            system_prompt = (
                "You are the Bookfair RAG Assistant. Answer the user based strictly on this context:\n"
                f"{context}"
            )
            
            response = g4f.ChatCompletion.create(
                model=g4f.models.gpt_35_turbo,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": request.user_query}
                ]
            )
            
            if response:
                return {"answer": response + "\n\n*(Note: Powered by fallback AI due to primary service limits)*"}
            else:
                raise Exception("Empty response from fallback")
                
        except Exception as fallback_err:
            logger.error(f"Fallback generation failed: {str(fallback_err)}")
            raise HTTPException(status_code=500, detail=f"Generation and fallback both failed.")
