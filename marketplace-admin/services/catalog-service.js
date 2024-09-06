"use strict";
const AWS = require('aws-sdk');
const { AWS_MP } = require("../constants");
const { mp_region: region } = AWS_MP;
AWS.config.update({ region });

module.exports = () => {
  return new AWS.MarketplaceCatalog()
}