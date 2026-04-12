import React, { useState, useRef, useEffect } from 'react';
import { Shield, ShieldAlert, Terminal, Activity, Database, Server, SearchCode, Cpu, X, Play, RefreshCw, XCircle, ChevronDown, Lock, Zap, ArrowRight } from 'lucide-react';
import './App.css';
import heroImg from './assets/hero.png';

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
  
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChatPopup, setShowChatPopup] = useState(false);

  const logEndRef = useRef(null);
  const chatEndRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [auditTrail]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (finding) {
      const timer = setTimeout(() => {
        setShowChatPopup(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowChatPopup(false);
    }
  }, [finding]);

  const addLog = (text, type = "normal") => {
    setAuditTrail(prev => [...prev, { time: new Date().toLocaleTimeString(), text, type }]);
  };

  const handleScan = async () => {
    if (!targetUrl) return;
    setIsScanning(true);
    setFinding(null);
    setShowChatPopup(false);
    setChatMessages([]);
    addLog(`Initializing scan request to Engine API...`, "system");
    addLog(`Target locked: ${targetUrl}`, "normal");
    addLog(`Deploying ${scanType.toUpperCase()} vulnerability payloads...`, "normal");

    try {
      const response = await fetch('http://127.0.0.1:5000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, scan_type: scanType })
      });

      const data = await response.json();
      
      if (data.length > 0) {
        addLog(`Engine identified ${data.length} critical vulnerabilities.`, "error");
        setFinding(data[0]);
        setChatMessages([{ role: 'assistant', content: data[0].ai_mitigation }]);
      } else {
        addLog(`Scan complete. Target appears secure against utilized vectors.`, "success");
      }
    } catch (error) {
      addLog(`Network Error: Failed to connect to Engine API. Is the Python server running?`, "error");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = { role: 'user', content: chatInput };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      });
      const data = await response.json();
      setChatMessages([...updatedMessages, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setChatMessages([...updatedMessages, { role: 'assistant', content: "Error connecting to AI Core." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const fetchHistory = async () => {
    setShowHistory(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/history');
      const data = await response.json();
      setDbHistory(data);
    } catch (error) {
      console.error("Failed to fetch history");
    }
  };

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (currentView === 'intro') {
    return (
      <div className="landing-page">
        <nav className="landing-nav">
          <div className="nav-brand">
            <ShieldAlert size={28} color="var(--color-cyan)" />
            <span className="font-bold tracking-wider">IXA PLATFORM</span>
          </div>
          <button className="btn btn-primary" onClick={() => setCurrentView('scanner')}>
            Launch Engine
          </button>
        </nav>

        <section className="hero-section">
          <div className="ambient-orb orb-1"></div>
          <div className="ambient-orb orb-2"></div>
          <div className="grid-overlay"></div>
          
          <div className="hero-content">
            <div className="hero-logo-container">
              <img src={heroImg} alt="IXA Logo" className="hero-logo-img" onError={(e) => e.target.style.display='none'} />
            </div>
            <h1 className="hero-title">Intelligent XSS Analyzer</h1>
            <p className="hero-subtitle">
              Advanced Automated Vulnerability Detection Engine.<br/>
              Engineered for Reflected & DOM-Based Cross-Site Scripting Analysis.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => setCurrentView('scanner')}>
                <Play size={20} fill="currentColor" /> GET STARTED
              </button>
              <button className="btn btn-secondary btn-lg" onClick={scrollToFeatures}>
                Explore Scanner <ChevronDown size={20} />
              </button>
            </div>
          </div>
        </section>

        <section className="features-section" ref={featuresRef}>
          <div className="section-header text-center">
            <h2 className="section-title">Next-Generation Threat Intel</h2>
            <p className="section-desc">Deploy sophisticated attack vectors and leverage Llama 3.1 AI for instant remediation.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card glass-panel">
              <div className="feature-icon"><Lock size={32} color="var(--color-primary)" /></div>
              <h3>Automated Scanning</h3>
              <p>Simulates real-world XSS attacks to identify both DOM-based and Reflected vulnerabilities with high precision and low false positives.</p>
            </div>
            <div className="feature-card glass-panel">
              <div className="feature-icon"><Zap size={32} color="var(--color-cyan)" /></div>
              <h3>AI-Powered Mitigation</h3>
              <p>Generates highly technical, context-aware remediation steps instantly using the integrated Groq Llama-3.1 AI assistant.</p>
            </div>
            <div className="feature-card glass-panel">
              <div className="feature-icon"><Server size={32} color="var(--color-success)" /></div>
              <h3>Interactive Security DB</h3>
              <p>Maintains persistent threat intelligence with a dedicated PostgreSQL database, making past auditing records instantly accessible.</p>
            </div>
          </div>
        </section>

        <section className="cta-section text-center">
          <h2 className="cta-title">Ready to secure your application?</h2>
          <p className="cta-subtitle">Initialize the IXA Engine and start auditing your web interfaces.</p>
          <button className="btn btn-primary btn-lg mt-4" onClick={() => setCurrentView('scanner')}>
             <ArrowRight size={20} /> INITIALIZE SYSTEM
          </button>
        </section>

        <footer className="landing-footer text-center">
           <p>© {new Date().getFullYear()} IXA Cyber SecOps. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="app-container slide-up-anim">
      <header className="top-nav">
        <div className="brand-container cursor-pointer" onClick={() => setCurrentView('intro')}>
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

      <main className="workspace">
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

        <div className="findings-panel glass-panel">
          <div className="panel-header" style={{ borderBottom: '1px solid var(--bg-border)' }}>
            <Activity size={18} /> Threat Analysis Dashboard
          </div>

          {isScanning && !finding && (
            <div className="status-overlay">
              <div className="spinner-outer">
                <div className="spinner-inner"></div>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Translating Target Vectors...</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Executing payload arsenal against designated sinks.</p>
            </div>
          )}

          {!isScanning && !finding && (
            <div className="status-overlay" style={{ background: 'transparent' }}>
              <Server size={64} style={{ opacity: 0.2, marginBottom: '24px' }} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-muted)' }}>Awaiting Scan Directives</h3>
            </div>
          )}
          
          {finding && !isScanning && (
            <div className="threat-card slide-up-anim">
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

                {showChatPopup && (
                  <div className="chat-container pop-in-anim">
                    <div className="chat-header">
                      <Cpu size={18} />
                      IXA SecOps Consultant (Llama 3.1)
                    </div>
                    
                    <div className="chat-messages">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`chat-bubble ${msg.role} pop-in-anim`} style={{animationDelay: `${idx * 0.1}s`}}>
                          {msg.content}
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="chat-bubble assistant" style={{ opacity: 0.7 }}>
                          Analyzing query...
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleSendMessage}>
                      <input
                        type="text"
                        className="chat-input"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask a follow-up question about this vulnerability..."
                        disabled={isChatLoading}
                      />
                      <button type="submit" className="chat-send-btn" disabled={isChatLoading || !chatInput.trim()}>
                        <Play size={16} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

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
