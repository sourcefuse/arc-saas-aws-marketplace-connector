"use strict";

const {REGISTRATION_PAGE_URL} = require("./constants").ENV_VARS;

exports.handler = async (event) => {
  const redirectUrl = REGISTRATION_PAGE_URL +"?" + event['body'];
  const response = {
      statusCode: 302,
      headers: {
          Location: redirectUrl
      },
  };
  return response;
};