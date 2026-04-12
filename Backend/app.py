import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# ==========================================
# 1. FRAMEWORK & DATABASE INITIALIZATION
# ==========================================
app = Flask(__name__)
CORS(app)

# PostgreSQL Configuration (Pointing to the IXA_logs database)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Atharva%4031@localhost:5432/IXA_logs'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database Model Schema
class ScanResult(db.Model):
    __tablename__ = 'scan_results'
    id = db.Column(db.Integer, primary_key=True)
    target_url = db.Column(db.String(255), nullable=False)
    vulnerability_type = db.Column(db.String(100), nullable=False)
    vector = db.Column(db.Text, nullable=False)
    ai_mitigation = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'target_url': self.target_url,
            'vulnerability_type': self.vulnerability_type,
            'vector': self.vector,
            'ai_mitigation': self.ai_mitigation
        }

# ==========================================
# 2. SELENIUM ENGINE CONFIGURATION
# ==========================================
def init_driver():
    opts = Options()
    opts.add_argument("--headless")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    # Suppress console logging for a cleaner terminal
    opts.add_argument("--log-level=3") 
    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=opts)

# ==========================================
# 3. CORE VULNERABILITY SCANNER ROUTE
# ==========================================
@app.route('/api/scan', methods=['POST'])
def scan_engine():
    print("\n[IXA CORE] 🟢 Scan directive received.")
    data = request.json
    target_url = data.get('url')
    scan_type = data.get('scan_type', 'reflected')
    print(f"[IXA CORE] 🎯 Target: {target_url} | Engine: {scan_type.upper()}")
    
    driver = init_driver()
    findings = []
    
    try:
        is_vulnerable = False
        vuln_type = ""
        vuln_vector = ""

        # --- ENGINE ALPHA: REFLECTED XSS ---
        if scan_type == 'reflected':
            payload = "<script>console.log('IXA_REFLECTED')</script>"
            attack_url = f"{target_url}?query={payload}" if "?" not in target_url else f"{target_url}&query={payload}"
            driver.get(attack_url)
            time.sleep(3) 
            
            if payload in driver.page_source:
                is_vulnerable = True
                vuln_type = "Reflected XSS"
                vuln_vector = "URL Parameter Reflection Detected"
                print("[IXA CORE] 🚨 Reflected Vulnerability Confirmed!")

        # --- ENGINE BETA: DOM-BASED XSS (THE FUZZER) ---
        elif scan_type == 'dom':
            payloads = [
                "#<script>alert('IXA_DOM')</script>",         
                "#<img src=x onerror=alert('IXA_DOM')>",      
                "#'><img src=x onerror=alert('IXA_DOM')>"     # Attribute Breakout
            ]
            
            for index, payload in enumerate(payloads):
                attack_url = f"{target_url}{payload}"
                driver.get(attack_url)
                time.sleep(2)
                
                try:
                    alert = driver.switch_to.alert
                    if 'IXA_DOM' in alert.text:
                        is_vulnerable = True
                        vuln_type = "DOM-Based XSS"
                        vuln_vector = f"DOM Sink Exploited via: {payload}"
                        alert.accept() 
                        print(f"[IXA CORE] 🚨 DOM Vulnerability Confirmed via Payload {index + 1}!")
                        break
                except:
                    continue

        # --- AI REMEDIATION GENERATION (GROQ LLAMA-3.1) ---
        if is_vulnerable:
            print("[IXA CORE] 🧠 Generating AI Mitigation Strategy...")
            try:
                # !!! IMPORTANT: PASTE YOUR GROQ KEY BELOW !!!
                groq_api_key = "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"
                
                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {groq_api_key}",
                    "Content-Type": "application/json"
                }
                prompt_payload = {
                    "model": "llama-3.1-8b-instant",
                    "messages": [
                        {"role": "user", "content": f"Provide a short, highly technical 3-step fix for {vuln_type} at {target_url}. Do not use markdown bolding."}
                    ]
                }
                
                response = requests.post(url, headers=headers, json=prompt_payload)
                api_data = response.json()
                advice = api_data['choices'][0]['message']['content'].strip() if 'error' not in api_data else "Mitigation Error: Implement Content Security Policy."
            except Exception as e:
                print(f"[IXA CORE] AI Error: {e}")
                advice = "Mitigation Error: Implement strict input sanitization via DOMPurify and configure CSP."

            # Save to PostgreSQL
            new_finding = ScanResult(
                target_url=target_url,
                vulnerability_type=vuln_type,
                vector=vuln_vector,
                ai_mitigation=advice
            )
            db.session.add(new_finding)
            db.session.commit()
            findings.append(new_finding.to_dict())
            print("[IXA CORE] 💾 Threat Intelligence persisted to database.")
        else:
            print("[IXA CORE] 🛡️ Target secure against utilized vectors.")
                
    except Exception as e:
        print(f"\n[IXA CORE] ❌ Execution Error: {e}\n")
    finally:
        driver.quit()
        
    return jsonify(findings)

# ==========================================
# 4. DATABASE HISTORY ROUTE
# ==========================================
@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        records = ScanResult.query.order_by(ScanResult.id.desc()).all()
        return jsonify([record.to_dict() for record in records])
    except Exception as e:
        return jsonify([])

# ==========================================
# 5. NEW: INTERACTIVE AI CHATBOT ROUTE
# ==========================================
@app.route('/api/chat', methods=['POST'])
def chat_interface():
    data = request.json
    messages = data.get('messages', [])
    
    # !!! IMPORTANT: PASTE YOUR GROQ KEY BELOW !!!
    groq_api_key = "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"
    
    try:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json"
        }
        
        # System persona to make it act like a SecOps AI
        system_prompt = {
            "role": "system", 
            "content": "You are IXA, an elite cybersecurity AI assistant designed by Atharva. Answer the user's follow-up questions about XSS vulnerabilities concisely and technically. Provide code snippets if asked."
        }
        
        prompt_payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [system_prompt] + messages
        }
        
        response = requests.post(url, headers=headers, json=prompt_payload)
        api_data = response.json()
        reply = api_data['choices'][0]['message']['content'].strip()
        return jsonify({"reply": reply})
    except Exception as e:
        print(f"[IXA CORE] Chat Error: {e}")
        return jsonify({"reply": "Connection to AI Core severed. Please try again."}), 500

# ==========================================
# 6. SERVER BOOT SEQUENCE
# ==========================================
if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Ensure Postgres tables exist
    print("\n=========================================")
    print("   🛡️ IXA PLATFORM v2.0 SECURE BACKEND   ")
    print("=========================================\n")
    app.run(debug=True, port=5000)


    