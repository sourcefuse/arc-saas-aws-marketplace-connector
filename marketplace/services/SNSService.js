"use strict";
const AWS = require('aws-sdk');
const { ENV_VARS } = require("../constants")

AWS.config.update({
  region: ENV_VARS.aws_region
});

module.exports = new AWS.SNS({ apiVersion: '2010-03-31' });