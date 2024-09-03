"use strict";
const winston = require('winston');
const nodemailer = require("nodemailer");
const axios = require("axios");

const { LOG_LEVEL, REGISTRATION_PAGE_DOMAIN } = require("./constants").ENV_VARS;
const {
  smtp_host,
  smtp_port,
  smtp_user,
  smtp_password,
  smtp_enable_ssl
} = require("./constants").SMTP_SETTINGS;

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports.SendEmail = (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: smtp_host,
    port: smtp_port,
    secure: smtp_enable_ssl === "True",
    auth: {
      user: smtp_user,
      pass: smtp_password
    }
  });
  return transporter.sendMail({
    from: smtp_user,
    to,
    subject,
    html,
  });
}

module.exports.SendResponse = body => {
  logger.debug("allowed Origins are", { "data": REGISTRATION_PAGE_DOMAIN });
  return {
    statusCode: 200,
    body,
    headers: {
      'Access-Control-Allow-Origin': REGISTRATION_PAGE_DOMAIN,
      'Access-Control-Allow-Credentials': true,
    }
  };
}

module.exports.SendResponseToContext = async (event, context, responseStatus) => {
  const reason = responseStatus === "FAILED" 
    ? "See the details in CloudWatch Log Stream: " + context.logStreamName : undefined;
  const responseBody = JSON.stringify({
    StackId: event.StackId,
    RequestId: event.RequestId,
    Status: responseStatus,
    Reason: reason,
    PhysicalResourceId: context.logStreamName,
    LogicalResourceId: event.LogicalResourceId,
    Data: {}
  });
  const responseOptions = {
    headers: {
      "Content-Type": "",
      "Content-Length": responseBody.length
    }
  };
  logger.info("Response body:\n", responseBody);
  try {
    await axios.put(event.ResponseURL, responseBody, responseOptions);
    context.done();
  } catch (error) {
    logger.error("CloudFormationSendResponse Error:", error.message);
    if (error.response) {
      logger.error(error.response);
    } else if (error.request) {
      logger.error(error.request);
    } else {
      logger.error("Error", error.message);
    }
    logger.error(error.config);
    context.done();
    throw new Error("Could not send CloudFormation response");
  }
};

module.exports.logger = logger;