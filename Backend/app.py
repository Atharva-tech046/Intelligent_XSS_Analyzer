import os
import time
import requests
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_apscheduler import APScheduler
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# ==========================================
# 1. FRAMEWORK & DATABASE INITIALIZATION
# ==========================================
app = Flask(__name__)
CORS(app)

# PostgreSQL Configuration (Uses Cloud URL if deployed, otherwise local PostgreSQL)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Atharva%4031@localhost:5432/IXA_logs'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SCHEDULER_API_ENABLED'] = True # Enable Background Jobs

db = SQLAlchemy(app)
scheduler = APScheduler()

# Database Model: Threat History
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

# Database Model: Scheduled Automation Jobs
class ScheduledJob(db.Model):
    __tablename__ = 'scheduled_jobs'
    id = db.Column(db.Integer, primary_key=True)
    target_url = db.Column(db.String(255), nullable=False)
    scan_type = db.Column(db.String(50), default='dom')
    frequency = db.Column(db.String(50), nullable=False)
    last_run = db.Column(db.DateTime, nullable=True)

# ==========================================
# 2. SELENIUM ENGINE CONFIGURATION
# ==========================================
def init_driver():
    opts = Options()
    opts.add_argument("--headless")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--log-level=3") 
    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=opts)

# ==========================================
# 3. CORE LOGIC: SMART FUZZER (Automated + Manual)
# ==========================================
def perform_security_audit(target_url, scan_type):
    """ Executes Selenium Fuzzing & Groq logic. Called manually or by background jobs. """
    driver = init_driver()
    finding_data = None
    
    # Clean the target URL (Remove trailing slashes or existing parameters to start fresh)
    raw_target_url = target_url.split('?')[0].split('#')[0].rstrip('/')
    
    try:
        is_vulnerable = False
        vuln_type = ""
        vuln_vector = ""

        # Arsenal of common parameters a hacker would fuzz
        common_parameters = ["?query=", "?q=", "?search=", "?name=", "?keyword=", "?id="]

        # --- ENGINE ALPHA: REFLECTED XSS ---
        if scan_type == 'reflected':
            payload = "<script>alert('IXA_DOM')</script>"
            
            for param in common_parameters:
                attack_url = f"{raw_target_url}{param}{payload}"
                print(f"[IXA FUZZER] Testing Vector: {attack_url}")
                driver.get(attack_url)
                time.sleep(2) 
                
                try:
                    alert = driver.switch_to.alert
                    if 'IXA_DOM' in alert.text:
                        is_vulnerable = True
                        vuln_type = "Reflected XSS"
                        vuln_vector = f"Reflection Detected in parameter: {param}"
                        alert.accept()
                        break
                except:
                    if payload in driver.page_source:
                        is_vulnerable = True
                        vuln_type = "Reflected XSS"
                        vuln_vector = f"Reflection Detected in parameter: {param}"
                        break

        # --- ENGINE BETA: DOM-BASED XSS ---
        elif scan_type == 'dom':
            # Added a specific payload tailored for breaking out of image src tags (Level 3 specific)
            payloads = [
                "1.jpg' onload=alert('IXA_DOM') //",  # <--- Perfect for XSS Game Level 3
                "<script>alert('IXA_DOM')</script>",         
                "<img src=x onerror=alert('IXA_DOM')>",      
                "'\"><img src=x onerror=alert('IXA_DOM')>"     
            ]
            # Prioritize the Hash (#) parameter for DOM, as it directly targets client-side JS
            dom_vectors = ["#"] + common_parameters
            
            for vector in dom_vectors:
                for payload in payloads:
                    attack_url = f"{raw_target_url}{vector}{payload}"
                    print(f"[IXA FUZZER] Testing DOM Vector: {attack_url}")
                    driver.get(attack_url)
                    time.sleep(1.5)
                    try:
                        alert = driver.switch_to.alert
                        if 'IXA_DOM' in alert.text:
                            is_vulnerable = True
                            vuln_type = "DOM-Based XSS"
                            vuln_vector = f"DOM Sink Exploited via: {vector}{payload}"
                            alert.accept() 
                            break
                    except:
                        pass
                if is_vulnerable:
                    break # Stop fuzzing if we breached the perimeter

        # --- AI REMEDIATION GENERATION (GROQ LLAMA-3.1) ---
        if is_vulnerable:
            # Uses environment variable in cloud, falls back to hardcoded key locally
            groq_api_key = os.environ.get('GROQ_API_KEY', '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')
            try:
                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {"Authorization": f"Bearer {groq_api_key}", "Content-Type": "application/json"}
                prompt_payload = {
                    "model": "llama-3.1-8b-instant",
                    "messages": [{"role": "user", "content": f"Provide a short, highly technical 3-step fix for {vuln_type} at {raw_target_url}. Do not use markdown bolding."}]
                }
                # Added timeout=10 to prevent silent freezing!
                response = requests.post(url, headers=headers, json=prompt_payload, timeout=10)
                advice = response.json()['choices'][0]['message']['content'].strip()
            except Exception as e:
                print(f"[AI CORE ERROR] Remediation fetch failed: {e}")
                advice = "Mitigation Error: Implement strict input sanitization via DOMPurify and configure CSP."

            finding_data = {
                "target_url": raw_target_url,
                "vulnerability_type": vuln_type,
                "vector": vuln_vector,
                "ai_mitigation": advice
            }
                
    except Exception as e:
        print(f"[IXA ENGINE ERROR] {e}")
    finally:
        driver.quit()
        
    return finding_data

# ==========================================
# 4. SECURE LOGIN ROUTE
# ==========================================
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Define your strict Master Operative credentials here
    MASTER_USER = "Atharva"
    MASTER_PASS = "admin123"

    if username == MASTER_USER and password == MASTER_PASS:
        return jsonify({"status": "success", "message": "Authentication successful"}), 200
    else:
        return jsonify({"status": "error", "message": "Invalid access credentials"}), 401

# ==========================================
# 5. MANUAL API ROUTE (UI SCAN BUTTON)
# ==========================================
@app.route('/api/scan', methods=['POST'])
def scan_engine():
    print("\n[IXA CORE] 🟢 Manual scan directive received.")
    data = request.json
    target_url = data.get('url')
    scan_type = data.get('scan_type', 'reflected')
    
    finding_data = perform_security_audit(target_url, scan_type)
    findings = []
    
    if finding_data:
        new_finding = ScanResult(**finding_data)
        db.session.add(new_finding)
        db.session.commit()
        findings.append(new_finding.to_dict())
        print("[IXA CORE] 🚨 Threat confirmed & saved to PostgreSQL.")
    else:
        print("[IXA CORE] 🛡️ Target secure against utilized vectors.")
        
    return jsonify(findings)

# ==========================================
# 6. AUTOMATION SCHEDULER ROUTE
# ==========================================
def scheduled_worker_task(job_id, target_url, scan_type):
    with app.app_context(): 
        print(f"\n[AUTO-AGENT] ⏰ Waking up for scheduled scan: {target_url}")
        finding_data = perform_security_audit(target_url, scan_type)
        
        if finding_data:
            new_finding = ScanResult(**finding_data)
            db.session.add(new_finding)
            db.session.commit()
            print(f"[AUTO-AGENT] 🚨 CRITICAL THREAT FOUND! Logged to database silently.")
        else:
            print(f"[AUTO-AGENT] 🛡️ Target still secure.")
            
        job = ScheduledJob.query.get(job_id)
        if job:
            job.last_run = datetime.utcnow()
            db.session.commit()

@app.route('/api/schedule', methods=['POST'])
def create_schedule():
    data = request.json
    target_url = data.get('url')
    scan_type = data.get('scan_type', 'dom')
    frequency = data.get('frequency', 'hourly') 
    
    new_job = ScheduledJob(target_url=target_url, scan_type=scan_type, frequency=frequency)
    db.session.add(new_job)
    db.session.commit()
    
    if frequency == 'hourly':
        scheduler.add_job(id=str(new_job.id), func=scheduled_worker_task, args=[new_job.id, target_url, scan_type], trigger='interval', hours=1)
    elif frequency == 'daily':
        scheduler.add_job(id=str(new_job.id), func=scheduled_worker_task, args=[new_job.id, target_url, scan_type], trigger='interval', days=1)
    elif frequency == 'demo': 
        scheduler.add_job(id=str(new_job.id), func=scheduled_worker_task, args=[new_job.id, target_url, scan_type], trigger='interval', minutes=1)
        
    print(f"\n[IXA CORE] 📅 Automated job scheduled: {target_url} ({frequency})")
    return jsonify({"message": f"Successfully scheduled {frequency} scan for {target_url}"})

# ==========================================
# 7. DATABASE HISTORY & CHATBOT ROUTES
# ==========================================
@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        records = ScanResult.query.order_by(ScanResult.id.desc()).all()
        return jsonify([record.to_dict() for record in records])
    except Exception as e:
        return jsonify([])

@app.route('/api/chat', methods=['POST'])
def chat_with_ixa():
    data = request.json
    user_msg = data.get('message')
    context = data.get('context', 'General security inquiry.') 
    
    GROQ_API_KEY = "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"

    try:
        # Added timeout=10 here as well to prevent Chat UI from freezing
        res = requests.post("https://api.groq.com/openai/v1/chat/completions", 
                            headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                            json={
                                "model": "llama-3.1-8b-instant", 
                                "messages": [
                                    {
                                        "role": "system", 
                                        "content": f"You are the IXA Security Consultant. You MUST base your answers STRICTLY on this specific scan data: {context}. Do not invent generic examples. If asked about a payload or mitigation, reference the exact Target URL, Sink, and Vector from the context provided. If no context is provided, state that."
                                    },
                                    {"role": "user", "content": user_msg}
                                ]
                            }, timeout=10) 
        return jsonify({"reply": res.json()['choices'][0]['message']['content']})
    except Exception as e:
        print(f"[CHAT ERROR] {e}") 
        return jsonify({"reply": "AI Core connection timed out or is busy. Please try again."}), 500

# ==========================================
# 8. SERVER BOOT SEQUENCE
# ==========================================
if __name__ == '__main__':
    with app.app_context():
        db.create_all() 
    
    scheduler.init_app(app)
    scheduler.start()
    
    print("\n=========================================")
    print("   🛡️ IXA PLATFORM v2.0 SECURE BACKEND   ")
    print("   🤖 DevSecOps Automation Agent: ONLINE ")
    print("=========================================\n")
    app.run(debug=True, port=5000)