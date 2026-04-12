import React, { useState, useRef, useEffect } from 'react';
import { Shield, ShieldAlert, Terminal, Activity, Database, Server, ServerCrash, SearchCode, Cpu, X, Play, RefreshCw, XCircle } from 'lucide-react';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('intro');

  const [targetUrl, setTargetUrl] = useState('https://xss-game.appspot.com/level3/frame');
  const [scanType, setScanType] = useState('dom');
  const [isScanning, setIsScanning] = useState(false);
  const [finding, setFinding] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [dbHistory, setDbHistory] = useState([]);
  
  const [auditTrail, setAuditTrail] = useState([
    { time: new Date().toLocaleTimeString(), text: "IXA Security Platform v2.0 Initialized.", type: "system" },
    { time: new Date().toLocaleTimeString(), text: "Connected to PostgreSQL Threat Database.", type: "success" }
  ]);
  
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [auditTrail]);

  const addLog = (text, type = "normal") => {
    setAuditTrail(prev => [...prev, { time: new Date().toLocaleTimeString(), text, type }]);
  };

  const handleScan = async () => {
    if (!targetUrl) return;
    setIsScanning(true);
    setFinding(null);
    addLog(`Initializing scan request to Engine API...`, "system");
    addLog(`Target locked: ${targetUrl}`, "normal");
    addLog(`Deploying ${scanType.toUpperCase()} vulnerability payloads...`, "normal");

    // Simulating API call since we don't have the backend here
    setTimeout(() => {
      // Dummy data response
      const dummyResponse = [
        {
          id: 1042,
          vulnerability_type: scanType === 'dom' ? 'DOM-Based XSS' : 'Reflected XSS',
          target_url: targetUrl,
          vector: '<img src=x onerror=alert(1)>',
          ai_mitigation: 'Implement strict Content Security Policy (CSP). Validate and sanitize all user input directly upon receiving and escape all dynamic content when rendering to the DOM.'
        }
      ];

      if (dummyResponse.length > 0) {
        addLog(`Engine identified ${dummyResponse.length} critical vulnerabilities.`, "error");
        setFinding(dummyResponse[0]);
        // add to pretend db history
        setDbHistory(prev => [dummyResponse[0], ...prev]);
      } else {
        addLog(`Scan complete. Target appears secure against utilized vectors.`, "success");
      }
      setIsScanning(false);
    }, 3500); // 3.5 seconds simulate network & engine time
  };

  const fetchHistory = () => {
    setShowHistory(true);
    // Use the existing mock dbHistory 
  };

  if (currentView === 'intro') {
    return (
      <div className="intro-container">
        <div className="ambient-orb" style={{ width: 400, height: 400, background: 'var(--color-primary)', top: '-10%', left: '-10%' }}></div>
        <div className="ambient-orb" style={{ width: 300, height: 300, background: 'var(--color-cyan)', bottom: '10%', right: '-5%' }}></div>
        
        <div className="intro-bg-elements grid-overlay"></div>
        
        <div className="intro-content glass-panel">
          <div className="intro-logo-wrap">
            <Shield size={64} className="text-cyan-400" color="var(--color-cyan)" />
          </div>
          <h1 className="intro-title">IXA Platform</h1>
          <div className="intro-subtitle">
            Advanced Automated Vulnerability Detection Engine.<br/>
            Engineered for Reflected & DOM-Based Cross-Site Scripting (XSS) Analysis.
          </div>
          <button className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }} onClick={() => setCurrentView('scanner')}>
            <Play size={20} fill="currentColor" /> INITIALIZE SYSTEM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      
      {/* ENTERPRISE HEADER */}
      <header className="top-nav">
        <div className="brand-container">
          <div className="brand-text text-white">
            <ShieldAlert size={28} color="var(--color-cyan)" />
            IXA Platform
          </div>
          <div className="brand-badge">SecOps v2.0</div>
        </div>
        
        <div className="control-bar">
          <div className="status-indicator glass-panel">
            <div className={`status-dot ${isScanning ? 'scanning' : 'idle'}`}></div>
            {isScanning ? 'Engine Active' : 'System Ready'}
          </div>

          <button onClick={fetchHistory} className="btn btn-secondary">
            <Database size={16} /> Threat Intel DB
          </button>

          <div className="input-group">
            <select className="select-control" value={scanType} onChange={(e) => setScanType(e.target.value)} disabled={isScanning}>
              <option value="reflected">Reflected XSS</option>
              <option value="dom">DOM-Based XSS</option>
            </select>
            <input 
              type="text" 
              className="input-control"
              value={targetUrl} 
              placeholder="Enter Target URL/URI"
              onChange={(e) => setTargetUrl(e.target.value)}
              disabled={isScanning}
            />
          </div>
          
          <button className="btn btn-primary" onClick={handleScan} disabled={isScanning || !targetUrl}>
            {isScanning ? <RefreshCw size={18} className="animate-spin" /> : <SearchCode size={18} />}
            {isScanning ? 'Executing Audit...' : 'Start Audit'}
          </button>
        </div>
      </header>

      {/* WORKSPACE */}
      <main className="workspace">
        
        {/* LOG VIEWER */}
        <div className="log-panel glass-panel">
          <div className="panel-header">
            <Terminal size={18} /> Engine Execution Logs
          </div>
          <div className="log-content">
            {auditTrail.map((log, i) => (
              <div key={i} className={`log-entry ${log.type}`}>
                <span className="log-time">[{log.time}]</span>
                <span className={`log-msg ${log.type}`}>{log.text}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* SECURITY FINDINGS */}
        <div className="findings-panel glass-panel">
          <div className="panel-header" style={{ borderBottom: '1px solid var(--bg-border)' }}>
            <Activity size={18} /> Threat Analysis Dashboard
          </div>

          {/* Dynamic Scanning State */}
          {isScanning && !finding && (
            <div className="status-overlay">
              <div className="spinner-outer">
                <div className="spinner-inner"></div>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Translating Target Vectors...</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Executing payload arsenal against designated sinks.</p>
            </div>
          )}

          {/* Idle State */}
          {!isScanning && !finding && (
            <div className="status-overlay" style={{ background: 'transparent' }}>
              <Server size={64} style={{ opacity: 0.2, marginBottom: '24px' }} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-muted)' }}>Awaiting Scan Directives</h3>
            </div>
          )}
          
          {/* Threat Card */}
          {finding && !isScanning && (
            <div className="threat-card">
              <div className="threat-header">
                <div className="threat-title">
                  <XCircle size={24} /> {finding.vulnerability_type} Detected
                </div>
                <span className="severity-pill">CRITICAL</span>
              </div>
              
              <div className="threat-body">
                <div className="info-grid">
                  <div className="info-label">Target Vulnerable</div>
                  <div className="info-value">{finding.target_url}</div>
                  
                  <div className="info-label">Attack Vector</div>
                  <div className="info-value">{finding.vector}</div>
                </div>

                <div className="ai-recommendation">
                  <div className="ai-header">
                    <Cpu size={18} />
                    AI Remediation Strategy
                  </div>
                  <div className="ai-content">{finding.ai_mitigation}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* DATABASE SLIDE PANELS */}
      {showHistory && (
        <>
          <div className="backdrop" onClick={() => setShowHistory(false)}></div>
          <div className="side-panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' }}>
              <h2 style={{ color: '#fff', fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={20} /> Threat Intel Database
              </h2>
              <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => setShowHistory(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <table className="db-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th style={{ width: '150px' }}>Threat</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {dbHistory.length === 0 && (
                    <tr><td colSpan="3" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No historical threat records found.</td></tr>
                  )}
                  {dbHistory.map((record, i) => (
                    <tr key={i}>
                      <td className="cell-id">#{record.id}</td>
                      <td className="cell-type">{record.vulnerability_type}</td>
                      <td className="cell-url">
                        <div style={{ marginBottom: '6px', color: '#fff' }}>{record.target_url}</div>
                        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{record.vector}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

export default App;
