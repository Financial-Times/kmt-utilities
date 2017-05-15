const envVars = process.env;
module.exports = {
  NODE_ENV: envVars.NODE_ENV,
  KMT_SECRET: envVars.KMT_SECRET,
  KAT_ERROR_PATH: envVars.KAT_ERROR_PATH || '/error',
  IGNORE_AUTH_TOKEN: envVars.IGNORE_AUTH_TOKEN || false,
  HOST: envVars.HOST,
  LOGIN_URL: envVars.LOGIN_URL,
  BASE_PATH_URL: envVars.BASE_PATH_URL
};
