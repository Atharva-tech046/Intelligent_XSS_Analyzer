import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from flask import Flask, request, jsonify
from flask_cors import CORS

# -----------------------------------------------
# 1. CREATE THE FLASK APP & ENABLE CORS
# -----------------------------------------------
app = Flask(__name__)
# This is a crucial step: It allows your React app (running on a different port)
# to make requests to this Flask backend.
CORS(app)


# -----------------------------------------------
# 2. PASTE IN YOUR SCANNER CODE
# (All the functions you had before)
# -----------------------------------------------

def get_all_forms(url):
    """Given a URL, it returns all forms from the HTML content"""
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status() # Check for web errors (like 404, 500)
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return []
    
    soup = BeautifulSoup(response.text, 'html.parser')
    return soup.find_all('form')

def get_form_details(form):
    """Extracts all useful information about an HTML form"""
    details = {}
    details['action'] = form.attrs.get('action', '').lower()
    details['method'] = form.attrs.get('method', 'get').lower()
    
    details['inputs'] = []
    for input_tag in form.find_all('input'):
        input_type = input_tag.attrs.get('type', 'text')
        input_name = input_tag.attrs.get('name')
        details['inputs'].append({'type': input_type, 'name': input_name})
        
    return details

def submit_form(form_details, url, payload):
    """Submits a form with the specified payload."""
    target_url = urljoin(url, form_details['action'])
    inputs = form_details['inputs']
    data = {}
    
    for input_detail in inputs:
        if input_detail['type'] in ('text', 'search', 'password', 'email'):
            if input_detail['name']:
                data[input_detail['name']] = payload
    
    try:
        if form_details['method'] == 'post':
            return requests.post(target_url, data=data, timeout=5)
        else:
            return requests.get(target_url, params=data, timeout=5)
    except requests.exceptions.RequestException as e:
        print(f"Error submitting form to {target_url}: {e}")
        return None

def scan_xss(url):
    """The main scanner function."""
    print(f"[*] Scanning {url} for Reflected XSS...")
    forms = get_all_forms(url)
    print(f"[+] Detected {len(forms)} forms on {url}.")
    
    payload = "myProjectScannerTest<>"
    vulnerable_forms = []
    
    for form in forms:
        form_details = get_form_details(form)
        response = submit_form(form_details, url, payload)
        
        if response and payload in response.text:
            vulnerability_info = {
                "url": url,
                "form_action": form_details['action'],
                "form_method": form_details['method'],
                "payload_used": payload
            }
            vulnerable_forms.append(vulnerability_info)
            print(f"[VULNERABLE!] Reflected XSS found in form with action: {form_details['action']}")

    return vulnerable_forms


# -----------------------------------------------
# 3. CREATE THE API "ENDPOINT"
# -----------------------------------------------

@app.route("/api/scan", methods=['POST'])
def handle_scan():
    """
    This is the function your React app will call.
    It expects a JSON with a "url" key.
    """
    # 1. Get the URL from the incoming JSON request
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({"error": "URL is required"}), 400
    
    target_url = data['url']
    
    # 2. Run the scanner
    try:
        vulnerabilities = scan_xss(target_url)
        # 3. Return the results as JSON
        return jsonify(vulnerabilities)
        
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# -----------------------------------------------
# 4. RUN THE SERVER
# -----------------------------------------------

if __name__ == "__main__":
    # Runs the server on http://127.0.0.1:5000
    # The 'debug=True' part means it will auto-reload when you save changes.
    app.run(debug=True, port=5000)