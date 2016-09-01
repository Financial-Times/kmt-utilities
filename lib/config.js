module.exports = {
  config: {
    NODE_ENV: process.env.NODE_ENV,
    LOG_DIR: process.env.LOG_DIR || './logs',
    SYSTEM_CODE: process.env.SYSTEM_CODE,
    KMT_SECRET: process.env.KMT_SECRET,
    DOMAIN: process.env.DOMAIN,
    BASE_PATH_URL: process.env.BASE_PATH_URL,
    API_GATEWAYKEY:  process.env.API_GATEWAYKEY,
    API_GATEWAY_HOST: process.env.API_GATEWAY_HOST,
    MEMCOM_APIKEY:process.env.MEMCOM_APIKEY,
    API_AUTH_CLIENT_ID:process.env.API_AUTH_CLIENT_ID,
    LOGIN_URL: process.env.LOGIN_URL,
    LOGOUT_URL: process.env.LOGOUT_URL,
    LICENCE_DATA_SVC_HOST:process.env.LICENCE_DATA_SVC_HOST,
    ACC_LICENCE_SVC_HOST:process.env.ACC_LICENCE_SVC_HOST,
    ACQ_CTX_SVC_HOST:process.env.ACQ_CTX_SVC_HOST,
  },

  initialise: function (config) {
    if (Object.keys(this.config).length === 0) {
      this.config = config;
    }
  },

  set: function(name, value) {
    this.config[name] = value;
  },

  get: function(name) {
    if (this.config[name] !== undefined) {
      return this.config[name];
    }

    return undefined;
  }
}
