"use strict";
const sinon = require("sinon");
const { EntitlementService, DDBService } = require("../services");
const { handler } = require("../entitlement-sqs");
const { expect } = require("chai");

let sandbox;
describe("Start Testing SQS Entitlement", () => {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("1. Testing for Entitlemnt SQS Message for Entitlement Updated Expired", async () => {
    sandbox.stub(EntitlementService, 'getEntitlements').returns({
      promise: () => {
        return {
          Entitlements: [
            { ExpirationDate: "2023-01-01T00:00:00Z" }
          ]
        };
      },
    });

    sandbox.stub(DDBService, 'updateItem').callsFake(p => {
      expect(p.ExpressionAttributeValues[":se"]["BOOL"]).is.eq(true);
      return {
        promise: () => { }
      }
    });

    const param = require("../events/entitelment_updated_sqs.json");
    await handler(param);
  });

  it("2. Testing for Entitlemnt SQS Message for Entitlement Updated Plan Updated", async () => {
    sandbox.stub(EntitlementService, 'getEntitlements').returns({
      promise: () => {
        return {
          Entitlements: [
            { ExpirationDate: new Date() }
          ]
        };
      },
    });

    sandbox.stub(DDBService, 'updateItem').callsFake(p => {
      expect(p.ExpressionAttributeValues[":se"]["BOOL"]).is.eq(false);
      expect(p.ExpressionAttributeValues[":ss"]["BOOL"]).is.eq(true);
      return {
        promise: () => { }
      }
    });

    const param = require("../events/entitelment_updated_sqs.json");
    await handler(param);
  });
});