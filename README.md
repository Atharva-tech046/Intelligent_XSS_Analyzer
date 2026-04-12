<div align="center">

<img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield-alert.svg" width="80" height="80" alt="IXA Logo"/>

# 🛡️ IXA Platform v2.0
**Intelligent XSS Analyzer | Autonomous Vulnerability Detection**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-14354C?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Selenium](https://img.shields.io/badge/Selenium-43B02A?style=for-the-badge&logo=selenium&logoColor=white)](https://www.selenium.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![AI Powered](https://img.shields.io/badge/Groq-Llama_3.1-f59e0b?style=for-the-badge)](https://groq.com/)

---

*A high-performance, enterprise-grade security orchestration tool engineered to mathematically validate client-side threats and instantly generate AI-driven mitigation strategies.*

</div>

## 📽️ Project Overview

> "Standard scanners tell you that your application is broken. IXA physically breaks in, proves the vulnerability, and generates the exact code needed to fix it using high-speed AI."

**IXA** is a next-generation Dynamic Application Security Testing (DAST) platform. It bridges the gap between raw vulnerability detection and developer education by combining a custom-built, dual-engine **XSS Scanner** with the lightning-fast **Groq Llama-3.1 LLM** as a security consultant.

---

## ✨ Key Features

* **🔬 Dual-Engine Detection:** Actively targets both URL query parameters (Reflected XSS) and complex JavaScript fragment sinks (DOM-Based XSS).
* **🤖 Dynamic Payload Fuzzing:** Bypasses simple static scrapers by actively orchestrating a headless Google Chrome browser, forcing payload execution to guarantee zero false positives.
* **🧠 AI Remediation Strategy:** Instantly queries Groq's Llama-3.1 8B LLM to synthesize actionable, 3-step mitigation strategies tailored specifically to the exploited vector.
* **🗄️ Threat Intelligence DB:** Automatically serializes and archives all confirmed threats into a localized PostgreSQL database for historical SecOps review.
* **🎨 Enterprise Cloud UI:** A highly polished, glassmorphism React dashboard featuring dynamic status indicators, real-time terminal execution logs, and sliding database panels.

---

## 🛠️ The Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | **React + Vite** | Enterprise UI, Animations & State Management |
| **Backend** | **Python Flask** | RESTful API Bridge & Task Orchestration |
| **Detection** | **Selenium WebDriver** | Headless Browser Automation & Fuzzing |
| **Intelligence** | **Groq Llama 3.1** | Cloud LLM for Remediation Generation |
| **Storage** | **PostgreSQL** | Relational Threat Intelligence Archiving |

---

## 🧠 System Architecture

1.  **Target Acquisition:** React frontend securely transmits the target URL and selected scan module to the Flask API.
2.  **Browser Emulation:** Backend initializes a headless Google Chrome instance to test client-side JavaScript processing natively.
3.  **Payload Injection:** The selected engine (Reflected or DOM) injects a series of breakout payloads into the target constraints.
4.  **Mathematical Validation:** Selenium actively listens for a browser-level JavaScript execution (`alert()` or DOM reflection) to confirm the breach.
5.  **Intelligence Generation:** If vulnerable, the context is sent to the Groq API, which generates an immediate mitigation strategy.
6.  **Persistence:** Findings are saved to PostgreSQL and pushed to the React UI.

---

## 📂 Project Structure

```bash
IXA-Project/
├── 📱 frontend/              # React + Vite Application
│   ├── src/
│   │   ├── App.jsx          # Main logic, Enterprise UI & API bridge
│   │   ├── App.css          # Glassmorphism & Keyframe Animations
│   │   └── index.css        # Global Cloud-Native Layout Overrides
├── ⚙️ backend/               # Python Flask Application
│   ├── app.py               # REST Endpoints, Selenium Fuzzer & DB Schema
│   └── .env                 # Secret API Keys (Git Ignored)
└── 🗄️ Database/              # PostgreSQL Storage
    └── IXA_logs             # Automated append-only historical threat ledger
