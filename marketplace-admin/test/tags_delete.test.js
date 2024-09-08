"use strict";

const sinon = require("sinon");
const { expect } = require('chai');
const { handler } = require("../admin");
const { checkHeaders } = require("./utils");
const CatalogService = require("../services/catalog-service");

let sinonSandbox
describe('Testing the Admin lambda for Tags', () => {
  before(() => {
    sinonSandbox = sinon.createSandbox()
    sinonSandbox.stub(CatalogService, 'untagResource').returns({
      promise: () => {
        return { succss: true }
      }
    });
  });
  after(() => {
    sinonSandbox.restore();
  });

  it('1. Testing Delete Tags', async () => {
    const params = require("../events/delete_tags.json");
    const response = await handler({
      body: JSON.stringify(params)
    });
    expect(response.statusCode).to.equal(200);
    checkHeaders(response.headers);
    expect(JSON.parse(response.body).succss).is.equal(true);
  });
});