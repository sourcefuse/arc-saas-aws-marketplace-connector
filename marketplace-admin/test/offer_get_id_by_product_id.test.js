"use strict";

const sinon = require("sinon");
const { expect } = require('chai');
const { handler } = require("../admin");
const { checkHeaders } = require("./utils");
const CatalogService = require("../services/catalog-service");

let sinonSandbox
describe('Testing the Admin lambda for Offer', () => {
  before(() => {
    sinonSandbox = sinon.createSandbox()
    sinonSandbox.stub(CatalogService, 'listEntities').returns({
      promise: () => {
        return {
          EntitySummaryList: [{
            "EntityId": "test-offer"
          }]
        }
      }
    });
  });
  after(() => {
    sinonSandbox.restore();
  });
  it('1. Testing Get Offer ID by Product ID', async () => {
    const params = require("../events/get_offer_id_by_product_id.json");
    const response = await handler({
      body: JSON.stringify(params)
    });
    expect(response.statusCode).to.equal(200);
    checkHeaders(response.headers);
    expect(response.body.indexOf("Offer")).is.equal(-1);
  });
});