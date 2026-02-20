// Example JavaScript for your React component
const scanUrl = async (urlToScan) => {
  const response = await fetch('http://127.0.0.1:5000/api/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: urlToScan }), // Send the URL to scan
  });
  
  const results = await response.json(); // Get the vulnerability list back
  console.log(results);
  // Now you can display these 'results' in your React app
};