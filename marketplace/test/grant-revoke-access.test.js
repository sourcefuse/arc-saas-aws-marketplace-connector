"use strict";
const sinon = require("sinon");
const SNS = require("../services/SNSService");
const { handler } = require("../grant-revoke-access-to-product");
const { expect } = require("chai");
const { SUBJECTS, MESSAGE_ACTION } = require("../constants");

let sandbox;
beforeEach(() => {
  sandbox = sinon.createSandbox();
});

afterEach(() => {
  sandbox.restore();
});

it('1. Testing for First Entitlement without user details', async () => {
  const params = require("../events/first_time.json");
  await handler(params, { awsRequestId: "" });
});

it('2. Testing for First Entitlement without user details', async () => {
  const params = require("../events/user_registration.json");
  sandbox.stub(SNS, 'publish').callsFake(p => {
    const [message] = p.Message.split("# ");
    expect(p.TopicArn).is.eq(process.env.SupportSNSARN);
    expect(p.Subject).is.eq(SUBJECTS.ONBOARDED);
    expect(message).is.eq(MESSAGE_ACTION.ENTITLEMENT_CREATED);
    return {
      promise: () => {
        return Promise.resolve({});
      }
    }
  });
  await handler(params, { awsRequestId: "" });
});

it('3. Testing for Plan Change', async () => {
  const params = require("../events/entitlement_updated.json");
  sandbox.stub(SNS, 'publish').callsFake(p => {
    const [message] = p.Message.split("# ");
    expect(p.TopicArn).is.eq(process.env.SupportSNSARN);
    expect(p.Subject).is.eq(SUBJECTS.ENTITLEMENT_UPDATED);
    expect(message).is.eq(MESSAGE_ACTION.ENTITLEMENT_UPDATED);
    return {
      promise: () => {
        return Promise.resolve({});
      }
    }
  });
  await handler(params, { awsRequestId: "" });
});

it('4. Testing for Unsubscribe Success', async () => {
  const params = require("../events/subscription_expired.json");
  sandbox.stub(SNS, 'publish').callsFake(p => {
    const [message] = p.Message.split("# ");
    expect(p.TopicArn).is.eq(process.env.SupportSNSARN);
    expect(p.Subject).is.eq(SUBJECTS.REVOKE_ACCESS);
    expect(message).is.eq(MESSAGE_ACTION.UNSUBSCRIBE_SUCCESS);
    return {
      promise: () => {
        return Promise.resolve({});
      }
    }
  });
  await handler(params, { awsRequestId: "" });
});

// let sinonSandbox

// before(() => {
//   sinonSandbox = sinon.createSandbox()
//   sinonSandbox.stub(CatalogService, 'describeChangeSet').returns({
//     promise: () => {
//       return {
//         "ChangeSetId": "d2o4irmrxddiud4gy2ydqk9ew",
//         "ChangeSetArn": "arn:aws:aws-marketplace:us-east-1:945019477776:AWSMarketplace/ChangeSet/d9v6eyqqfesxowxqrmst50hpg",
//         "ChangeSetName": "Submitted by 945019477776",
//         "Intent": "APPLY",
//         "StartTime": "2024-09-17T10:06:34Z",
//         "EndTime": null,
//         "Status": "APPLYING",
//         "FailureCode": null,
//         "FailureDescription": null,
//         "ChangeSet": [
//             {
//                 "ChangeType": "UpdateRenewalTerms",
//                 "Entity": {
//                     "Type": "Offer@1.0",
//                     "Identifier": "offer-qwnlovw5orhek"
//                 },
//                 "Details": "{\"Terms\":[{\"Type\":\"RenewalTerm\"}]}",
//                 "DetailsDocument": {
//                     "Terms": [
//                         {
//                             "Type": "RenewalTerm"
//                         }
//                     ]
//                 },
//                 "ErrorDetailList": [],
//                 "ChangeName": null
//             }
//         ]
//     };
//     }
//   });
// });
// after(() => {
//   sinonSandbox.restore();
// });



