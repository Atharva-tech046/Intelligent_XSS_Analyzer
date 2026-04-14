module.exports = (req, res) => {
  const query = req.query;
  const lines = Object.keys(query).map(key => `${key}=${query[key]}`);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<html><body><h1>Echo</h1><pre>${lines.join('\n')}</pre></body></html>`);
};