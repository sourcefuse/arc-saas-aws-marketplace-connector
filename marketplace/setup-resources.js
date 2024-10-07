"use strict";
const {
  MESSAGE_ACTION,
  EMAIL_SUBJECTS,
  EMAIL_TEMPLATE,
  ENV_VARS
} = require("./constants");
const { SendEmail, logger } = require("./utils");

exports.handler = async (event) => {
  await Promise.all(event.Records.map(async record => {
    try {
      logger.debug("SNS Record is ", { data: record });
      let { Message: message, Subject: aws_subject } = record.Sns;
      logger.debug("Message", { data: message });
      let [action, body] = message.split("#");
      if (typeof body === 'string' || body instanceof String) {
        body = JSON.parse(body);
      }
      let emailSubject = "";
      let emailBody = "";
      let entitlement = JSON.parse(body.entitlement || "{}");
      let plan = "";
      if(entitlement.Entitlements.length>0){
        plan = entitlement.Entitlements[0]["Dimension"] 
      }
      switch (action.toLowerCase()) {
        case MESSAGE_ACTION.ENTITLEMENT_CREATED:
          emailSubject = EMAIL_SUBJECTS.ADMIN_ENTITLEMENT_CREATED;
          emailBody = EMAIL_TEMPLATE.ADMIN_SUBSCRIPTION_END;
          break;
        case MESSAGE_ACTION.ENTITLEMENT_UPDATED:
          emailSubject = EMAIL_SUBJECTS.ADMIN_ENTITLEMENT_UPDATED;
          emailBody = EMAIL_TEMPLATE.ADMIN_ENTITLEMENT_UPDATED;
          break;
        case MESSAGE_ACTION.SUBSCRIBE_SUCCESS:
          emailSubject = EMAIL_SUBJECTS.ADMIN_USER_SUBSCRIBE;
          break;
        case MESSAGE_ACTION.UNSUBSCRIBE_SUCCESS:
          emailSubject = EMAIL_SUBJECTS.ADMIN_USER_UNSUBSCRIBED;
          emailBody = EMAIL_TEMPLATE.ADMIN_SUBSCRIPTION_END;
          break;
        default:
          break;
      }

      logger.debug("Action & Body", { data: { action, body } })
      logger.info("Sending Email to ", { adminEmail: ENV_VARS.MARKET_PACE_ADMIN });
      if (ENV_VARS.MARKET_PACE_ADMIN !== "" && typeof body.firstName === 'string') {
        emailBody = emailBody.split("##contactPerson##").join(body.firstName + " "+ body.lastName);
        emailBody = emailBody.split("##contactPhone##").join(body.contactPhone);
        emailBody = emailBody.split("##contactCompany##").join(body.companyName);
        emailBody = emailBody.split("##contactEmail##").join(body.email);
        emailBody = emailBody.split("##contactAddress##").join(body.address);
        emailBody = emailBody.split("##contactZipcode##").join(body.zipcode);
        emailBody = emailBody.split("##contactCountry##").join(body.country);
        emailBody = emailBody.split("##contactAWSID##").join(body.customerAWSAccountID);
        emailBody = emailBody.split("##contactPreferedDomain##").join(body.preferredSubdomain);
        emailBody = emailBody.split("##plan##").join(plan);

        const emailResponse = await SendEmail(
          ENV_VARS.MARKET_PACE_ADMIN,
          emailSubject,
          emailBody
        );
        logger.info("Email Response", { emailResponse });
      }
    } catch (e) {
      logger.error(e.message)
    }
  }))
}