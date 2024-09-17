"use strict";

process.env.LOG_LEVEL = "error";
process.env.SupportSNSARN = "test_sns";


// Grant Revoke Access
require("./grant-revoke-access.test");