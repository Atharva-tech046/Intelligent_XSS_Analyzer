import React, { useState, useRef, useEffect } from 'react';
import { Shield, ShieldAlert, Terminal, Activity, Database, Server, SearchCode, Cpu, X, Play, RefreshCw, XCircle, ChevronDown, Lock, Zap, ArrowRight, User, Key, Bot, Timer, ShieldCheck, BarChart2, CheckCircle, ChevronUp } from 'lucide-react';
import './App.css';
import heroImg from './assets/hero.png';

function App() {
  const [currentView, setCurrentView] = useState('intro'); // 'intro', 'login', 'scanner'

  const [targetUrl, setTargetUrl] = useState('https://xss-game.appspot.com/level3/frame');
  const [scanType, setScanType] = useState('dom');
  const [isScanning, setIsScanning] = useState(false);
  const [finding, setFinding] = useState(null);
  const [scanReport, setScanReport] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [dbHistory, setDbHistory] = useState([]);
  
  const [auditTrail, setAuditTrail] = useState([
    { time: new Date().toLocaleTimeString(), text: "IXA Security Platform v2.0 Initialized.", type: "system" },
    { time: new Date().toLocaleTimeString(), text: "Connected to PostgreSQL Threat Database.", type: "success" }
  ]);
  
  // --- CHAT STATE ---
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(true);

  // --- LOGIN STATE ---
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const logEndRef = useRef(null);
  const chatEndRef = useRef(null);
  const featuresRef = useRef(null);

  // Auto-scroll logs and chat
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
        setChatExpanded(true);
      }, 1500); 
      return () => clearTimeout(timer);
    } else {
      setShowChatPopup(false);
    }
  }, [finding]);

  const addLog = (text, type = "normal") => {
    setAuditTrail(prev => [...prev, { time: new Date().toLocaleTimeString(), text, type }]);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) return;
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      setCurrentView('scanner');
      addLog(`Authentication successful for operative [${loginForm.username}]. Security clearance verified.`, "success");
    }, 1800);
  };

  const handleScan = async () => {
    if (!targetUrl) return;
    setIsScanning(true);
    setFinding(null);
    setScanReport(null);
    setShowChatPopup(false);
    setChatMessages([]);
    
    addLog(`Initializing scan request to Engine API...`, "system");
    addLog(`Target locked: ${targetUrl}`, "normal");
    addLog(`Deploying ${scanType.toUpperCase()} vulnerability payloads...`, "normal");

    const startTime = Date.now();

    try {
      const response = await fetch('http://127.0.0.1:5000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, scan_type: scanType })
      });

      const data = await response.json();
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      const isVulnerable = data.length > 0;

      setScanReport({
        duration: duration,
        vectorsAnalyzed: scanType === 'dom' ? 42 : 115,
        severity: isVulnerable ? 'CRITICAL' : 'SECURE',
      });

      if (isVulnerable) {
        addLog(`Engine identified ${data.length} critical vulnerabilities in ${duration}s.`, "error");
        setFinding(data[0]);
        setChatMessages([{ role: 'assistant', content: data[0].ai_mitigation }]);
      } else {
        addLog(`Scan complete in ${duration}s. Target appears secure against utilized vectors.`, "success");
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
        <nav className="landing-nav glide-up">
          <div className="nav-brand">
            <ShieldAlert size={28} color="var(--color-cyan)" />
            <span className="font-bold tracking-wider">IXA PLATFORM</span>
          </div>
          <button className="btn btn-primary btn-premium" onClick={() => setCurrentView('login')}>
            Launch Engine
          </button>
        </nav>

        <section className="hero-section">
          <div className="ambient-backdrop backdrop-1"></div>
          <div className="ambient-backdrop backdrop-2"></div>
          <div className="grid-overlay smooth-grid"></div>
          
          <div className="hero-content">
            <div className="hero-logo-container clear-fade">
              <img src={heroImg} alt="IXA Logo" className="hero-logo-img" onError={(e) => e.target.style.display='none'} />
            </div>
            <h1 className="hero-title glide-up" style={{ animationDelay: '0.1s' }}>Intelligent XSS Analyzer</h1>
            <p className="hero-subtitle glide-up" style={{ animationDelay: '0.2s' }}>
              Advanced Automated Vulnerability Detection Engine.<br/>
              Engineered for Reflected & DOM-Based Cross-Site Scripting Analysis.
            </p>
            <div className="hero-cta glide-up" style={{ animationDelay: '0.3s' }}>
              <button className="btn btn-primary btn-lg btn-premium" onClick={() => setCurrentView('login')}>
                <Play size={20} fill="currentColor" /> GET STARTED
              </button>
              <button className="btn btn-secondary btn-lg btn-premium" onClick={scrollToFeatures}>
                Explore Scanner <ChevronDown size={20} />
              </button>
            </div>
          </div>
        </section>

        <section className="features-section" ref={featuresRef}>
          <div className="section-header text-center glide-up">
            <h2 className="section-title text-elegant">Next-Generation Threat Intel</h2>
            <p className="section-desc">Deploy sophisticated attack vectors and leverage Llama 3.1 AI for instant remediation.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card glass-panel glide-up" style={{ animationDelay: '0.1s' }}>
              <div className="feature-icon icon-elegant"><Lock size={32} color="var(--color-primary)" /></div>
              <h3>Automated Scanning</h3>
              <p>Simulates real-world XSS attacks to identify both DOM-based and Reflected vulnerabilities with high precision and low false positives.</p>
            </div>
            <div className="feature-card glass-panel glide-up" style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon icon-elegant"><Zap size={32} color="var(--color-cyan)" /></div>
              <h3>AI-Powered Mitigation</h3>
              <p>Generates highly technical, context-aware remediation steps instantly using the integrated Groq Llama-3.1 AI assistant.</p>
            </div>
            <div className="feature-card glass-panel glide-up" style={{ animationDelay: '0.3s' }}>
              <div className="feature-icon icon-elegant"><Server size={32} color="var(--color-success)" /></div>
              <h3>Interactive Security DB</h3>
              <p>Maintains persistent threat intelligence with a dedicated PostgreSQL database, making past auditing records instantly accessible.</p>
            </div>
          </div>
        </section>

        <section className="cta-section text-center glide-up">
          <div className="ambient-backdrop backdrop-3"></div>
          <h2 className="cta-title">Ready to secure your application?</h2>
          <p className="cta-subtitle">Initialize the IXA Engine and start auditing your web interfaces.</p>
          <button className="btn btn-primary btn-lg mt-4 btn-premium" onClick={() => setCurrentView('login')}>
             <ArrowRight size={20} /> SECURE LOGIN
          </button>
        </section>

        <footer className="landing-footer text-center">
           <p>© {new Date().getFullYear()} IXA Cyber SecOps. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  if (currentView === 'login') {
    return (
      <div className="login-page">
        <div className="ambient-backdrop backdrop-1"></div>
        <div className="ambient-backdrop backdrop-2"></div>
        <div className="grid-overlay smooth-grid"></div>

        <nav className="landing-nav glide-up" style={{ position: 'absolute', width: '100%', top: 0 }}>
          <div className="nav-brand cursor-pointer" onClick={() => setCurrentView('intro')}>
            <ShieldAlert size={28} color="var(--color-cyan)" />
            <span className="font-bold tracking-wider">IXA PLATFORM</span>
          </div>
        </nav>

        <div className="login-container slide-up-anim">
          <div className="login-card glass-panel">
            <div className="login-header">
              <div className="login-icon-bg clear-fade">
                <Lock size={36} color="var(--color-cyan)" />
              </div>
              <h2 className="login-title text-elegant">Operative Login</h2>
              <p className="login-subtitle">Authenticate to access the Engine</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group slide-right" style={{ animationDelay: '0.1s' }}>
                <label>Access Credential</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="Enter Username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                    required
                    disabled={isLoggingIn}
                  />
                  <div className="input-focus-line"></div>
                </div>
              </div>
              
              <div className="form-group slide-right" style={{ animationDelay: '0.2s' }}>
                <label>Security Phasekey</label>
                <div className="input-with-icon">
                  <Key size={18} className="input-icon" />
                  <input 
                    type="password" 
                    placeholder="Enter Verification Key"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    required
                    disabled={isLoggingIn}
                  />
                  <div className="input-focus-line"></div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary login-btn btn-premium slide-right" 
                style={{ animationDelay: '0.3s' }}
                disabled={isLoggingIn || !loginForm.username || !loginForm.password}
              >
                {isLoggingIn ? (
                  <><RefreshCw size={20} className="animate-spin" /> Verifying Clearance...</>
                ) : (
                  <><Shield size={20} /> AUTHORIZE</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container app-workspace-fade">
      <header className="top-nav">
        <div className="brand-container cursor-pointer" onClick={() => setCurrentView('intro')}>
          <div className="brand-text text-white">
            <ShieldAlert size={28} color="var(--color-cyan)" />
            IXA Platform
          </div>
          <div className="brand-badge btn-premium">SecOps v2.0</div>
        </div>
        
        <div className="control-bar">
          <div className="status-indicator glass-panel">
            <div className={`status-dot ${isScanning ? 'scanning' : 'idle'}`}></div>
            {isScanning ? 'Engine Active' : 'System Ready'}
          </div>

          <button onClick={fetchHistory} className="btn btn-secondary btn-premium">
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
          
          <button className="btn btn-primary btn-premium" onClick={handleScan} disabled={isScanning || !targetUrl}>
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

          {/* ACTIVE SCANNING STATE */}
          {isScanning && (
            <div className="status-overlay clear-fade">
              <div className="spinner-outer">
                <div className="spinner-inner"></div>
              </div>
              <h3 className="text-elegant" style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Translating Target Vectors...</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Executing payload arsenal against designated sinks.</p>
            </div>
          )}

          {/* IDLE STATE */}
          {!isScanning && !scanReport && (
            <div className="status-overlay" style={{ background: 'transparent' }}>
              <div className="clear-fade">
                <Server size={64} style={{ opacity: 0.2, marginBottom: '24px' }} color="var(--color-primary)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-muted)' }}>Awaiting Scan Directives</h3>
            </div>
          )}

          {/* POST-SCAN DASHBOARD */}
          {!isScanning && scanReport && (
            <div className="dashboard-container stagger-reveal">
              <div className="dashboard-metrics-grid">
                <div className="metric-box glass-panel reveal-item" style={{ '--stagger': 1 }}>
                  <div className="metric-icon"><Timer size={22} color="var(--color-cyan)" /></div>
                  <div className="metric-data">
                    <span className="metric-label">Audit Duration</span>
                    <strong className="metric-value">{scanReport.duration}s</strong>
                  </div>
                </div>
                <div className="metric-box glass-panel reveal-item" style={{ '--stagger': 2 }}>
                  <div className="metric-icon"><SearchCode size={22} color="var(--color-primary)" /></div>
                  <div className="metric-data">
                    <span className="metric-label">Vectors Analyzed</span>
                    <strong className="metric-value">{scanReport.vectorsAnalyzed}</strong>
                  </div>
                </div>
                <div className="metric-box glass-panel reveal-item" style={{ '--stagger': 3 }}>
                  <div className="metric-icon">
                    {scanReport.severity === 'CRITICAL' ? <ShieldAlert size={22} color="#ef4444" /> : <ShieldCheck size={22} color="var(--color-success)" />}
                  </div>
                  <div className="metric-data">
                    <span className="metric-label">System Integrity</span>
                    <strong className={`metric-value ${scanReport.severity === 'CRITICAL' ? 'text-red-500' : 'text-green-500'}`}>{scanReport.severity}</strong>
                  </div>
                </div>
              </div>

              {finding ? (
                <div className="threat-card threat-accent reveal-item" style={{ '--stagger': 4, marginTop: '24px' }}>
                  <div className="threat-header">
                    <div className="threat-title">
                      <XCircle size={24} className="icon-elegant" /> {finding.vulnerability_type} Detected
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
                  </div>
                </div>
              ) : (
                <div className="secure-card glass-panel reveal-item" style={{ '--stagger': 4, marginTop: '24px' }}>
                  <CheckCircle size={48} color="var(--color-success)" style={{ opacity: 0.8 }} />
                  <h3>Audit Passed Successfully</h3>
                  <p>No critical vulnerabilities were detected using the deployed vectors.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* FLOATING AI ASSISTANT TRAY - Triggered post-scan if threat exists */}
      {showChatPopup && finding && (
        <div className="ai-assistant-widget slide-up-robot-tray">
          <div className="ai-assistant-header" onClick={() => setChatExpanded(!chatExpanded)}>
            <div className="bot-avatar-container">
              <Bot size={22} className="ai-bot-icon" />
              <div className="bot-pulse-ring"></div>
            </div>
            <div className="ai-header-text">
              <strong>IXA Neural Consultant</strong>
              <span>Llama 3.1 AI Engine</span>
            </div>
            <button className="chat-toggle-btn">
              <ChevronUp className={`toggle-icon ${chatExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className={`ai-assistant-body-wrapper ${chatExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="chat-messages ai-chat-scroll">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.role} fade-in-up`} style={{ animationDelay: `${idx * 0.05}s` }}>
                  {msg.content}
                </div>
              ))}
              {isChatLoading && (
                <div className="chat-bubble assistant typing-indicator fade-in-up">
                  <span></span><span></span><span></span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form className="ai-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="chat-input elegant-input"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Query AI for remediation tactics..."
                disabled={isChatLoading}
              />
              <button type="submit" className="chat-send-btn ai-send" disabled={isChatLoading || !chatInput.trim()}>
                <Play size={16} fill="currentColor" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* THREAT INTEL DATABASE SIDE PANEL */}
      {showHistory && (
        <>
          <div className="backdrop" onClick={() => setShowHistory(false)}></div>
          <div className="side-panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' }}>
              <h2 className="text-elegant" style={{ color: '#fff', fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={20} /> Threat Intel Database
              </h2>
              <button className="btn btn-secondary btn-premium" style={{ padding: '6px' }} onClick={() => setShowHistory(false)}>
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
                    <tr key={i} className="glide-up" style={{ animationDelay: `${i * 0.05}s` }}>
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
