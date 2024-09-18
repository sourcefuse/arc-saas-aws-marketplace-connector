"use strict";
const { expect } = require("chai");
const { handler } = require("../redirect");
describe("Start Testing Redirect API", () => {
  it("1. Test Redirect Response code 302.", () => {
    const token = "test-token";
    const response = handler({
      body: token
    });
    expect(response.statusCode).to.equal(302);
    expect(response.headers.Location.indexOf(token)).is.gt(-1)
  });

  it("2. Test Redirect Response Header locaion has token.", () => {
    const token = "test-token";
    const response = handler({
      body: token
    });
    expect(response.headers.Location.indexOf(token)).is.gt(-1)
  });
});