# 🛡️ IXA: Intelligent XSS Analyzer
### *Autonomous Vulnerability Detection & AI-Driven Remediation*

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![AI](https://img.shields.io/badge/AI-LLM_RAG-00f2a1?style=for-the-badge)

**IXA** is a next-generation security orchestration tool. It bridges the gap between raw vulnerability detection and developer education by combining a custom-built **XSS Scanner** with a locally-hosted **AI Security Consultant**.

---

## 📽️ Project Overview


> "Most scanners tell you what is broken. IXA tells you why it's broken and exactly how to fix it using verified, non-hallucinated AI advice."

---

## ✨ Key Features

* **🔍 Precision Scanner:** Uses a DOM-aware approach with `BeautifulSoup` to map forms and test for injection points.
* **🤖 AI Advisor (RAG):** Integrates a local `Phi-3-mini` model. It doesn't just guess; it retrieves facts from a `ChromaDB` vector store before answering.
* **⚡ Real-time Feedback:** A high-performance React dashboard that displays scan results as they are discovered.
* **🔒 Privacy First:** All AI processing happens locally on your machine. No data is sent to external APIs like OpenAI.

---

## 🛠️ The Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | **React + Vite** | High-speed UI & State Management |
| **Backend** | **FastAPI** | High-concurrency ASGI Server |
| **Intelligence** | **Phi-3 + RAG** | Local LLM for Mitigation Logic |
| **Storage** | **PostgreSQL** | User Data & Scan History |
| **Parsing** | **BeautifulSoup4** | HTML Structural Analysis |

---

## 🧠 System Architecture



1.  **Scanner Engine:** Crawls the target URL -> Finds Forms -> Injects Tracking Payloads.
2.  **Validation:** Checks if the payload is "Reflected" in the HTML response.
3.  **Knowledge Retrieval:** If vulnerable, the system queries `ChromaDB` for relevant security docs.
4.  **AI Generation:** The LLM synthesizes a report based *only* on the retrieved documentation.

---

## 📂 Project Structure

```bash
IXA-Project/
├── 📱 frontend/             # React + Vite Application
│   ├── src/
│   │   ├── App.jsx          # Main logic & API bridge
│   │   └── App.css          # Terminal-themed styling
├── ⚙️ backend/              # FastAPI Application
│   ├── app.py               # API Endpoints & Scanner Logic
│   ├── ai_logic.py          # RAG Pipeline & Phi-3 Integration
│   └── knowledge_base/      # ChromaDB Vector Store
└── 📄 README.md             # Project Documentation
