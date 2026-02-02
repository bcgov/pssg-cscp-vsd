const PROXY_CONFIG = [
  {
    context: ['/api'],
    target: 'http://localhost:5000',
    secure: false,
    logLevel: 'error'
  }
];

module.exports = PROXY_CONFIG;
