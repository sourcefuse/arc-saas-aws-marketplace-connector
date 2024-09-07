"use strict";
const AWS = require('aws-sdk');
const { EMAIL_SUBJECTS, EMAIL_TEMPLATE, ENV_VARS } = require("./constants");
const { aws_region } = ENV_VARS;
const { SendEmail, SendResponse, logger } = require("./utils");

const marketplacemetering = new AWS.MarketplaceMetering({ apiVersion: '2016-01-14', region: aws_region });
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10', region: aws_region });

exports.handler = async (event) => {
  logger.info("Event body", { body: event.body });
  const {
    // Accept form inputs from ../web/index.html
    regToken,
    companyName,
    contactPhone,
    contactEmail,
    firstName,
    lastName,
    country,
    zipcode,
    preferredSubdomain,
    address
  } = JSON.parse(event.body);

  if (regToken && companyName && firstName && contactPhone && contactEmail && lastName && country && zipcode && preferredSubdomain) {
    try {
      // Call resolveCustomer to validate the subscriber
      const resolveCustomerParams = {
        RegistrationToken: regToken,
      };
      logger.debug("Params for Resolve Customer", { resolveCustomerParams });
      const resolveCustomerResponse = await marketplacemetering
        .resolveCustomer(resolveCustomerParams)
        .promise();

      const { CustomerIdentifier, ProductCode, CustomerAWSAccountId } = resolveCustomerResponse;
      const datetime = new Date().getTime().toString();
      const dynamoDbParams = {
        TableName: process.env.userTable,
        Key: {
          customerIdentifier: { S: CustomerIdentifier },
          productCode:{S: ProductCode}
        },
        UpdateExpression: 'set companyName = :s1, firstName = :s2, lastName = :s3,'+
        'contactPhone = :s4, email = :s5, country = :s6, zipcode = :s7, address = :s8, preferredSubdomain = :s9,'+
        'customerAWSAccountID = :s10, created = :s11',
        ExpressionAttributeValues: {
          ':s1': { S:  companyName},
          ':s2': { S:  firstName},
          ':s3': { S:  lastName},
          ':s4': { S:  contactPhone},
          ':s5': { S:  contactEmail},
          ':s6': { S:  country},
          ':s7': { S:  zipcode},
          ':s8': { S:  address},
          ':s9': { S:  preferredSubdomain},
          ':s10': { S:  CustomerAWSAccountId},
          ':s11': { S:  datetime},
        },
        ReturnValues: 'UPDATED_NEW',
      };
      logger.debug("DynamoDB params", { dynamoDbParams });
      await dynamodb.updateItem(dynamoDbParams).promise();
      
      // Sending mail to Registered USER.
      let body = EMAIL_TEMPLATE.CUSTOMER_ONBOARD;
      const subject = EMAIL_SUBJECTS.CUSTOMER_ONBOARD;

      body = body.split("##contactPerson##").join(firstName + " " + lastName);
      await SendEmail(contactEmail, subject, body);
    }
    catch (error) {
      logger.error("Error", {error});
    }
  }
  return SendResponse(event.body);
};