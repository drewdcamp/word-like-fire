const { createProxyMiddleware } = require('http-proxy-middleware');
const proxy = {
    target: 'https://audio.esv.org',
    changeOrigin: true
}
module.exports = function(app) {
  app.use(
    '/david-cochran-heath',
    createProxyMiddleware(proxy)
  );
};