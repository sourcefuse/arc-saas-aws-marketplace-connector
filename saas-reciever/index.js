"use strict";
const AWS = require("aws-sdk");
const { MESSAGE_ACTION, ENV_VARS } = require("./constants");
AWS.config.update({ region: ENV_VARS.region })

const eventBridge = new AWS.EventBridge();

exports.handler = async (event) => {
  event.Records.map(record => {
    try {
      let { body } = record;
      console.log("body", body);
      body = JSON.parse(body);
      const [action, message] = body.Message.split("# ");
      const userDetails = JSON.parse(message);
      console.log(userDetails);
      userDetails.entitlement = typeof userDetails.entitlement == "string" ? JSON.parse(userDetails.entitlement) : userDetails.entitlement;
      switch (action.toLowerCase()) {
        case MESSAGE_ACTION.ENTITLEMENT_UPDATED.toLowerCase():
          const newPlan = userDetails.entitlement.Entitlements[0]["Dimension"];
          console.log("Customer Choose new plan:-", newPlan.split("_")[0]);
          const tenantRegistrationData = {
            "customer": {
              "firstName": userDetails.firstName,
              "lastName": userDetails.lastName,
              "email": userDetails.email,
              "address": userDetails.address,
              "zip": userDetails.zipcode,
              "country": userDetails.country
            },
            "appConfig": {
              "preferredSubdomain": userDetails.preferredSubdomain
            },
            "plan": {
              "identifier": newPlan
            }
          };
          // Event parameters
          const params = {
            Entries: [
              {
                Source: 'com.saas.marketplace',
                DetailType: 'TENANT_REGISTRATION',
                EventBusName: ENV_VARS.EventBusName,
                Time: new Date(),
                Detail: JSON.stringify(tenantRegistrationData)
              }
            ]
          };
          console.log(params);
          break;
        case MESSAGE_ACTION.SUBSCRIBE_SUCCESS.toLowerCase():
          break;
        case MESSAGE_ACTION.UNSUBSCRIBE_SUCCESS.toLowerCase():
          break;
      }
    } catch (e) {
      console.log(e.message);
    }
  });
  return {}
}

// exports.handler(require("./events/sqs_event.json"));