"use strict";
const { SendResponse, logger } = require("./utils");
const { STRINGS } = require("./constants");

const {
  createOffer,
  getOfferId,
  getOfferDetails,
  updateOfferInformation,
  updateSupportTerm,
  updateLegalTerm,
  updateAllowedCountries,
  addDimension,
  updateRenewalTerm,
  releaseOffer
} = require("./utils-offer");

const {
  listProducts,
  getProductDetailById,
  getProductDetailByTitle,
  createProduct,
  updateDimensions,
  updateAllowedAWSAccount,
  updateProductInfo,
  updateFulfilmentURL
} = require("./utils-product");

const {
  addTags,
  deleteTags,
} = require("./utils-tag");

exports.handler = async (event) => {
  let result = {
    "Available Actions": Object.values(STRINGS)
  };
  logger.info("Event Body", { body: event.body });
  try {
    const request = JSON.parse(event.body);
    logger.info("Got request type", { type: request.type.toLowerCase() });

    switch (request.type.toLowerCase()) {
      // Create API
      case STRINGS.ACTION_CREATE_PRODUCT.toLowerCase():
        result = await createProduct(request.data.productTitle);
        break;
      case STRINGS.ACTION_CREATE_OFFER.toLowerCase():
        result = await createOffer(request.entityId);
        break;

      // Get API
      case STRINGS.ACTION_GET_PRODUCT_DETAILS_BY_TITLE.toLowerCase():
        result = await getProductDetailByTitle(request.data.title);
        break;
      case STRINGS.ACTION_GET_PRODUCT_DETAILS.toLowerCase():
        result = await getProductDetailById(request.entityId);
        break;
      case STRINGS.ACTION_GET_OFFER_DETAILS.toLowerCase():
        result = await getOfferDetails(request.entityId);
        break;
      case STRINGS.ACTION_GET_OFFER_DETAILS_BY_PRODUCT_ID.toLowerCase():
        result = await getOfferId(request.entityId);
        break;
      case STRINGS.ACTION_LIST_PRODUCTS.toLowerCase():
        result = await listProducts("");
        break;

      // Update api for Products
      case STRINGS.ACTION_UPDATE_FULFILMENT.toLowerCase():
        result = await updateFulfilmentURL(request.entityId, request.data.url);
        break;
      case STRINGS.ACTION_UPDATE_PRODUCT_INFO.toLowerCase():
        result = await updateProductInfo(request.entityId, request.data);
        break;
      case STRINGS.ACTION_UPDATE_ALLOWED_AWS_ACCOUNT.toLowerCase():
        result = await updateAllowedAWSAccount(request.entityId, request.data.allowedAWSAccounts);
        break;
      case STRINGS.ACTION_ADD_DIMENSION.toLowerCase():
        result = await addDimension(request.entityId, request.data);
        break;

      // Update api for Offers
      case STRINGS.ACTION_UPDATE_ALLOWED_COUNTRIES.toLowerCase():
        result = await updateAllowedCountries(request.entityId, request.data);
        break;
      case STRINGS.ACTION_UPDATE_SUPPORT_TERM.toLowerCase():
        result = await updateSupportTerm(request.entityId, request.data);
        break;
      case STRINGS.ACTION_UPDATE_LEGAL_TERM.toLowerCase():
        result = await updateLegalTerm(request.entityId, request.data);
        break;
      case STRINGS.ACTION_UPDATE_RENEWAL_TERM.toLowerCase():
        result = await updateRenewalTerm(request.entityId);
        break;
      case STRINGS.ACTION_RELEASE_OFFER.toLowerCase():
        result = await releaseOffer(request.productId, request.offerId);
        break;
      case STRINGS.ACTION_UPDATE_OFFER_INFORMATION.toLowerCase():
        result = await updateOfferInformation(request.entityId, request.data);
        break;
      case STRINGS.ACTION_UPDATE_DIMENSION.toLowerCase():
        result = await updateDimensions(request.entityId, request.data);
        break;

      // Tags
      case STRINGS.ACTION_ADD_TAGS.toLowerCase():
        result = await addTags(request.entityARN, request.data.tags);
        break;
      case STRINGS.ACTION_DELETE_TAGS.toLowerCase():
        result = await deleteTags(request.entityARN, request.data.tags);
        break;
    }
  } catch (e) {
    logger.error("Error", { "message": e.message });
    result = {
      "error": true,
      "message": e.message || "Internal Server Error"
    }
    // throw e
  }
  logger.debug("Result", { data: result });
  return SendResponse(JSON.stringify(result));
}