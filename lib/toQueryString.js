module.exports = {
      toQueryString : function(obj) {
      let params = [];
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          params.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
        }
      }
      return '?' + params.join('&');
    }
};
