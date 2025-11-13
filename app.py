import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import uvicorn  # LIB FOR FAST API 

# FAST API LIB.
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

class ScanRequest(BaseModel):
    """Defines the shape of the incoming JSON: {"url": "..."}"""
    url: str

app = FastAPI(
    title="Intelligent XSS Scanner API",
    description="API for the XSS Scanner"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  #React app's address
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)


def get_all_forms(url):
    """Given a URL, it returns all forms from the HTML content"""
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
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
# 4. CREATE THE API "ENDPOINT"
# CHANGED!
# -----------------------------------------------

@app.post("/api/scan")
def handle_scan(request: ScanRequest):
    """
    This is the function your React app will call.
    It uses the ScanRequest model for automatic validation.
    """
    # 1. Get the URL from the validated request
    target_url = request.url
    
    # 2. Run the scanner
    try:
        vulnerabilities = scan_xss(target_url)
        # 3. Return the results as JSON
        return vulnerabilities
        
    except Exception as e:
        # FastAPI's way of sending an error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )


if __name__ == "__main__":
    # This now correctly points to "app:app" since your filename is app.py
    # It tells uvicorn: "In the file app.py, find the object named app."
    uvicorn.run("app:app", host="127.0.0.1", port=5000, reload=True)