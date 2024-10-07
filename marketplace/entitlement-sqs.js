"use strict";

const { MESSAGE_ACTION, ENV_VARS } = require("./constants");
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
        TableName: ENV_VARS.TABLE_USER,
        Key: {
          customerIdentifier: { S: message['customer-identifier'] },
          productCode: { S: message['product-code'] }
        },
        ReturnValues: 'UPDATED_NEW',
      };

      if (isExpired) {
        dynamoDbParams["UpdateExpression"] = 'set subscription_expired = :se';
        dynamoDbParams["ExpressionAttributeValues"] = {
          ':se': { BOOL: isExpired },
        };
      } else {
        dynamoDbParams["UpdateExpression"] = 'set entitlement = :e, subscription_expired = :se';
        dynamoDbParams["ExpressionAttributeValues"] = {
          ':e': { S: JSON.stringify(entitlementsResponse) },
          ':se': { BOOL: isExpired },
        };
      }

      logger.info("DDB Params", { dynamoDbParams });
      console.log(dynamoDbParams);
      await dynamodb.updateItem(dynamoDbParams).promise();
    } else {
      console.error('Unhandled action');
      throw new Error(`Unhandled action - msg: ${JSON.stringify(record)}`);
    }
  }));
  return {};
};