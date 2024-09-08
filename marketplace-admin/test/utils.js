const { expect } = require('chai');
module.exports.checkHeaders = headers => {
  expect(headers['Access-Control-Allow-Origin']).to.equal('*');
  expect(headers['Access-Control-Allow-Credentials']).to.equal(true);
}