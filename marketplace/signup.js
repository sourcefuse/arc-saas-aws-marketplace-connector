'use strict';
const AWS = require('aws-sdk');
const querystring = require('querystring');
const {
  DDBService: dynamodb,
  MeteringService: marketplacemetering
} = require("./services");
const { ENV_VARS } = require("./constants");

exports.handler = async (event) => {
  const body = querystring.decode(event.body);
  const registrationToken = body["x-amzn-marketplace-token"];
  let userDetails = {};
  try {
    const resolveCustomerParams = {
      RegistrationToken: registrationToken,
    };
    const resolveCustomerResponse = await marketplacemetering
      .resolveCustomer(resolveCustomerParams)
      .promise();

    const { CustomerIdentifier, ProductCode } = resolveCustomerResponse;
    const dynamoDbParams = {
      TableName: ENV_VARS.TABLE_USER,
      ExpressionAttributeValues: {
        ":c": { S: CustomerIdentifier },
        ":p": { S: ProductCode }
      },
      KeyConditionExpression: "customerIdentifier = :c and productCode = :p"
    };
    console.log(dynamoDbParams);

    const ddbResponse = await dynamodb.query(dynamoDbParams).promise();

    if (ddbResponse.Items.length > 0) {
      userDetails = AWS.DynamoDB.Converter.unmarshall(
        ddbResponse.Items[0]
      );
    }
  } catch (e) {
    console.log(e.message);
  }
  const html = `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
      <link rel="stylesheet" href="https://arc-mp-integration.s3.us-east-1.amazonaws.com/style.css?ver=1">
      <title>Registration page</title>
      <script>
        const subscribePath = "https://3cw3b6ngc1.execute-api.us-east-1.amazonaws.com/dev/subscribe";
        const apiKey = "W3eOL4KxNg4OI9KY357z67nZ3LfnPZ4Q9o3r575L";
        const mptoken = '${registrationToken}';
      </script>
    </head>
    <body class="text-center">
      <div class="container" style="width: 100% !important;">
        <div id="alert"></div>
        <form class="form-signin" method="POST" enctype="multipart/form-data" style="display: inline;width:100%;">
          <img class="mb-4" src="https://arc-mp-integration.s3.us-east-1.amazonaws.com/logo.jpeg" alt="" width="300">
          <h1 class="h3 mb-3 font-weight-bold">Tenant Signup</h1>
          <h2 class="h3 mb-3 font-weight-normal">Signup to ARC-SaaS</h2>
          <div style="float:left;width:100%;margin-top:10px;">
            <div style="float:left;width:50%;">
              <label for="firstName" class="sr-only">First Name</label>
              <input type="text" name="firstName" class="form-control" placeholder="First Name" required autofocus value="${userDetails.firstName || ""}">
            </div>
            <div style="float:left;width:50%;">
              <label for="lastName" class="sr-only">Last Name</label>
              <input type="text" name="lastName" class="form-control" placeholder="Last Name" required autofocus value="${userDetails.lastName || ""}">
            </div>
          </div>

          <div style="float:left;width:100%;margin-top:10px;">
            <div style="float:left;width:50%;">
              
              <label for="Contact phone" class="sr-only">Contact Phone</label>
              <input type="tel" name="contactPhone" class="form-control" placeholder="Contact Phone" required autofocus value="${userDetails.contactPhone || ""}">
            </div>
            <div style="float:left;width:50%;">
              <label for="contactEmail" class="sr-only">Email address</label>
              <input type="email" name="contactEmail" class="form-control" placeholder="Email address" required autofocus value="${userDetails.email || ""}">
            </div>
          </div>
          <div style="float:left;width:100%;margin-top:10px;">
            <div style="float:left;width:50%;">
              <label for="country" class="sr-only">Country</label>
              <select name="country" class="form-control" required autofocus>
                <option value="IN" ${userDetails.country == 'IN' ? 'selected':''}>India</option>
                <option value="US" ${userDetails.country == 'US' ? 'selected':''}>United States of America</option>
                <option value="JP" ${userDetails.country == 'JP' ? 'selected':''}>Japan</option>
                <option value="FR" ${userDetails.country == 'FR' ? 'selected':''}>France</option>
              </select>
            </div>
            <div style="float:left;width:50%;">
              <label for="zipcode" class="sr-only">Zip Code</label>
              <input type="text" name="zipcode" class="form-control" placeholder="Zip Code" required autofocus value="${userDetails.zipcode || ""}">
            </div>
          </div>

          <div style="float:left;width:100%;margin-top:10px;">
            <div style="float:left;width:100%;">
              <label for="address" class="sr-only">Address</label>
              <textarea name="address" class="form-control" placeholder="Address" style="width:95%;" autofocus>${userDetails.address || ""}</textarea>
            </div>
          </div>
          <div style="float:left;width:100%;margin-top:10px;">
            <div style="float:left;width:50%;">
              <label for="companyName" class="sr-only">Company Name</label>
              <input type="text" name="companyName" class="form-control" placeholder="Company Name" required autofocus value="${userDetails.companyName || ""}">
            </div>
            <div style="float:left;width:50%;">
              <label for="preferredSubdomain" class="sr-only">Preffered Subdomain</label>
              <input type="text" name="preferredSubdomain" class="form-control" placeholder="Prefferd Subdomain" autofocus value="${userDetails.preferredSubdomain || ""}">
            </div>
          </div>
          <div style="float:left;width:95%;margin-top:10px;">
            <button class="btn btn-lg btn-primary btn-block" type="submit">SIGNUP</button>
          </div>
          <p class="mt-5 mb-3 text-muted" style="width:100% !important;display: inline;float:left;">&copy; 2024</p>
        </form>
      </div>
      <script src="https://code.jquery.com/jquery-3.7.0.min.js"
        integrity="sha384-NXgwF8Kv9SSAr+jemKKcbvQsz+teULH/a5UNJvZc6kP47hZgl62M1vGnw6gHQhb1"
        crossorigin="anonymous"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"
        integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1"
        crossorigin="anonymous"></script>
      <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"
        integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM"
        crossorigin="anonymous"></script>
      <script src="https://arc-mp-integration.s3.us-east-1.amazonaws.com/signup.js?ver=1"></script>
    </body>
  </html>`;
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: html,
  };
};

// exports.handler({
//   body: "x-amzn-marketplace-token=MLn3CNtpeXK19TRJ0S0KfRpGeEt0Oj45gccdaMdcUMP67TdKBy5LGhduAdiLAKDCizIb5iWOaukvM4YthNXTCkOLpRsJ0u7xmmrRtVSU%2BO1AgCV9dp9eltqdgXJYKbuN0Zz44hv%2FrKZNcGZ7pu0x%2B3wnpWAcGEpZqIiQpfWmzHtIrju4IlcuOg%3D%3D"
// });