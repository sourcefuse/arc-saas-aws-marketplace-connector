"use strict";

const sinon = require("sinon");
const { expect } = require('chai');
const { handler } = require("../admin");
const { checkHeaders } = require("./utils");
const CatalogService = require("../services/catalog-service");

let sinonSandbox
describe('Testing the Admin lambda for Describe Changeset', () => {
  before(() => {
    sinonSandbox = sinon.createSandbox()
    sinonSandbox.stub(CatalogService, 'describeChangeSet').returns({
      promise: () => {
        return {
          "ChangeSetId": "d2o4irmrxddiud4gy2ydqk9ew",
          "ChangeSetArn": "arn:aws:aws-marketplace:us-east-1:945019477776:AWSMarketplace/ChangeSet/d9v6eyqqfesxowxqrmst50hpg",
          "ChangeSetName": "Submitted by 945019477776",
          "Intent": "APPLY",
          "StartTime": "2024-09-17T10:06:34Z",
          "EndTime": null,
          "Status": "APPLYING",
          "FailureCode": null,
          "FailureDescription": null,
          "ChangeSet": [
              {
                  "ChangeType": "UpdateRenewalTerms",
                  "Entity": {
                      "Type": "Offer@1.0",
                      "Identifier": "offer-qwnlovw5orhek"
                  },
                  "Details": "{\"Terms\":[{\"Type\":\"RenewalTerm\"}]}",
                  "DetailsDocument": {
                      "Terms": [
                          {
                              "Type": "RenewalTerm"
                          }
                      ]
                  },
                  "ErrorDetailList": [],
                  "ChangeName": null
              }
          ]
      };
      }
    });
  });
  after(() => {
    sinonSandbox.restore();
  });

  it('1. Testing Changeset status', async () => {
    const params = require("../events/get_changeset_details.json");
    const response = await handler({
      body: JSON.stringify(params)
    });
    expect(response.statusCode).to.equal(200);
    checkHeaders(response.headers);
    const body = JSON.parse(response.body);
    expect(params.data.changeSetId).is.equal(body.ChangeSetId);
  });
});