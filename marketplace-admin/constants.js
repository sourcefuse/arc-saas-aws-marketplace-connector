module.exports.ENV_VARS = {
  LOG_LEVEL: process.env.LOG_LEVEL || "debug",
  MP_REGION: process.env.mp_region
}

module.exports.AWS_MP = {
  "catalog": "AWSMarketplace",
  "entityType": "SaaSProduct",
  "mp_region": process.env.mp_region || "us-east-1"
}

module.exports.STRINGS = {
  ACTION_ADD_DIMENSION: "addDimension",
  ACTION_ADD_TAGS: "addTags",
  ACTION_CREATE_OFFER: "createOffer",
  ACTION_CREATE_PRODUCT:"createProduct",
  ACTION_DELETE_TAGS: "deleteTags",
  ACTION_GET_OFFER_DETAILS_BY_PRODUCT_ID: "getOfferIdByProductid",
  ACTION_GET_OFFER_DETAILS: "getOfferDetails",
  ACTION_GET_PRODUCT_DETAILS: "getProductDetails",
  ACTION_GET_PRODUCT_DETAILS_BY_TITLE: "getProductDetailsByTitle",
  ACTION_RELEASE_OFFER: "releaseOffer",
  ACTION_UPDATE_ALLOWED_AWS_ACCOUNT: "updateAllowedAWSAccount",
  ACTION_UPDATE_ALLOWED_COUNTRIES: "updateAllowedCountries",
  ACTION_UPDATE_FULFILMENT: "updateFulfilment",
  ACTION_UPDATE_LEGAL_TERM: "updateLegalTerm",
  ACTION_UPDATE_RENEWAL_TERM: "updateRenewalTerm",
  ACTION_UPDATE_PRODUCT_INFO: "updateProductInfo",
  ACTION_UPDATE_SUPPORT_TERM: "updateSupportTerm",
  ACTION_UPDATE_OFFER_INFORMATION: "updateOfferInformation",
  ACTION_UPDATE_DIMENSION: "updateDimensions",
  ACTION_LIST_PRODUCTS: "listProducts"
}


module.exports.CHANGE_TYPE = {
  CREATE_PRODUCT: "CreateProduct",
  CREATE_OFFER: "CreateOffer",
  ADD_DELIVERY_OPTION: "AddDeliveryOptions",
  ADD_DIMENSION: "AddDimensions",
  RELEASE_OFFER: "ReleaseOffer",
  RELEASE_PRODUCT: "ReleaseProduct",
  UPDATE_DELIVERY_OPTION: "UpdateDeliveryOptions",
  UPDATE_INFORMATION: "UpdateInformation",
  UPDATE_TARGETING: "UpdateTargeting",
  UPDATE_RENEWAL_TERM: "UpdateRenewalTerms",
  UPDATE_SUPPORT_TERM: "UpdateSupportTerms",
  UPDATE_LEGAL_TERM: "UpdateLegalTerms",
  UPDATE_PRICING_TERM:"UpdatePricingTerms",
  UPDATE_DIMENSION: "UpdateDimensions"
}

module.exports.EULA_TYPE = {
  EULA_STANDARD: "StandardEula",
  EULA_CUSTOM: "CustomEula"
}

module.exports.ENTITY_TYPE = {
  PRODUCT: "SaaSProduct@1.0",
  OFFER: "Offer@1.0",
}