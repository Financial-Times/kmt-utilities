const errorMessages = {
  '401': [
    'You don\'t have permission to access this page.'
  ],
  '403': [
    'You don\'t have permission to access this page.'
  ],
  '404': [
    'The page you are trying to access does not exist.',
    'This might be because you have entered the web address incorrectly or the page has moved.'
  ],
  '4xx': [
    'The page you are trying to access is unavailable.'
  ],
  '5xx': [
    'The page you are trying to access is temporarily unavailable. Please wait a moment and try again.'
  ]
};

function getErrorMessage (statusCode){
  // Converting to a string so that we access the error messages using a key rather
  // than an index.
  const statusCodeAsString = statusCode.toString();
  const statusCodeType = `${statusCodeAsString[0]}xx`;// e.g. 4xx

  return errorMessages[statusCodeAsString] || errorMessages[statusCodeType];
};

module.exports = getErrorMessage;
