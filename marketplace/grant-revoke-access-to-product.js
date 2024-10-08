"use strict";

const AWS = require('aws-sdk');
const { ENV_VARS: ENV, MESSAGE_ACTION, SUBJECTS } = require("./constants");
const { SupportSNSArn: TopicArn, } = ENV;
const { logger } = require("./utils");

const SNS = require("./services/SNSService");
exports.handler = async (event, context) => {
    await Promise.all(event.Records.map(async (record) => {
        logger.defaultMeta = { requestId: context.awsRequestId };
        logger.debug('event', { 'data': event });
        logger.debug('context', { 'data': context });
        const oldImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage);
        const newImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);

        logger.debug('OldImage', { 'data': oldImage });
        logger.debug('NewImage', { 'data': newImage });
        /*
          successfully_subscribed is set true:
            - for SaaS Contracts: no email is sent but after receiving the message in the subscription topic
            - for SaaS Subscriptions: after reciving the subscribe-success message in subscription-sqs.js
      
          subscription_expired is set to true:
            - for SaaS Contracts: after detecting expired entitlement in entitlement-sqs.js
            - for SaaS Subscriptions: after reciving the unsubscribe-success message in subscription-sqs.js
        */
        const grantAccess = newImage.successfully_subscribed === true &&
            typeof newImage.is_free_trial_term_present !== "undefined" &&
            (oldImage.successfully_subscribed !== true || typeof oldImage.is_free_trial_term_present === "undefined")


        const revokeAccess = newImage.subscription_expired === true
            && !oldImage.subscription_expired;

        let entitlementUpdated = false;

        if (newImage.entitlement && oldImage.entitlement && (newImage.entitlement !== oldImage.entitlement)) {
            entitlementUpdated = true;
        }

        let firstTimeUser = false;
        if (typeof oldImage == "object" && typeof newImage.email != "undefined" && !revokeAccess) {
            firstTimeUser = true;
        }

        logger.debug('firstTimeUser', { 'value': firstTimeUser });
        logger.debug('entitlementUpdated', { 'value': entitlementUpdated });
        logger.debug('grantAccess', { 'value': grantAccess });
        logger.debug('revokeAccess:', { 'value': revokeAccess });


        if (grantAccess || revokeAccess || entitlementUpdated || firstTimeUser) {
            let message = '';
            let subject = '';
            if (grantAccess) {
                subject = SUBJECTS.GRANT_ACCESS
                message = `${MESSAGE_ACTION.SUBSCRIBE_SUCCESS}# ${JSON.stringify(newImage)}`;
            } else if (revokeAccess) {
                subject = SUBJECTS.REVOKE_ACCESS;
                message = `${MESSAGE_ACTION.UNSUBSCRIBE_SUCCESS}# ${JSON.stringify(newImage)}`;
            } else if (entitlementUpdated) {
                subject = SUBJECTS.ENTITLEMENT_UPDATED;
                message = `${MESSAGE_ACTION.ENTITLEMENT_UPDATED}# ${JSON.stringify(newImage)}`;
            } else if (firstTimeUser) {
                subject = SUBJECTS.ONBOARDED;
                message = `${MESSAGE_ACTION.ENTITLEMENT_CREATED}# ${JSON.stringify(newImage)}`;
            }

            const SNSparams = {
                TopicArn,
                Subject: subject,
                Message: message,
            };

            logger.info('Sending notification');
            logger.debug('SNSparams', { 'value': SNSparams });

            if (typeof TopicArn != "undefined" && newImage.email != "undefined") {
                const response = await SNS.publish(SNSparams).promise();
                logger.debug("SNS Publish Response", { data: response })
            }
        }
    }));
    return {};
};
