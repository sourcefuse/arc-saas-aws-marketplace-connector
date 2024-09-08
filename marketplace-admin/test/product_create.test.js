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
            Name: 'ARC SAAS',
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

  it('1. Testing Create Product', async () => {
    const params = require("../events/create_product.json");
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