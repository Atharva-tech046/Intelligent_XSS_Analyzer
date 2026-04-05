import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './App.css';

const INITIAL_LOGS = [
  '[SYSTEM] Cinema mode activated.',
  '[SYSTEM] Ready to target reflected XSS.'
];

function App() {
  const [targetUrl, setTargetUrl] = useState('http://localhost:5500/vulnerable.html');
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const appendLog = (message) => setLogs((prev) => [...prev, message]);

  const handleScan = async () => {
    if (!targetUrl.trim() || loading) {
      return;
    }

    appendLog('[SYSTEM] Initializing scan engine...');
    appendLog('[PHASE 1] Injecting Payload into the target URL...');
    appendLog(`[PHASE 2] Launching browser audit for ${targetUrl}`);
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post('/api/scan', { url: targetUrl });
      const payload = response.data;
      setResult(payload);

      if (payload.vulnerability_type && payload.vulnerability_type !== 'No Reflected XSS Detected') {
        appendLog('[RESULT] Reflected XSS found and AI mitigation retrieved.');
      } else {
        appendLog('[RESULT] No reflected XSS detected by the scanner.');
      }
    } catch (error) {
      appendLog('[ERROR] Scan failed. Check backend connectivity.');
      console.error(error);
    } finally {
      setLoading(false);
      appendLog('[SYSTEM] Audit cycle complete.');
    }
  };

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="brand-bar">
          <div className="brand-label">IXA v2.0</div>
          <div className="brand-subtitle">Intelligent XSS Analyzer</div>
        </div>
        <div className="toolbar">
          <input
            className="url-input"
            type="url"
            value={targetUrl}
            placeholder="Enter target URL"
            onChange={(event) => setTargetUrl(event.target.value)}
          />
          <button className="audit-button" onClick={handleScan} disabled={loading || !targetUrl.trim()}>
            {loading ? 'SCANNING...' : 'START AUDIT'}
          </button>
        </div>
      </header>

      <main className="app-grid">
        <section className="panel panel-left">
          <div className="panel-header">Audit Trail</div>
          <div className="terminal-window" ref={terminalRef}>
            {logs.map((line, index) => (
              <div key={index} className="terminal-line">
                {line}
              </div>
            ))}
          </div>
        </section>

        <section className="panel panel-right">
          <div className="panel-header">Threat Findings</div>
          {result ? (
            <div className="threat-card">
              <div className="card-status">{result.vulnerability_type}</div>
              <div className="card-content">
                <div className="card-section">
                  <span className="section-title">Vector</span>
                  <code>{result.vector}</code>
                </div>
                <div className="card-section">
                  <span className="section-title">AI Mitigation</span>
                  <p>{result.ai_mitigation}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Awaiting scan results. Press START AUDIT to begin analysis.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
