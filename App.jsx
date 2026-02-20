import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [urlToScan, setUrlToScan] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleScan = async () => {
    if (!urlToScan) return;
    
    setIsLoading(true);
    setResults([]);
    setError(null);
    setLogs(["[SYSTEM] Initializing IXA Vulnerability Scanner..."]);

    const logInterval = setInterval(() => {
      const messages = [
        "[NETWORK] Establishing secure connection to target...",
        "[PARSER] Analyzing HTML DOM structure...",
        "[ENGINE] Identifying form entry points and input vectors...",
        "[SCAN] Injecting heuristic test payloads...",
        "[SCAN] Analyzing HTTP response headers and body...",
        "[AI] Requesting mitigation advice from Gemini..." // Added for user feedback
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setLogs((prev) => [...prev, randomMsg]);
    }, 800);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToScan }),
      });

      clearInterval(logInterval);

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      setLogs((prev) => [...prev, `[COMPLETE] Scan finished. Detected ${data.length} potential vulnerabilities.`]);

    } catch (err) {
      clearInterval(logInterval);
      setError(err.message);
      setLogs((prev) => [...prev, `[ERROR] Scan failed: ${err.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="top-nav">
        <div className="nav-brand">
          <svg className="shield-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="brand-title">IXA Security</span>
        </div>
        <div className="nav-status">
          <span className="status-dot"></span> System Online
        </div>
      </nav>

      <main className="main-content">
        {/* --- HEADER SECTION --- */}
        <header className="dashboard-header">
          <h1>Intelligent XSS Analyzer</h1>
          <p>Automated Reflected Cross-Site Scripting Detection Engine</p>
        </header>

        {/* --- INPUT SECTION --- */}
        <section className="scan-section">
          <div className="input-group">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="url"
              placeholder="https://target-application.com"
              value={urlToScan}
              onChange={(e) => setUrlToScan(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleScan()}
            />
            <button 
              className={`scan-btn ${isLoading ? 'loading' : ''}`}
              onClick={handleScan} 
              disabled={isLoading}
            >
              {isLoading ? 'Scanning...' : 'Start Audit'}
            </button>
          </div>
        </section>

        <div className="dashboard-grid">
          {/* --- AUDIT LOGS (Left Side) --- */}
          <section className="panel log-panel">
            <div className="panel-header">
              <h3>Audit Trail</h3>
              {isLoading && <span className="spinner"></span>}
            </div>
            <div className="log-window">
              {logs.length === 0 ? (
                <div className="empty-state">Ready to initialize scan sequence.</div>
              ) : (
                logs.map((log, index) => {
                  let logType = "info";
                  if (log.includes("[ERROR]")) logType = "error";
                  if (log.includes("[COMPLETE]")) logType = "success";
                  
                  return (
                    <div key={index} className={`log-entry ${logType}`}>
                      <span className="timestamp">{new Date().toLocaleTimeString()}</span>
                      <span className="log-text">{log}</span>
                    </div>
                  );
                })
              )}
              <div ref={logEndRef} />
            </div>
          </section>

          {/* --- RESULTS (Right Side) --- */}
          <section className="panel results-panel">
            <div className="panel-header">
              <h3>Vulnerability Report</h3>
              {results.length > 0 && (
                <span className="threat-badge">{results.length} Detected</span>
              )}
            </div>
            
            <div className="results-content">
              {error && (
                <div className="alert-banner error">
                  <strong>Scan Failed:</strong> {error}
                </div>
              )}

              {!isLoading && !error && logs.length > 0 && results.length === 0 && (
                <div className="alert-banner success">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  No vulnerabilities detected on target system.
                </div>
              )}

              <div className="cards-container">
                {results.map((vuln, index) => (
                  <div className="threat-card" key={index}>
                    <div className="card-header">
                      <span className="severity-high">High Severity</span>
                      <span className="method-badge">{vuln.form_method.toUpperCase()}</span>
                    </div>
                    <div className="card-body">
                      <div className="data-row">
                        <span className="label">Vulnerability</span>
                        <span className="value">Reflected Cross-Site Scripting (XSS)</span>
                      </div>
                      <div className="data-row">
                        <span className="label">Injection Vector</span>
                        <span className="value code-font">{vuln.form_action || "Self-referencing form"}</span>
                      </div>
                      
                      {/* --- REVISED: AI REMEDIATION SECTION --- */}
                      {vuln.ai_mitigation && (
                        <div className="ai-remediation-box">
                          <h4 className="ai-title">
                            <span className="sparkle-icon">✨</span> 
                            AI Remediation Plan
                          </h4>
                          <div className="ai-content">
                            {vuln.ai_mitigation}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;