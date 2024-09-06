"use strict";
const { SendResponse, logger } = require("./utils");
const {
  AWS_MP,
  CHANGE_TYPE,
  EULA_TYPE,
  STRINGS,
  ENTITY_TYPE
} = require("./constants");

const { catalog } = AWS_MP;
const CatalogService = require("./services/catalog-service")();
const describeMP = async EntityId => {
  return CatalogService.describeEntity({
    Catalog: catalog,
    EntityId
  }).promise();
}

/**
 * This function is used to create new Product in AWS Marketplace type of 
 * SAAS product.
 * @param {*} ProductTitle 
 * @returns 
 */
const createProduct = async ProductTitle => {
  const allProducts = await listProducts("");
  const productNames = allProducts.map(product => {
    return product["Name"].toLowerCase();
  });
  if (productNames.indexOf(ProductTitle.toLowerCase()) > -1) {
    throw new Error("Product Title already Exists");
  }
  const params = {
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.CREATE_PRODUCT,
      Entity: {
        Type: ENTITY_TYPE.PRODUCT
      },
      Details: JSON.stringify({ ProductTitle })
    }]
  }
  logger.debug("Create Product params", { params });
  return CatalogService.startChangeSet(params).promise();
}

const getOfferId = async (productId) => {
  logger.info("Getting Offer Id from Product Id", { data: productId });
  const result = await CatalogService.listEntities({
    Catalog: catalog,
    EntityType: ENTITY_TYPE.OFFER.split("@")[0],
    FilterList: [{
      Name: "ProductId",
      ValueList: [productId]
    }]
  }).promise();
  result["EntitySummaryList"] = result["EntitySummaryList"] || [];
  if (result["EntitySummaryList"].length > 0) {
    return result["EntitySummaryList"][0]["EntityId"];
  }
  return null;
}

const updateFulfilmentURL = async (Identifier, FulfillmentUrl) => {
  const mpDetails = await describeMP(Identifier);
  let fullfilmentId = null;
  if (typeof mpDetails.DetailsDocument.Versions != "undefined"
    && mpDetails.DetailsDocument.Versions.length > 0
    && mpDetails.DetailsDocument.Versions[0].DeliveryOptions.length > 0
    && typeof mpDetails.DetailsDocument.Versions[0].DeliveryOptions != "undefined"
  ) {
    fullfilmentId = mpDetails.DetailsDocument.Versions[0].DeliveryOptions[0].Id;
  }

  let change = {
    ChangeType: fullfilmentId == null ? CHANGE_TYPE.ADD_DELIVERY_OPTION : CHANGE_TYPE.UPDATE_DELIVERY_OPTION,
    Entity: {
      Type: ENTITY_TYPE.PRODUCT,
      Identifier
    },
    Details: {
      DeliveryOptions: []
    }
  };
  if (fullfilmentId) {
    change.Details.DeliveryOptions.push({
      Id: fullfilmentId,
      Details: {
        SaaSUrlDeliveryOptionDetails: {
          FulfillmentUrl
        }
      }
    });
  } else {
    change.Details.DeliveryOptions.push({
      Details: {
        SaaSUrlDeliveryOptionDetails: {
          FulfillmentUrl
        }
      }
    });
  }
  change.Details = JSON.stringify(change.Details);
  const params = {
    Catalog: catalog,
    ChangeSet: [change]
  };
  logger.debug("update fulfilment url params", { params });
  return CatalogService.startChangeSet(params).promise();
}

const updateProductInfo = async (Identifier, productInfo) => {
  const details = {};
  details.LogoUrl = productInfo.logoURL;
  details.ShortDescription = productInfo.shortDescription;
  details.LongDescription = productInfo.longDescription;
  details.Highlights = productInfo.highlights;
  details.Categories = productInfo.categories;
  details.SupportDescription = productInfo.supportDescription;
  details.AdditionalResources = productInfo.additionalResources;
  details.SearchKeywords = productInfo.searchKeywords;
  details.Sku = productInfo.sku;
  details.VideoUrls = productInfo.videoUrls;
  details.ProductTitle = productInfo.productTitle;
  const params = {
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.UPDATE_INFORMATION,
      Entity: {
        Type: ENTITY_TYPE.PRODUCT,
        Identifier
      },
      Details: JSON.stringify(details)
    }]
  };
  logger.debug("Update Product Info params", { params });
  return CatalogService.startChangeSet(params).promise();
}

const updateAllowedAWSAccount = (Identifier, BuyerAccounts) => {
  const params = {
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.UPDATE_TARGETING,
      Entity: {
        Type: ENTITY_TYPE.PRODUCT,
        Identifier
      },
      Details: JSON.stringify({
        PositiveTargeting: {
          BuyerAccounts
        }
      })
    }]
  };
  logger.debug("Update Allowed AWS Account params", { params });
  return CatalogService.startChangeSet(params).promise();
}

const updateAllowedCountries = (Identifier, CountryCodes) => {
  let targetCountriesDetails = {};
  if (typeof CountryCodes == "object" && CountryCodes.length > 0) {
    targetCountriesDetails = {
      PositiveTargeting: {
        CountryCodes
      }
    }
  }
  const param = {
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.UPDATE_TARGETING,
      Entity: {
        Type: ENTITY_TYPE.OFFER,
        Identifier
      },
      Details: JSON.stringify(targetCountriesDetails)
    }]
  };
  logger.debug("Update Allowed Countries", { param });
  return CatalogService.startChangeSet(param).promise();
}

const createOffer = ProductId => {
  const params = {
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.CREATE_OFFER,
      Entity: {
        Type: ENTITY_TYPE.OFFER,
      },
      Details: JSON.stringify({ ProductId })
    }]
  };
  logger.debug("Create Offer params", { params });
  return CatalogService.startChangeSet(params).promise();
}

const updateLegalTerm = (OfferId, data) => {
  let EULADocument = {};
  switch (data.type.toLowerCase()) {
    case EULA_TYPE.EULA_STANDARD.toLowerCase():
      EULADocument = {
        Type: EULA_TYPE.EULA_STANDARD,
        Version: data.version
      }
      break;
    case EULA_TYPE.EULA_CUSTOM.toLowerCase():
      EULADocument = {
        Type: EULA_TYPE.EULA_CUSTOM,
        Url: data.url
      }
      break;
  }
  const param = {
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.UPDATE_LEGAL_TERM,
      Entity: {
        Type: ENTITY_TYPE.OFFER,
        Identifier: OfferId
      },
      Details: JSON.stringify({
        "Terms": [{
          "Type": "LegalTerm",
          "Documents": [EULADocument]
        }]
      })
    }]
  };
  logger.debug("Update EULA Params", { param });
  return CatalogService.startChangeSet(param).promise();
}

const updateRenewalTerm = (Identifier) => {
  const param = {
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.UPDATE_RENEWAL_TERM,
      Entity: {
        Type: ENTITY_TYPE.OFFER,
        Identifier
      },
      Details: JSON.stringify({
        "Terms": [{
          Type: "RenewalTerm"
        }]
      })
    }]
  };
  logger.debug("Update Support Term", { param });
  return CatalogService.startChangeSet(param).promise();
}

const updateSupportTerm = (OfferId, RefundPolicy) => {
  const param = {
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.UPDATE_SUPPORT_TERM,
      Entity: {
        Type: ENTITY_TYPE.OFFER,
        Identifier: OfferId
      },
      Details: JSON.stringify({
        "Terms": [{
          Type: "SupportTerm",
          RefundPolicy
        }]
      })
    }]
  };
  logger.debug("Update Support Term", { param });
  return CatalogService.startChangeSet(param).promise();
}

const releaseOffer = (ProductId, OfferId) => {
  const params = {
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.RELEASE_PRODUCT,
      Entity: {
        Type: ENTITY_TYPE.PRODUCT,
        Identifier: ProductId
      },
      Details: JSON.stringify({})
    }, {
      ChangeType: CHANGE_TYPE.RELEASE_OFFER,
      Entity: {
        Type: ENTITY_TYPE.OFFER,
        Identifier: OfferId
      },
      Details: JSON.stringify({})
    }]
  };
  logger.debug("Release Offer Params", { params });
  return CatalogService.startChangeSet(params).promise();
}

const addDimension = async (ProductId, dimension) => {
  const uid = Date.now();
  dimension.key = dimension.key + "_" + uid
  logger.info("Adding Dimension to product", {
    data: {
      ProductId,
      dimension
    }
  });
  const offerId = await getOfferId(ProductId);
  if (offerId) {
    const dimensionParam = {
      Key: dimension.key,
      Description: dimension.description,
      Name: dimension.name,
      Types: dimension.type,
      Unit: dimension.unit
    };

    const response = await describeMP(offerId);
    const details = JSON.parse(response["Details"]);
    const terms = details["Terms"];
    const termParam = {
      PricingModel: dimension.pricingModel,
      Terms: []
    };

    let updateTerm = {
      "Type": "ConfigurableUpfrontPricingTerm",
      "CurrencyCode": dimension.currencyCode,
      "RateCards": [{
        "Selector": {
          "Type": "Duration",
          "Value": "P1M"
        },
        "Constraints": {
          "MultipleDimensionSelection": dimension.multipleDimensionSelection,
          "QuantityConfiguration": dimension.quantityConfiguration
        },
        "RateCard": []
      }]
    };

    for (const term of terms) {
      if (term["Type"] == "ConfigurableUpfrontPricingTerm") {
        updateTerm = term;
        break
      }
    }
    updateTerm.RateCards[0].RateCard.push({
      "DimensionKey": dimension.key,
      "Price": dimension.price
    });

    termParam.Terms.push(updateTerm);
    logger.debug("Adding Pricing Dimension", { dimensionParam });
    logger.debug("Update offer term", { termParam });

    const addDimensionChangeset = {
      ChangeType: CHANGE_TYPE.ADD_DIMENSION,
      Entity: {
        Type: ENTITY_TYPE.PRODUCT,
        Identifier: ProductId
      },
      Details: JSON.stringify([dimensionParam])
    };

    const updatePricingTermChangeset = {
      ChangeType: CHANGE_TYPE.UPDATE_PRICING_TERM,
      Entity: {
        Type: ENTITY_TYPE.OFFER,
        Identifier: offerId
      },
      Details: JSON.stringify(termParam)
    }
    const changeParam = {
      Catalog: catalog,
      ChangeSet: [addDimensionChangeset, updatePricingTermChangeset]
    };
    logger.debug("Add Pricing Dimension params", { params: changeParam });
    return CatalogService.startChangeSet(changeParam).promise();
  }
  return null;
}

const addTags = (ResourceArn, Tags) => {
  const params = {
    ResourceArn,
    Tags
  };
  logger.debug("Add Tags params", { params });
  return CatalogService.tagResource(params).promise();
}

const deleteTags = (ResourceArn, TagKeys) => {
  const params = {
    ResourceArn,
    TagKeys
  };
  logger.debug("Add Tags params", { params });
  return CatalogService.untagResource(params).promise();
}

const updateOfferInformation = (Identifier, data) => {
  const params = {
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.UPDATE_INFORMATION,
      Entity: {
        Type: ENTITY_TYPE.OFFER,
        Identifier
      },
      Details: JSON.stringify({
        Name: data.name,
        Description: data.description,
        PreExistingAgreement: null
      })
    }]
  };
  logger.debug("Update Offer Information Params", { params });
  return CatalogService.startChangeSet(params).promise();
}

const listProducts = async (NextToken) => {
  let responses = [];
  while (NextToken != null) {
    const params = {
      Catalog: catalog,
      EntityType: ENTITY_TYPE.PRODUCT.split("@")[0],
      NextToken: NextToken.length > 0 ? NextToken : null
    };
    const result = await CatalogService.listEntities(params).promise();
    NextToken = result["NextToken"];
    responses = [...responses, ...result["EntitySummaryList"]];
  }
  return responses;
}

const updateDimensions = async (Identifier, data) => {
  let dimensions = [];
  for (const d of data) {
    dimensions.push({
      Key: d.key,
      Name: d.name,
      Description: d.description,
      Types: [
        "Entitled"
      ]
    });
  }
  const params = {
    Catalog: catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.UPDATE_DIMENSION,
      Entity: {
        Type: ENTITY_TYPE.PRODUCT,
        Identifier
      },
      Details: JSON.stringify(dimensions)
    }]
  };
  logger.info("Update Pricing Params", { params });
  return await CatalogService.startChangeSet(params).promise();
}

const getProductDetailByTitle = async ProductTitle => {
  const products = await listProducts("");
  for (const product of products) {
    if (product.Name === ProductTitle) {
      return product;
    }
  }
  return null;
}

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
        result = await describeMP(request.entityId);
        break;
      case STRINGS.ACTION_GET_OFFER_DETAILS.toLowerCase():
        result = await describeMP(request.entityId);
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
        console.log("hi")
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