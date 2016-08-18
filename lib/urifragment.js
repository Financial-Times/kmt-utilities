module.exports = (url) => {
  let pairs = url.split('#')[1].split('&');
  let messages = {};

  pairs.forEach(function (pair) {
    pair = pair.split('=');
    messages[pair[0]] = decodeURIComponent(pair[1] || '');
  });

  let auth = JSON.parse(JSON.stringify(messages));

  if ('access_token' in auth) {
    return auth.access_token;
  } else if ('error' in auth) {
    return auth.error;
  } else {
    // how do we wanna handle this indeed if there is a this
    //throw new Error('oh no something has gon wrong');
  }
}
