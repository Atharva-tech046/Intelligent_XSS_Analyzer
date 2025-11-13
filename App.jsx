import React, { useState } from 'react';
import './App.css'; // Your new green-and-black CSS file

function App() {
  // --- STATE ---
  // (This part is all correct, no changes needed)
  const [urlToScan, setUrlToScan] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- ACTIONS ---
  // (This function is all correct, no changes needed)
  const handleScan = async () => {
    setIsLoading(true);
    setResults([]);
    setError(null);

    try {
      // This correctly calls your Flask backend
      const response = await fetch('http://127.0.0.1:5000/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToScan }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data); // This is correct for your Flask backend

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI (WHAT YOU SEE) ---
  // (This section is updated to match the new CSS)
  return (
    <div className="App">
      <header className="App-header">
        
        {/* --- THIS IS THE UPDATED PART --- */}
        <h2>IXA</h2> {/* Uses the green accent style */}
        <h1>Intelligent XSS Analyzer</h1> {/* Uses the main white title style */}
        {/* --- END OF UPDATE --- */}

        <p>Enter a URL to scan for Reflected XSS in forms.</p>
        
        <div className="scan-controls">
          <input
            type="text"
            placeholder="http://example.com"
            value={urlToScan}
            onChange={(e) => setUrlToScan(e.target.value)}
          />
          <button onClick={handleScan} disabled={isLoading}>
            {isLoading ? "Scanning..." : "Scan"}
          </button>
        </div>

        {/* --- Display Results --- */}
        <div className="results-container">
          {isLoading && <p>Loading results...</p>}
          
          {error && <p className="error">Error: {error}</p>}
          
          {/* This logic is still correct */}
          {results.length > 0 && (
            <div className="results-list">
              <h2>Scan found {results.length} potential vulnerabilities:</h2>
              {results.map((vuln, index) => (
                <div className="result-item" key={index}>
                  <p><strong>Form Action:</strong> {vuln.form_action || "N/A"}</p>
                  <p><strong>Form Method:</strong> {vuln.form_method}</p>
                  <p><strong>URL:</strong> {vuln.url}</p>
                </div>
              ))}
            </div>
          )}
          
          {!isLoading && !error && results.length === 0 && (
            <p>No results to display. Run a scan!</p>
          )}
        </div>

      </header>
    </div>
  );
}

export default App;