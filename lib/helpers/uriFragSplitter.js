//Takes a url fragment as per the response from https://developer.ft.com/docs/membership_platform_api/api_authz_svc/ and returns a object
module.exports = (url) => {

  if (!url) {
    return;
  }

  const pairs = url.split('#')[1].split('&');
  const messages = {};

  pairs.forEach(function (pair) {
    pair = pair.split('=');
    messages[pair[0]] = decodeURIComponent(pair[1] || '');
  });

  const authObj = JSON.parse(JSON.stringify(messages));

  return authObj;
};
