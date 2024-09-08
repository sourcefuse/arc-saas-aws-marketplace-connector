"use strict";

const sinon = require("sinon");
const { expect } = require('chai');
const { handler } = require("../admin");
const { checkHeaders } = require("./utils");
const CatalogService = require("../services/catalog-service");
const { ENTITY_TYPE } = require("../constants");
let sinonSandbox
describe('Testing the Admin lambda for Offers', () => {
  before(() => {
    sinonSandbox = sinon.createSandbox()
    sinonSandbox.stub(CatalogService, 'describeEntity').returns({
      promise: () => {
        return {
          EntityType: ENTITY_TYPE.OFFER,
          EntityIdentifier: 'offer-25tc6r6c6tc64@29',
          EntityArn: 'arn:aws:aws-marketplace:us-east-1:XXXXXXX:AWSMarketplace/Offer/offer-25tc6r6c6tc64',
          LastModifiedDate: '2024-08-30T17:18:09Z',
          Details: '',
          DetailsDocument: {}
        };
      }
    });
    sinonSandbox.stub(CatalogService, 'listEntities').returns({
      promise: () => {
        return {
          EntitySummaryList: [{
            "EntityId": "test-offer"
          }]
        }
      }
    });
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

  it('1. Testing Update Offer Add Pricing by id', async () => {
    const params = require("../events/add_new_pricing_dimension.json");
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