"use strict";

const { MESSAGE_ACTION } = require("./constants");
const { logger } = require("./utils");
const {
  DDBService: dynamodb,
  EntitlementService: marketplaceEntitlementService
} = require("./services");

exports.handler = async (event) => {
  await Promise.all(event.Records.map(async (record) => {
    logger.info("Record", { record });
    let { body } = record;
    body = JSON.parse(body);
    let message = body.Message || body;

    if (typeof message === 'string' || message instanceof String) {
      message = JSON.parse(message);
    }

    logger.info("Action", { value: message.action });
    if (message.action.toLowerCase() === MESSAGE_ACTION.ENTITLEMENT_UPDATED.toLowerCase()) {
      const entitlementParams = {
        ProductCode: message['product-code'],
        Filter: {
          CUSTOMER_IDENTIFIER: [message['customer-identifier']],
        },
      };
      logger.info("Entitlement Params", { entitlementParams });
      const entitlementsResponse = await marketplaceEntitlementService.getEntitlements(entitlementParams).promise();
      logger.info("Entitlement Response", { entitlementsResponse });
      
      const isExpired = entitlementsResponse.hasOwnProperty("Entitlements") === false || entitlementsResponse.Entitlements.length === 0 ||
        new Date(entitlementsResponse.Entitlements[0].ExpirationDate) < new Date();
      
      const dynamoDbParams = {
        TableName: process.env.userTable,
        Key: {
          customerIdentifier: { S: message['customer-identifier'] },
          productCode: { S: message['product-code'] }
        },
        UpdateExpression: 'set entitlement = :e, successfully_subscribed = :ss, subscription_expired = :se',
        ExpressionAttributeValues: {
          ':e': { S: JSON.stringify(entitlementsResponse) },
          ':ss': { BOOL: true },
          ':se': { BOOL: isExpired },
        },
        ReturnValues: 'UPDATED_NEW',
      };
      logger.info("DDB Params", { dynamoDbParams });
      await dynamodb.updateItem(dynamoDbParams).promise();
    } else {
      console.error('Unhandled action');
      throw new Error(`Unhandled action - msg: ${JSON.stringify(record)}`);
    }
  }));
  return {};
};
