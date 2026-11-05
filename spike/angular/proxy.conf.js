const target = `http://localhost:${process.env.EXAMPLE_PORT ?? 3001}`;

module.exports = {
  '/v1': { target, changeOrigin: true },
  '/v2': { target, changeOrigin: true },
};
