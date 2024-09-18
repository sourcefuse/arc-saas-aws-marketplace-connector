"use strict";
const AWS = require('aws-sdk');
const { ENV_VARS } = require("../constants")

AWS.config.update({
  region: ENV_VARS.aws_region
});

module.exports = new AWS.MarketplaceMetering({
  apiVersion: '2016-01-14',
  region: ENV_VARS.aws_region
});