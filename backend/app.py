import os
import time
from urllib.parse import quote, urlparse, urlunparse

import google.generativeai as genai
from flask import Flask, jsonify, request
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from sqlalchemy.exc import SQLAlchemyError
from webdriver_manager.chrome import ChromeDriverManager

from models import ScanResult, db

DATABASE_URI = 'postgresql://postgres:Atharva%4031@localhost:5432/IXA_db'
ATTACK_PAYLOAD = "<script>console.log('IXA_REFLECTED')</script>"
FALLBACK_MITIGATION = (
    'Use strict output encoding and never inject untrusted URL parameters into innerHTML. '
    'Validate and sanitize incoming query parameters, and apply context-aware escaping for HTML content.'
)

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()


def build_attack_url(target_url: str) -> str:
    parsed = urlparse(target_url)
    encoded_payload = quote(ATTACK_PAYLOAD, safe='')
    if parsed.query:
        query_string = f"{parsed.query}&query={encoded_payload}"
    else:
        query_string = f"query={encoded_payload}"

    return urlunparse(parsed._replace(query=query_string))


def create_headless_driver():
    chrome_options = Options()
    chrome_options.add_argument('--headless=new')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--log-level=3')

    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=chrome_options)


def request_ai_mitigation(target_url: str) -> str:
    api_key = os.environ.get('GOOGLE_API_KEY', '')
    if not api_key:
        return FALLBACK_MITIGATION

    genai.configure(api_key=api_key)
    prompt = (
        'Reflected XSS was detected on the following target: ' + target_url +
        '. Provide a concise, developer-focused 3-step mitigation plan for this reflected XSS vector.'
    )

    try:
        response = genai.TextGeneration.create(
            model='gemini-1.5-flash',
            prompt=prompt,
            max_output_tokens=220,
        )

        mitigation_text = getattr(response, 'text', None)
        if mitigation_text:
            return mitigation_text.strip()

        return str(response).strip()
    except Exception:
        return FALLBACK_MITIGATION


@app.route('/api/scan', methods=['POST'])
def scan_target():
    payload = request.get_json(silent=True) or {}
    target_url = payload.get('url', '').strip()

    if not target_url:
        return jsonify({'error': 'Missing target URL.'}), 400

    attack_url = build_attack_url(target_url)
    driver = None
    detected = False
    ai_mitigation = FALLBACK_MITIGATION
    vulnerability_type = 'No Reflected XSS Detected'
    vector = attack_url

    try:
        driver = create_headless_driver()
        driver.get(attack_url)
        time.sleep(3)

        detected = ATTACK_PAYLOAD in driver.page_source
        if detected:
            vulnerability_type = 'Reflected XSS'
            ai_mitigation = request_ai_mitigation(target_url)
        else:
            ai_mitigation = (
                'No exploitable reflected XSS payload was detected by the lightweight scanner. '
                'Confirm the target behavior and review encoding for all URL-driven DOM insertion points.'
            )

        scan_result = ScanResult(
            target_url=target_url,
            vulnerability_type=vulnerability_type,
            vector=vector,
            ai_mitigation=ai_mitigation,
        )

        db.session.add(scan_result)
        db.session.commit()

        return jsonify(scan_result.to_dict())
    except SQLAlchemyError as err:
        db.session.rollback()
        return jsonify({'error': 'Database write failed.', 'details': str(err)}), 500
    except Exception as err:
        return jsonify({'error': 'Scanner execution failed.', 'details': str(err)}), 500
    finally:
        if driver:
            try:
                driver.quit()
            except Exception:
                pass


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
