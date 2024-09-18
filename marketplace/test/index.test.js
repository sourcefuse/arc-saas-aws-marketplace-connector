"use strict";

process.env.LOG_LEVEL = "error";
process.env.SupportSNSARN = "test_sns";
process.env.webpageDomain = "test";
// Subscribe User
require("./subscribe-user.test");

// Grant Revoke Access
require("./grant-revoke-access.test");