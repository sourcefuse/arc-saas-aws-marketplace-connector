"use strict";

const CatalogService = require("./services/catalog-service");

module.exports.describeChangeSet = (Catalog, ChangeSetId) => {
  return CatalogService.describeChangeSet({ Catalog, ChangeSetId }).promise();
}