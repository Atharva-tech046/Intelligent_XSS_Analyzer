# 🛡️ IXA: Intelligent XSS Analyzer

**IXA** is a full-stack web application designed to scan websites for **Reflected XSS** vulnerabilities and provide intelligent, AI-driven mitigation advice.

This project was built as a Final Year Engineering Project, demonstrating a complete system architecture from a modern React frontend to a custom-built Python backend with a locally-hosted AI.

**Note: This tool is for educational purposes only. Only run it on websites you own or have explicit permission to test.**

---

## ✨ Core Features

* **Custom XSS Scanner:** A backend engine built with `requests` and `BeautifulSoup` to find and test forms for Reflected XSS.
* **AI-Powered Advisor:** A locally-hosted LLM (`Phi-3-mini`) that provides accurate, step-by-step mitigation advice.
* **RAG Pipeline:** The AI uses a **Retrieval-Augmented Generation** (RAG) pipeline with a `ChromaDB` vector store to prevent hallucinations and ensure advice is fact-based.
* **Full-Stack Application:** A decoupled architecture with a **React** frontend and a **FastAPI** backend.
* **User & Scan Management:** A **PostgreSQL** database handles user authentication and saves scan history (coming soon).

---

## 🛠️ Tech Stack

This project is divided into a full-stack architecture.

### 🖥️ Frontend (Client-Side)
* **React.js:** A JavaScript library for building the user interface.
* **Vite:** A high-speed build tool and development server for React.
* **CSS:** Custom CSS for styling the "green-and-black" theme.

### 🧠 Backend (Server-Side)
* **FastAPI:** A high-performance Python framework for building the API.
* **Uvicorn:** The ASGI server that runs the FastAPI application.
* **Pydantic:** Used by FastAPI for automatic data validation.

### 🔬 Scanner Engine
* **`requests`:** Used to send HTTP requests and download a page's HTML.
* **`BeautifulSoup` (bs4):** Used to parse the raw HTML and reliably find all forms.

### 🤖 AI Advisor (RAG Pipeline)
* **`Phi-3-mini`:** The locally-hosted, open-source Small Language Model (SLM) that generates advice.
* **`transformers`:** The Hugging Face library used to load and run the LLM.
* **`ChromaDB`:** The vector database used to store the AI's "knowledge base."
* **`sentence-transformers`:** The library used to create embeddings for the RAG pipeline.

### 💾 Database
* **PostgreSQL:** The primary relational database for storing user accounts and scan logs.

---

## 🚀 How to Run This Project

This project has two parts (backend and frontend) that must be run separately.

### 1. Backend (FastAPI Server)

1.  Navigate to your backend project folder.
2.  Install all required Python libraries:
    ```bash
    # (Make sure your virtual environment is active)
    pip install fastapi "uvicorn[standard]" requests beautifulsoup4 pydantic
    ```
3.  Run the Uvicorn server (it will auto-reload on changes):
    ```bash
    uvicorn app:app --host 127.0.0.1 --port 5000 --reload
    ```
4.  Your backend is now running at `http://127.0.0.1:5000`.

### 2. Frontend (React App)

1.  Open a **new terminal** and navigate to your frontend project folder.
2.  Install the node modules (only need to do this once):
    ```bash
    npm install
    ```
3.  Run the React development server:
    ```bash
    npm run dev
    ```
4.  Your frontend is now running. Open your browser and go to the URL shown in the terminal (usually `http://localhost:5173`).

---

## 📂 Project Structure
