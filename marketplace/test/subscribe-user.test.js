"use strict";
const sinon = require("sinon");
const { expect } = require("chai");
const { handler } = require("../subscribe-user");
const { checkHeaders } = require("./utils.test");
const { DDBService, MeteringService } = require("../services");

let sandbox;
describe("Start Test Subscribe User API", () => {

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(DDBService, 'updateItem').callsFake(() => {
      return {
        promise: () => {
          return {}
        }
      }
    });
    sandbox.stub(MeteringService, 'resolveCustomer').callsFake(() => {
      return {
        promise: () => {
          return {
            CustomerIdentifier: "test-customer",
            ProductCode: "test-product",
            CustomerAWSAccountId: "test-account"
          };
        }
      }
    });
  });

  afterEach(() => {
    sandbox.restore();
  })

  it("1. Testing for Blank Body", async () => {
    const response = await handler(null);
    expect(response.statusCode).to.equal(200);
    checkHeaders(response.headers);
    const body = JSON.parse(response.body);
    expect(Object.keys(body).length).is.eq(0);
  });

  it("2. Testing for params with details", async () => {
    const params = require("../events/subscribe_user.json");
    const response = await handler({
      body: JSON.stringify(params)
    });
    expect(response.statusCode).to.equal(200);
    checkHeaders(response.headers);
    const body = JSON.parse(response.body);
    expect(Object.keys(body).length).is.eq(Object.keys(params).length);
  })
});