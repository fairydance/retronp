const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    ['/api', '/download'], 
    createProxyMiddleware({
      target: 'http://162.105.160.44:5000',
      changeOrigin: true,
    })
  );
}