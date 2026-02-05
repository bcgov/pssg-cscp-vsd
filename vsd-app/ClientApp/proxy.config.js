const PROXY_CONFIG = [
  {
    context: ['/api', '/cvapwebform/api'],
    target: 'http://localhost:5000',
    secure: false,
    logLevel: 'error',
    pathRewrite: {
      '^/cvapwebform': ''
    }
  }
];

module.exports = PROXY_CONFIG;
