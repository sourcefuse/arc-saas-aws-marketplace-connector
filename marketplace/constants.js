module.exports.ENV_VARS = {
  SupportSNSArn: process.env.SupportSNSARN || "arn:aws:sns:us-east-1:945019477776:arc-saas-mp-SupportSNSTopic-dev",
  LOG_LEVEL: process.env.LOG_LEVEL || "debug",
  aws_region: process.env.aws_region || "us-east-1",
  REGISTRATION_PAGE_URL: process.env.webpageURL || "https://sourcefuse.com",
  REGISTRATION_PAGE_DOMAIN: process.env.webpageDomain || "",
  MARKET_PACE_ADMIN: process.env.AWSMarketplaceADMIN || "",
  TABLE_USER: process.env.userTable || "arc-saas-mp-subscriber-dev"
}

module.exports.SMTP_SETTINGS = {
  smtp_port: "465",
  smtp_password: process.env.SMTP_PASSWORD,
  smtp_user: process.env.SMTP_USER,
  smtp_host: process.env.SMTP_HOST || null,
  smtp_enable_ssl: "True"
}

module.exports.AWS_MP = {
  "mp_region": process.env.mp_region || "us-east-1",
  "MarketplaceAdminEmail": process.env.AWSMarketplaceADMIN || ""
}

module.exports.MESSAGE_ACTION = {
  ENTITLEMENT_CREATED: "entitlement-created",
  ENTITLEMENT_UPDATED: "entitlement-updated",
  SUBSCRIBE_SUCCESS: "subscribe-success",
  UNSUBSCRIBE_SUCCESS: "unsubscribe-success"
}

module.exports.EMAIL_SUBJECTS = {
  CUSTOMER_ONBOARD: "Welcome Email from SAAS Product",
  ADMIN_ENTITLEMENT_CREATED: "AWS Marketplace customer onboarded!",
  ADMIN_ENTITLEMENT_UPDATED: "AWS Marketplace customer change of subscription!",
  ADMIN_USER_SUBSCRIBE: "New User Subscribed!",
  ADMIN_USER_UNSUBSCRIBED: "AWS Marketplace customer end of subscription!",
}

module.exports.EMAIL_TEMPLATE = {
  CUSTOMER_ONBOARD: '"<!DOCTYPE html><html><head><title>Welcome ##contactPerson##!<\/title><\/head><body><h1>Welcome ##contactPerson## !<\/h1><p>Thanks for purchasing<\/p><p>We\u2019re thrilled to have you on board. Our team is hard at work setting up your account, please expect to hear from a member of our customer success team soon<\/p><\/body><\/html>',
  ADMIN_ENTITLEMENT_UPDATED: '<br />Name:- ##contactPerson##'+
    '<br />Phone:- ##contactPhone##'+
    '<br />Company:- ##contactCompany##'+
    '<br />Email:- ##contactEmail##'+
    '<br />Address:- ##contactAddress##'+
    '<br />Zipcode:- ##contactZipcode##'+
    '<br />Country:- ##contactCountry##'+
    '<br />AWS Account ID:- ##contactAWSID##'+
    '<br />Preffered Subdomain:- ##contactPreferedDomain##'+
    '<br />Plan:- ##plan##',

  ADMIN_SUBSCRIPTION_END: '<br />Name:- ##contactPerson##'+
    '<br />Phone:- ##contactPhone##'+
    '<br />Company:- ##contactCompany##'+
    '<br />Email:- ##contactEmail##'+
    '<br />Address:- ##contactAddress##'+
    '<br />Zipcode:- ##contactZipcode##'+
    '<br />Country:- ##contactCountry##'+
    '<br />AWS Account ID:- ##contactAWSID##'+
    '<br />Preffered Subdomain:- ##contactPreferedDomain##'
}

module.exports.SUBJECTS = {
  GRANT_ACCESS: "New AWS Marketplace Subscriber",
  REVOKE_ACCESS: "AWS Marketplace customer end of subscription",
  ENTITLEMENT_UPDATED: "AWS Marketplace customer change of subscription",
  ONBOARDED: "AWS Marketplace customer onboarded"
}
