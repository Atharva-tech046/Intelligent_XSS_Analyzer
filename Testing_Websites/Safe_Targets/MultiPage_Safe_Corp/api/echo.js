function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = (req, res) => {
  const query = req.query;
  const rows = Object.keys(query).map(key => {
    const safeKey = escapeHtml(key);
    const safeValue = escapeHtml(query[key]);
    return `<tr><td>${safeKey}</td><td>${safeValue}</td></tr>`;
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Safe Echo</title></head><body><h1>Safe Echo</h1><table border="1" cellpadding="8"><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody>${rows.join('')}</tbody></table></body></html>`);
};