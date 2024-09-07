"use strict";
const { logger } = require("./utils");
const CatalogService = require("./services/catalog-service");

/**
 * This function will delete the tags from product.
 * @param {String} ResourceArn 
 * @param {Array} TagKeys 
 * @returns 
 */
module.exports.deleteTags = (ResourceArn, TagKeys) => {
  const params = {
    ResourceArn,
    TagKeys
  };
  logger.debug("Add Tags params", { params });
  return CatalogService.untagResource(params).promise();
}


/**
 * This function adds new tags to Product.
 * @param {String} ResourceArn 
 * @param {Array} Tags 
 * @returns 
 */
module.exports.addTags = (ResourceArn, Tags) => {
  const params = {
    ResourceArn,
    Tags
  };
  logger.debug("Add Tags params", { params });
  return CatalogService.tagResource(params).promise();
}
