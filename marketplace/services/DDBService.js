"use strict";
const AWS = require('aws-sdk');
const { ENV_VARS } = require("../constants")

AWS.config.update({
  region: ENV_VARS.aws_region
});

module.exports = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region: ENV_VARS.aws_region
});