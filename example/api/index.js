const express = require('express');
const { getToken } = require('./get_token.js');
const { convertCurrency } = require('./convert_currency.js');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/api/token', getToken);
app.post('/api/convert-currency', convertCurrency);
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
