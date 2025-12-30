const express = require('express');
const { setupRoutes } = require('./routes.js');
const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' }));

setupRoutes(app);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
