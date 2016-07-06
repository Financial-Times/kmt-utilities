module.exports = {
  config: {},

  initialise: function(config) {
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
