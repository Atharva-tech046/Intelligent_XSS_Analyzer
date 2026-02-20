import os
from datetime import datetime
import google.generativeai as genai
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# --- 1. LOAD ENVIRONMENT VARIABLES ---
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

# Configure Gemini AI
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    ai_model = genai.GenerativeModel('gemini-2.5-flash')

# --- 2. SETUP POSTGRESQL (SQLAlchemy ORM) ---
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is missing from the .env file.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 3. DEFINE DATABASE SCHEMA ---
class ScanResultDB(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)
    target_url = Column(String, index=True)
    vulnerability_type = Column(String)
    form_method = Column(String)
    form_action = Column(String)
    ai_mitigation = Column(Text) 
    scan_time = Column(DateTime, default=datetime.utcnow)

# Auto-create the table in PostgreSQL if it doesn't exist
Base.metadata.create_all(bind=engine)

# --- 4. THE AI WRAPPER LOGIC ---
def generate_mitigation_advice(url, method, action):
    if not GEMINI_API_KEY:
        return "AI API Key not configured. Mitigation advice unavailable."
        
    prompt = f"""
    You are an expert Cybersecurity Consultant.
    An automated scanner just found a Reflected Cross-Site Scripting (XSS) vulnerability.
    
    Details:
    - Target URL: {url}
    - HTTP Method: {method}
    - Injection Point (Form Action): {action}
    
    Provide a concise, professional, 3-step mitigation guide for a developer to fix this specific issue. 
    Keep it under 4 sentences. Do not use asterisks or markdown formatting.
    """
    
    try:
        response = ai_model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"AI Generation Failed: {str(e)}"

# --- 5. DATABASE SAVE FUNCTION ---
def save_scan_to_db(url, vuln_type, method, action, advice):
    db = SessionLocal()
    try:
        new_scan = ScanResultDB(
            target_url=url,
            vulnerability_type=vuln_type,
            form_method=method,
            form_action=action,
            ai_mitigation=advice
        )
        db.add(new_scan)
        db.commit()
        db.refresh(new_scan)
        return new_scan.id
    except Exception as e:
        db.rollback()
        print(f"[!] DB Save Error: {e}")
    finally:
        db.close()

# ... (Keep all your existing imports and the ScanResultDB class exactly as they are) ...

# --- 1. ADD THE NEW CHATBOT TABLE ---
class ChatMessageDB(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)  # Groups messages into a specific conversation thread
    sender = Column(String)                  # Will be either "user" or "ai"
    message = Column(Text)                   # The actual chat text
    timestamp = Column(DateTime, default=datetime.utcnow)

# Re-run the table creation. It will automatically detect the new table and build it in Postgres!
Base.metadata.create_all(bind=engine)


# --- 2. ADD CHAT MEMORY FUNCTIONS ---
def save_chat_message(session_id: str, sender: str, message: str):
    """Saves a single message to the database."""
    db = SessionLocal()
    try:
        new_msg = ChatMessageDB(session_id=session_id, sender=sender, message=message)
        db.add(new_msg)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[!] Chat DB Save Error: {e}")
    finally:
        db.close()

def get_chat_history(session_id: str, limit: int = 10):
    """Retrieves the last N messages for a specific session so the AI remembers context."""
    db = SessionLocal()
    try:
        # Fetch the most recent messages, then reverse them so they are in chronological order
        messages = db.query(ChatMessageDB)\
                     .filter(ChatMessageDB.session_id == session_id)\
                     .order_by(ChatMessageDB.timestamp.desc())\
                     .limit(limit)\
                     .all()
        return messages[::-1] 
    finally:
        db.close()