const express = require('express');
const { getToken } = require('./get_token.js');
const { createProxyMiddleware } = require('./api/proxy.js');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/api/token', getToken);
app.use('/v1', createProxyMiddleware());

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
