"use strict";
const winston = require('winston');
const { LOG_LEVEL } = require("./constants").ENV_VARS;

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports.SendResponse = body => {
  return {
    statusCode: 200,
    body,
    headers: {
      'Access-Control-Allow-Origin': "*",
      'Access-Control-Allow-Credentials': true,
    }
  };
}


module.exports.logger = logger;