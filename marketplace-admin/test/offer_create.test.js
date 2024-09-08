"use strict";

const sinon = require("sinon");
const { expect } = require('chai');
const { handler } = require("../admin");
const { checkHeaders } = require("./utils");
const CatalogService = require("../services/catalog-service");

let sinonSandbox
describe('Testing the Admin lambda for Offers', () => {
  before(() => {
    sinonSandbox = sinon.createSandbox()
    sinonSandbox.stub(CatalogService, 'startChangeSet').returns({
      promise: () => {
        return {
          ChangeSetId: '209fmmcipe9e37e0klvrbc77n',
          ChangeSetArn: 'arn:aws:aws-marketplace:us-east-1:XXXXXX:AWSMarketplace/ChangeSet/209fmmcipe9e37e0klvrbc77n'
        };
      }
    });
  });
  after(() => {
    sinonSandbox.restore();
  });

  it('1. Testing Add Tags', async () => {
    const params = require("../events/create_offer.json");
    const response = await handler({
      body: JSON.stringify(params)
    });
    expect(response.statusCode).to.equal(200);
    checkHeaders(response.headers);
    const body = JSON.parse(response.body);
    expect(typeof body.ChangeSetId).is.eq("string");
    expect(typeof body.ChangeSetArn).is.eq("string");
  });
});