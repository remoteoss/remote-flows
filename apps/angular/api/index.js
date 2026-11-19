const express = require('express');
const { setupRoutes } = require('./routes.js');

const app = express();

app.use(express.json({ limit: '50mb' }));

setupRoutes(app);

module.exports = app;
