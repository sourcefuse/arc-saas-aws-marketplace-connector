"use strict";
const { logger } = require("./utils");
const CatalogService = require("./services/catalog-service");
const { AWS_MP, ENTITY_TYPE, CHANGE_TYPE} = require("./constants");
const { catalog: Catalog } = AWS_MP;

const getProductDetailById = async EntityId => {
  return CatalogService.describeEntity({
    Catalog,
    EntityId
  }).promise();
}

/**
 * This function will return list of all Products.
 * @param {String} NextToken 
 * @returns 
 */
const listProducts = async (NextToken) => {
  let responses = [];
  while (NextToken != null) {
    const params = {
      Catalog,
      EntityType: ENTITY_TYPE.PRODUCT.split("@")[0],
      NextToken: NextToken.length > 0 ? NextToken : null
    };
    const result = await CatalogService.listEntities(params).promise();
    NextToken = result["NextToken"];
    responses = [...responses, ...result["EntitySummaryList"]];
  }
  return responses;
}

/**
 * This function is used to create new Product in AWS Marketplace type of 
 * SAAS product.
 * @param {String} ProductTitle 
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
    Catalog,
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

/**
 * This function will return product details by product title.
 * @param {String} ProductTitle 
 * @returns 
 */
const getProductDetailByTitle = async ProductTitle => {
  const products = await listProducts("");
  for (const product of products) {
    if (product.Name === ProductTitle) {
      return product;
    }
  }
  return null;
}

/**
 * This function will update dimension information.
 * @param {String} Identifier 
 * @param {Object} data 
 * @returns 
 */
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
    Catalog,
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


/**
 * 
 * @param {String} Identifier 
 * @param {Array} BuyerAccounts 
 * @returns 
 */
const updateAllowedAWSAccount = (Identifier, BuyerAccounts) => {
  const params = {
    Catalog,
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

/**
 * 
 * @param {String} Identifier (Product Id)
 * @param {Object} productInfo 
 * @returns 
 */
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
    Catalog,
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

/**
 * 
 * @param {String} Identifier (Product ID) 
 * @param {String} FulfillmentUrl 
 * @returns 
 */
const updateFulfilmentURL = async (Identifier, FulfillmentUrl) => {
  const mpDetails = await getProductDetailById(Identifier);
  let fullfilmentId = null;
  if (typeof mpDetails.DetailsDocument.Versions != "undefined"
    && mpDetails.DetailsDocument.Versions.length > 0
    && mpDetails.DetailsDocument.Versions[0].DeliveryOptions.length > 0
    && typeof mpDetails.DetailsDocument.Versions[0].DeliveryOptions != "undefined"
  ) {
    fullfilmentId = mpDetails.DetailsDocument.Versions[0].DeliveryOptions[0].Id;
  }

  const change = {
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
    Catalog,
    ChangeSet: [change]
  };
  logger.debug("update fulfilment url params", { params });
  return CatalogService.startChangeSet(params).promise();
}

module.exports = {
  listProducts,
  getProductDetailById,
  getProductDetailByTitle,
  createProduct,
  updateDimensions,
  updateAllowedAWSAccount,
  updateProductInfo,
  updateFulfilmentURL,
}