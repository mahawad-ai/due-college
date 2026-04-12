const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4321;
const FILE = path.join(__dirname, 'preview.html');

const server = http.createServer((req, res) => {
  const html = fs.readFileSync(FILE);
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

server.listen(PORT, () => {
  console.log(`Preview running at http://localhost:${PORT}`);
});
