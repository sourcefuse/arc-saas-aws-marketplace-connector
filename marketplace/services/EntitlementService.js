"use strict";
const AWS = require('aws-sdk');
const { ENV_VARS, AWS_MP } = require("../constants");

AWS.config.update({
  region: ENV_VARS.aws_region
});

module.exports = new AWS.MarketplaceEntitlementService({
  apiVersion: '2017-01-11',
  region: AWS_MP.mp_region
});