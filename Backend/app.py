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

# PostgreSQL Configuration
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
            payload = "<script>console.log('IXA_REFLECTED')</script>"
            
            for param in common_parameters:
                attack_url = f"{raw_target_url}{param}{payload}"
                print(f"[IXA FUZZER] Testing Vector: {attack_url}")
                driver.get(attack_url)
                time.sleep(2) 
                
                if payload in driver.page_source:
                    is_vulnerable = True
                    vuln_type = "Reflected XSS"
                    vuln_vector = f"Reflection Detected in parameter: {param}"
                    break

        # --- ENGINE BETA: DOM-BASED XSS ---
        elif scan_type == 'dom':
            payloads = [
                "<script>alert('IXA_DOM')</script>",         
                "<img src=x onerror=alert('IXA_DOM')>",      
                "'\"><img src=x onerror=alert('IXA_DOM')>"     
            ]
            dom_vectors = common_parameters + ["#"]
            
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
            groq_api_key = "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"
            try:
                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {"Authorization": f"Bearer {groq_api_key}", "Content-Type": "application/json"}
                prompt_payload = {
                    "model": "llama-3.1-8b-instant",
                    "messages": [{"role": "user", "content": f"Provide a short, highly technical 3-step fix for {vuln_type} at {raw_target_url}. Do not use markdown bolding."}]
                }
                response = requests.post(url, headers=headers, json=prompt_payload)
                advice = response.json()['choices'][0]['message']['content'].strip()
            except Exception:
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
# 4. MANUAL API ROUTE (UI SCAN BUTTON)
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
# 5. AUTOMATION SCHEDULER ROUTE
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
# 6. DATABASE HISTORY & CHATBOT ROUTES
# ==========================================
@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        records = ScanResult.query.order_by(ScanResult.id.desc()).all()
        return jsonify([record.to_dict() for record in records])
    except Exception as e:
        return jsonify([])

@app.route('/api/chat', methods=['POST'])
def chat_interface():
    data = request.json
    messages = data.get('messages', [])
    groq_api_key = "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"
    
    try:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {groq_api_key}", "Content-Type": "application/json"}
        system_prompt = {"role": "system", "content": "You are IXA, an elite cybersecurity AI assistant designed by Atharva. Answer follow-up questions concisely."}
        
        prompt_payload = {"model": "llama-3.1-8b-instant", "messages": [system_prompt] + messages}
        response = requests.post(url, headers=headers, json=prompt_payload)
        reply = response.json()['choices'][0]['message']['content'].strip()
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"reply": "Connection to AI Core severed. Please try again."}), 500

# ==========================================
# 7. SERVER BOOT SEQUENCE
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