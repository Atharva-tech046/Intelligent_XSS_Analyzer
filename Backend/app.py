import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Framework Initialization
app = Flask(__name__)
CORS(app)

# PostgreSQL Configuration (Pointing to the NEW IXA_logs database)
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

def init_driver():
    opts = Options()
    opts.add_argument("--headless")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=opts)

# Core Scanner Route
@app.route('/api/scan', methods=['POST'])
def scan_engine():
    print("\n[BACKEND] 🟢 Request received from frontend!")
    data = request.json
    target_url = data.get('url')
    scan_type = data.get('scan_type', 'reflected')
    print(f"[BACKEND] 🎯 Target: {target_url} | Engine: {scan_type.upper()}")
    
    driver = init_driver()
    print("[BACKEND] ✅ Selenium WebDriver booted successfully!")
    findings = []
    
    try:
        is_vulnerable = False
        vuln_type = ""
        vuln_vector = ""

        # --- ENGINE 1: REFLECTED XSS ---
        if scan_type == 'reflected':
            print("[BACKEND] 🔫 Firing Reflected payload...")
            payload = "<script>console.log('IXA_REFLECTED')</script>"
            attack_url = f"{target_url}?query={payload}" if "?" not in target_url else f"{target_url}&query={payload}"
            driver.get(attack_url)
            time.sleep(3) 
            
            if payload in driver.page_source:
                is_vulnerable = True
                vuln_type = "Reflected XSS"
                vuln_vector = "URL Parameter Reflection Detected"
                print("[BACKEND] 🚨 Vulnerability Found!")

        # --- ENGINE 2: DOM-BASED XSS (THE FUZZER) ---
        elif scan_type == 'dom':
            print("[BACKEND] 🔫 Loading DOM Fuzzer Arsenal...")
            payloads = [
                "#<script>alert('IXA_DOM')</script>",         
                "#<img src=x onerror=alert('IXA_DOM')>",      
                "#'><img src=x onerror=alert('IXA_DOM')>"     # Attribute Breakout
            ]
            
            for index, payload in enumerate(payloads):
                print(f"[BACKEND] 🧪 Testing Payload {index + 1}/{len(payloads)}...")
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
                        print(f"[BACKEND] 🚨 Vulnerability Found with Payload {index + 1}!")
                        break
                except:
                    continue

        # --- AI REMEDIATION TRIGGER ---
        if is_vulnerable:
            print("[BACKEND] 🧠 Generating AI Remediation via Groq...")
            try:
                # IMPORTANT: Put your actual Groq key here!
                groq_api_key = "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"
                
                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {groq_api_key}",
                    "Content-Type": "application/json"
                }
                prompt_payload = {
                    "model": "llama-3.1-8b-instant",
                    "messages": [
                        {"role": "user", "content": f"Provide a short, punchy 3-step fix for {vuln_type} at {target_url}. Do not use bold text or markdown."}
                    ]
                }
                
                response = requests.post(url, headers=headers, json=prompt_payload)
                api_data = response.json()
                advice = api_data['choices'][0]['message']['content'].strip() if 'error' not in api_data else "Mitigation: 1. Validate input. 2. Sanitize data via DOMPurify. 3. Implement strict CSP."
            except Exception as e:
                print(f"[BACKEND] AI Error: {e}")
                advice = "Mitigation: 1. Validate input. 2. Sanitize data via DOMPurify. 3. Implement strict CSP."

            new_finding = ScanResult(
                target_url=target_url,
                vulnerability_type=vuln_type,
                vector=vuln_vector,
                ai_mitigation=advice
            )
            db.session.add(new_finding)
            db.session.commit()
            findings.append(new_finding.to_dict())
            print("[BACKEND] 💾 Finding saved to database and sent to frontend.")
        else:
            print("[BACKEND] 🛡️ Target appears secure against current payloads.")
                
    except Exception as e:
        print(f"\n[BACKEND] ❌ Scan Error: {e}\n")
    finally:
        driver.quit()
        print("[BACKEND] 🛑 Selenium WebDriver closed.")
        
    return jsonify(findings)

# --- DATABASE HISTORY ROUTE ---
@app.route('/api/history', methods=['GET'])
def get_history():
    print("\n[BACKEND] 🗄️ Fetching Threat Intelligence History...")
    try:
        # Fetch all records, ordered by newest first
        records = ScanResult.query.order_by(ScanResult.id.desc()).all()
        print(f"[BACKEND] ✅ Successfully retrieved {len(records)} records.")
        return jsonify([record.to_dict() for record in records])
    except Exception as e:
        print(f"[BACKEND] ❌ Database Fetch Error: {e}")
        return jsonify([])

if __name__ == '__main__':
    with app.app_context():
        db.create_all() 
    app.run(debug=True, port=5000)