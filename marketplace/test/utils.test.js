const { expect } = require('chai');
module.exports.checkHeaders = headers => {
  expect(headers['Access-Control-Allow-Origin']).to.equal(process.env.webpageDomain);
  expect(headers['Access-Control-Allow-Credentials']).to.equal(true);
}