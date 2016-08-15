module.exports = {
  config: {
    NODE_ENV: process.env.NODE_ENV,
    LOG_DIR: process.env.LOG_DIR || './logs',
    SYSTEM_CODE: process.env.SYSTEM_CODE,
    API_GATEWAYKEY:  process.env.API_GATEWAYKEY,
    SESSION_API_HOST: process.env.SESSION_API_HOST,
    LICENCE_DATA_SVC_HOST:process.env.LICENCE_DATA_SVC_HOST,
    MEMCOM_APIKEY:process.env.MEMCOM_APIKEY
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
