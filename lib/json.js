module.exports = {
  parse: function* (response) {
    try {
      return yield response.json();
    }
    catch (e) {
      throw e;
    }
  }
};
