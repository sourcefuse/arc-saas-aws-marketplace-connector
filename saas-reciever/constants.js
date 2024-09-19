module.exports.MESSAGE_ACTION = {
  ENTITLEMENT_UPDATED: "entitlement-updated",
  ENTITLEMENT_CREATED: "entitlement-created",
  SUBSCRIBE_SUCCESS: "subscribe-success",
  UNSUBSCRIBE_SUCCESS: "unsubscribe-success",
};

module.exports.ENV_VARS = {
  region: process.env.region || "us-east-1",
  LOG_LEVEL: process.env.LOG_LEVEL || "debug",
  EventBusName: process.env.eventBusName || null,
};
