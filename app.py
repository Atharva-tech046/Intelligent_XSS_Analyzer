import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --- 🌟 IMPORT YOUR NEW AI & DB LOGIC 🌟 ---
from ai_db_logic import generate_mitigation_advice, save_scan_to_db

class ScanRequest(BaseModel):
    url: str

app = FastAPI(title="IXA Scanner API")

# Setup CORS so React can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/scan")
async def scan_url(request: ScanRequest):
    target_url = request.url
    results = []
    
    # Our test payload
    payload = "<script>alert('IXA_VULN_TEST')</script>"

    try:
        # 1. Fetch the target page
        print(f"[*] Scanning {target_url}...")
        response = requests.get(target_url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        forms = soup.find_all("form")

        for form in forms:
            # Figure out where the form sends data
            form_action = form.get("action")
            submit_url = urljoin(target_url, form_action) if form_action else target_url
            form_method = form.get("method", "get").lower()
            
            # Find all input boxes and inject our payload
            inputs = form.find_all("input")
            data = {}
            for input_tag in inputs:
                input_name = input_tag.get("name")
                input_type = input_tag.get("type", "text")
                # Don't overwrite submit buttons
                if input_name and input_type != "submit":
                    data[input_name] = payload
            
            # Send the malicious request
            if form_method == "get":
                test_res = requests.get(submit_url, params=data)
            else:
                test_res = requests.post(submit_url, data=data)
            
            # --- VULNERABILITY DETECTED! ---
            if payload in test_res.text:
                print(f"[!] Vulnerability found on form action: {submit_url}")
                
                # --- 🤖 THE AI & DB MAGIC HAPPENS HERE 🤖 ---
                print("[+] Requesting AI Mitigation Advice from Gemini...")
                ai_mitigation = generate_mitigation_advice(target_url, form_method, submit_url)
                
                print("[+] Saving complete report to PostgreSQL...")
                save_scan_to_db(target_url, "Reflected XSS", form_method, submit_url, ai_mitigation)
                
                # Append to results so React can display it
                results.append({
                    "url": target_url,
                    "form_action": submit_url,
                    "form_method": form_method,
                    "type": "Reflected XSS",
                    "ai_mitigation":ai_mitigation # React will pick this up automatically!
                })

        return results

    except Exception as e:
        print(f"[-] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000)