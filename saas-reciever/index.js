"use strict";
const AWS = require("aws-sdk");
const { MESSAGE_ACTION, ENV_VARS } = require("./constants");
const { PLAN_MAPPING } = require("./plan-mapping");
AWS.config.update({ region: ENV_VARS.region });

const eventBridge = new AWS.EventBridge();

exports.handler = async (event) => {
  for (const record of event.Records) {
    console.log("record: ", record);
    try {
      let { body } = record;
      console.log("body: ", body);
      body = JSON.parse(body);

      const [action, message] = body.Message.split("# ");
      const userDetails = JSON.parse(message);
      console.log("userDetails: ", userDetails);

      userDetails.entitlement =
        typeof userDetails.entitlement == "string"
          ? JSON.parse(userDetails.entitlement)
          : userDetails.entitlement;

      switch (action.toLowerCase()) {
        case MESSAGE_ACTION.ENTITLEMENT_UPDATED.toLowerCase():
          break;
        case MESSAGE_ACTION.ENTITLEMENT_CREATED.toLowerCase():
          const selectedPlan =
            userDetails.entitlement.Entitlements[0]["Dimension"];
          const marketplacePlanKey = selectedPlan.split("_")[0];
          console.log("Choosen plan:-", marketplacePlanKey);
          const controlPlanePlanIdentifier = PLAN_MAPPING[marketplacePlanKey];

          if (!controlPlanePlanIdentifier) {
            console.error(
              "Corresponding Plan not found in the mapping object."
            );
            break;
          }
          const tenantRegistrationData = {
            company: {
              name: userDetails.companyName,
            },
            customer: {
              firstName: userDetails.firstName,
              lastName: userDetails.lastName,
              email: userDetails.email,
              address: userDetails.address,
              zip: userDetails.zipcode,
              country: userDetails.country,
            },
            appConfig: {
              preferredSubdomain: userDetails.preferredSubdomain,
            },
            plan: {
              identifier: controlPlanePlanIdentifier,
            },
          };
          console.log("tenantRegistrationData", tenantRegistrationData);
          // Event parameters
          const tenantRegistrationEventParams = {
            Entries: [
              {
                Source: "com.saas.marketplace",
                DetailType: "TENANT_REGISTRATION",
                EventBusName: ENV_VARS.EventBusName,
                Time: new Date(),
                Detail: JSON.stringify(tenantRegistrationData),
              },
            ],
          };
          console.log(
            "tenantRegistrationEventParams",
            tenantRegistrationEventParams
          );
          // send event to event bridge
          const registrationEvent = await eventBridge
            .putEvents({
              Entries: tenantRegistrationEventParams.Entries,
            })
            .promise()
            .catch((err) => {
              console.log(
                "Error in sending registration event to event bridge",
                err
              );
            });

          console.log("registrationEvent sent", registrationEvent);
          break;
        case MESSAGE_ACTION.UNSUBSCRIBE_SUCCESS.toLowerCase():
          break;
      }
    } catch (e) {
      console.log(
        "Something went wrong while processing the record:",
        e.message
      );
    }
  }
};

// exports.handler(require("./events/sqs_event.json"));
