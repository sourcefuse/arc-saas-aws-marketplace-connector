"use strict";
const AWS = require('aws-sdk');
const { EMAIL_SUBJECTS, EMAIL_TEMPLATE, ENV_VARS } = require("./constants");
const { aws_region } = ENV_VARS;
const { SendEmail, SendResponse } = require("./utils");

const marketplacemetering = new AWS.MarketplaceMetering({ apiVersion: '2016-01-14', region: aws_region });
const marketplaceEntitlementService = new AWS.MarketplaceEntitlementService({});
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10', region: aws_region });

exports.handler = async (event) => {
  console.log(event.body);
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
      const resolveCustomerResponse = await marketplacemetering
        .resolveCustomer(resolveCustomerParams)
        .promise();

      const { CustomerIdentifier, ProductCode, CustomerAWSAccountId } = resolveCustomerResponse;
      const entitlementResponse = await marketplaceEntitlementService
        .getEntitlements({
          ProductCode,
          Filter: {
            CUSTOMER_IDENTIFIER: [CustomerIdentifier],
          },
        }).promise();

      const datetime = new Date().getTime().toString();
      const dynamoDbParams = {
        TableName: process.env.userTable,
        Item: {
          companyName: { S: companyName },
          firstName: { S: firstName },
          lastName: { S: lastName },
          contactPhone: { S: contactPhone },
          email: { S: contactEmail },
          country: { S: country },
          zipcode: { S: zipcode },
          address: { S: address },
          preferredSubdomain: { S: preferredSubdomain },
          customerIdentifier: { S: CustomerIdentifier },
          productCode: { S: ProductCode },
          customerAWSAccountID: { S: CustomerAWSAccountId },
          created: { S: datetime },
          entitlement: { S: JSON.stringify(entitlementResponse) }
        },
      };
      await dynamodb.putItem(dynamoDbParams).promise();
      let body = EMAIL_TEMPLATE.CUSTOMER_ONBOARD;
      body = body.split("##contactPerson##").join(firstName + " " + lastName);
      const subject = EMAIL_SUBJECTS.CUSTOMER_ONBOARD;
      await SendEmail(contactEmail, subject, body);
    }
    catch (error) {
      console.error(error);
    }
  }
  return SendResponse(event.body);
};