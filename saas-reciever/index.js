"use strict";
const { MESSAGE_ACTION } = require("./constants");

exports.handler = async (event) => {
  event.Records.map(record => {
    try {
      let { body } = record;
      body = JSON.parse(body);
      const [action, message] = body.Message.split("# ");
      const userDetails = JSON.parse(message);
      console.log(userDetails);
      userDetails.entitlement = typeof userDetails.entitlement == "string" ? JSON.parse(userDetails.entitlement): userDetails.entitlement;
      switch (action.toLowerCase()) {
        case MESSAGE_ACTION.ENTITLEMENT_UPDATED.toLowerCase():
          const newPlan = userDetails.entitlement.Entitlements[0]["Dimension"];
          console.log("Customer Choose new plan:-", newPlan);
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