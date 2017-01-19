'use strict';

var imsCore = require("./ImsCore.js");
var config  = require("./ConfigDefaults.js");
imsCore.configure(config.defaults.ims);

module.exports.session_start = (event, context, callback) => {
  var args = JSON.parse(event.body)

  const response = {
    statusCode: 200,
    body: JSON.stringify(imsCore.session_start(args))
  };

  callback(null, response);
};

module.exports.session_end = (event, context, callback) => {
  var args = { "jwt" : JSON.parse(event.body).jwt }

  const response = {
    statusCode: 200,
    body: JSON.stringify(imsCore.session_end(args))
  };

  callback(null, response);
};

module.exports.session_decode = (event, context, callback) => {
  var args = { "jwtToDecode" : event.queryStringParameters.jwt }

  const response = {
    statusCode: 200,
    body: JSON.stringify(imsCore.decodeJwt(args))
  };

  callback(null, response);
};

// = = = = = = = = = = = = = = = = =
module.exports.debug = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
    }),
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
