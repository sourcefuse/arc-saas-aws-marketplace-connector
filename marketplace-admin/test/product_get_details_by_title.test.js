"use strict";

const sinon = require("sinon");
const { expect } = require('chai');
const { handler } = require("../admin");
const { checkHeaders } = require("./utils");
const CatalogService = require("../services/catalog-service");
const { ENTITY_TYPE } = require("../constants");
let sinonSandbox
describe('Testing the Admin lambda for Product', () => {
  before(() => {
    sinonSandbox = sinon.createSandbox()
    sinonSandbox.stub(CatalogService, 'listEntities').returns({
      promise: () => {
        return {
          EntitySummaryList: [{
            Name: 'Product for ARC SAAS',
            EntityType: ENTITY_TYPE.PRODUCT,
            EntityId: 'prod-lp5dq7gziiuyi',
            EntityArn: 'arn:aws:aws-marketplace:us-east-1:XXXX:AWSMarketplace/SaaSProduct/prod-lp5dq7gziiuyi',
            LastModifiedDate: '2024-09-07T12:01:54Z',
            Visibility: 'Draft',
            SaaSProductSummary: { ProductTitle: 'ARC SAAS', Visibility: 'Draft' }
          }]
        };
      }
    });
  });
  after(() => {
    sinonSandbox.restore();
  });

  it('1. Testing Get Product Details by Title', async () => {
    const params = require("../events/get_product_details_by_title.json");
    const response = await handler({
      body: JSON.stringify(params)
    });
    expect(response.statusCode).to.equal(200);
    checkHeaders(response.headers);
    const body = JSON.parse(response.body);
    expect(body.EntityType).is.eq(ENTITY_TYPE.PRODUCT);
  });
});