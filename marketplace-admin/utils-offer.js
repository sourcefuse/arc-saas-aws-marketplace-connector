"use strict";
const { logger } = require("./utils");
const CatalogService = require("./services/catalog-service");
const { AWS_MP, ENTITY_TYPE, CHANGE_TYPE, TERMS_TYPE, EULA_TYPE } = require("./constants");
const { catalog: Catalog } = AWS_MP;

/**
 * This function will create new Offer.
 * @param {String} ProductId 
 * @returns 
 */
module.exports.createOffer = ProductId => {
  const params = {
    Catalog,
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

/**
 * This function returns the Offer Id for a given Product Id.
 * @param {String} productId 
 * @returns 
 */
const getOfferId = async (productId) => {
  logger.info("Getting Offer Id from Product Id", { data: productId });
  const params = {
    Catalog,
    EntityType: ENTITY_TYPE.OFFER.split("@")[0],
    FilterList: [{
      Name: "ProductId",
      ValueList: [productId]
    }]
  };
  logger.debug("List Entities Params", { params });
  const result = await CatalogService.listEntities(params).promise();
  result["EntitySummaryList"] = result["EntitySummaryList"] || [];
  if (result["EntitySummaryList"].length > 0) {
    return result["EntitySummaryList"][0]["EntityId"];
  }
  return null;
}

/**
 * This function get details of offer by id.
 * @param {String} EntityId 
 * @returns 
 */
const getOfferDetails = async EntityId => {
  return CatalogService.describeEntity({ Catalog, EntityId }).promise();
}

/**
 * This function will update the offer information.
 * @param {String} Identifier 
 * @param {Object} data 
 * @returns 
 */
module.exports.updateOfferInformation = (Identifier, data) => {
  const params = {
    Catalog,
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

/**
 * This function will update Refund policy for the given Offer.
 * @param {String} OfferId 
 * @param {String} RefundPolicy 
 * @returns 
 */
module.exports.updateSupportTerm = (Identifier, RefundPolicy) => {
  const param = {
    Catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.UPDATE_SUPPORT_TERM,
      Entity: {
        Type: ENTITY_TYPE.OFFER,
        Identifier
      },
      Details: JSON.stringify({
        "Terms": [{
          Type: TERMS_TYPE.SUPPORT,
          RefundPolicy
        }]
      })
    }]
  };
  logger.debug("Update Support Term", { param });
  return CatalogService.startChangeSet(param).promise();
}

/**
 * This function will update legal term in given Offer.
 * @param {String} OfferId 
 * @param {Object} data 
 * @returns 
 */
module.exports.updateLegalTerm = (Identifier, data) => {
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
    Catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.UPDATE_LEGAL_TERM,
      Entity: {
        Type: ENTITY_TYPE.OFFER,
        Identifier
      },
      Details: JSON.stringify({
        "Terms": [{
          "Type": TERMS_TYPE.LEGAL,
          "Documents": [EULADocument]
        }]
      })
    }]
  };
  logger.debug("Update EULA Params", { param });
  return CatalogService.startChangeSet(param).promise();
}

/**
 * This function update Countries allowd for offer.
 * @param {String} Identifier 
 * @param {Array} CountryCodes 
 * @returns 
 */
module.exports.updateAllowedCountries = (Identifier, CountryCodes) => {
  let targetCountriesDetails = {};
  if (typeof CountryCodes == "object" && CountryCodes.length > 0) {
    targetCountriesDetails = {
      PositiveTargeting: {
        CountryCodes
      }
    }
  }
  const param = {
    Catalog,
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

/**
 * This function will add new Pricing info to product.
 * @param {String} ProductId 
 * @param {Object} dimension 
 * @returns 
 */
module.exports.addDimension = async (ProductId, dimension) => {
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

    const response = await getOfferDetails(offerId);
    const details = typeof response["Details"] == 'string' && response["Details"].substring(0, 1) == "{" ? JSON.parse(response["Details"]) : {};
    const terms = details["Terms"] || [];
    const termParam = {
      PricingModel: dimension.pricingModel,
      Terms: []
    };

    let updateTerm = {
      "Type": TERMS_TYPE.PRICING_UPFRONT,
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

    if (terms.length > 0) {
      for (const term of terms) {
        if (term["Type"].toLowerCase() == TERMS_TYPE.PRICING_UPFRONT.toLowerCase()) {
          updateTerm = term;
          break
        }
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
      Catalog,
      ChangeSet: [addDimensionChangeset, updatePricingTermChangeset]
    };
    logger.debug("Add Pricing Dimension params", { params: changeParam });
    return CatalogService.startChangeSet(changeParam).promise();
  }
  return null;
}

/**
 * This function will update renewal term for given offer.
 * @param {String} Identifier 
 * @returns 
 */
module.exports.updateRenewalTerm = Identifier => {
  const param = {
    Catalog,
    ChangeSet: [{
      ChangeType: CHANGE_TYPE.UPDATE_RENEWAL_TERM,
      Entity: {
        Type: ENTITY_TYPE.OFFER,
        Identifier
      },
      Details: JSON.stringify({
        "Terms": [{
          Type: TERMS_TYPE.RENEWAL
        }]
      })
    }]
  };
  logger.debug("Update Support Term", { param });
  return CatalogService.startChangeSet(param).promise();
}

/**
 * This function will release offer and product.
 * @param {String} ProductId 
 * @param {String} OfferId 
 * @returns 
 */
module.exports.releaseOffer = (ProductId, OfferId) => {
  const params = {
    Catalog,
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

module.exports.getOfferId = getOfferId;
module.exports.getOfferDetails = getOfferDetails;