# 🛡️ AI-Powered Vulnerability Scanner

This is a web application built for a Final Year Engineering Project that scans websites for **Reflected XSS** vulnerabilities and provides intelligent, step-by-step mitigation advice using an AI chatbot.

### STATUS: 🚧 Work in Progress 🚧

---

## 🚀 Core Features

* **Custom XSS Scanner:** A Python-based scanner that crawls a target URL, finds all forms, and injects safe payloads to test for reflected vulnerabilities.
* **React Frontend:** A clean, modern user interface built with React (Vite) that allows users to submit scan jobs and view results.
* **Flask Backend API:** A robust backend server that handles scan requests, manages the scanning engine, and communicates with the AI.
* **AI Mitigation Advisor:** An intelligent chatbot (powered by the Gemini API and RAG) that explains *what* a vulnerability is and *how* to fix it.
* **User Dashboard:** (Coming Soon) A full user authentication system and database to save and review scan history.

---

## 🛠️ Tech Stack

This project is built with a modern, full-stack architecture:

* **Frontend:** React.js, Vite
* **Backend:** Python, Flask
* **Database:** PostgreSQL (for user data and scan results)
* **AI Advisor:** Google Gemini API
* **Vector Database:** ChromaDB (for the AI's knowledge base)
* **Scanning Engine:** Python (`requests` & `BeautifulSoup`)

---

## ⚙️ How It Works

1.  A user enters a URL into the **React** frontend.
2.  The frontend makes an API call to the **Flask** backend.
3.  The Flask server triggers the custom **XSS Scanner**.
4.  The scanner crawls the site, submits forms with safe payloads, and checks for reflections.
5.  The results are sent back to the Flask server.
6.  Flask queries the **Vector DB** for mitigation advice and sends the vulnerability data + advice to the **Gemini API**.
7.  The AI generates a user-friendly explanation and fix.
8.  The final result is sent to the React frontend and displayed to the user.
