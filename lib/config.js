module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  KMT_SECRET: process.env.KMT_SECRET,
  KAT_ERROR_PATH: process.env.KAT_ERROR_PATH || '/error',
  IGNORE_AUTH_TOKEN: process.env.IGNORE_AUTH_TOKEN || false,
  HOST: process.env.HOST,
  LOGIN_URL: process.env.LOGIN_URL,
  BASE_PATH_URL: process.env.BASE_PATH_URL
};
