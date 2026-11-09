const target = `http://localhost:${process.env.API_PORT ?? 3002}`;

module.exports = {
  '/v1': { target, changeOrigin: true },
  '/v2': { target, changeOrigin: true },
};
