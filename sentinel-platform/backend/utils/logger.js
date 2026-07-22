const levels = { info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m', success: '\x1b[32m' };
const reset = '\x1b[0m';

const logger = {
  info: (msg) => console.log(`${levels.info}[INFO]${reset} ${msg}`),
  warn: (msg) => console.log(`${levels.warn}[WARN]${reset} ${msg}`),
  error: (msg) => console.log(`${levels.error}[ERROR]${reset} ${msg}`),
  success: (msg) => console.log(`${levels.success}[SUCCESS]${reset} ${msg}`),
};

module.exports = logger;
