"use strict";

process.env.LOG_LEVEL = "error"

// Tags
require("./tags_add.test");
require("./tags_delete.test");

// Offers
require("./offer_create.test");
require("./offer_get_id_by_product_id.test");
require("./offer_get_details_by_id.test");
require("./offer_add_pricing.test");
require("./offer_update_offer_details.test");
require("./offer_update_refund_policy.test");
require("./offer_update_legal_terms.test");
require("./offer_update_allowed_countries.test");
require("./offer_update_renewal_term.test");
require("./offer_release.test");

// Products
require("./product_list.test");
require("./product_get_details_by_id.test");
require("./product_get_details_by_title.test");
require("./product_create.test");
require("./product_update_pricing.test");
require("./product_update_allowed_aws_account.test");
require("./product_update_fulfilment.test");
require("./product_update_info.test");