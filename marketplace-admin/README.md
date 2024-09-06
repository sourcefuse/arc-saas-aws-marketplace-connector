# AWS Marketplace - Serverless integration for SaaS products
This project provides example of serverless integration for SaaS products listed on the AWS Marketplace.

# Project Structure
The sample in this repository demonstrates how to use AWS Serverless to integrate your SaaS product with AWS Marketplace and how to perform:
- [Setup Product on AWS Marketplace](#setup-market-place)
- [Register a New Customers](#register-new-customers)
- [Grant and Revoke access to your product](#grant-and-revoke-access-to-your-product)
- [Metering for usage](#metering-for-usage)
- [Deploying the sample application using Serverless CLI](#deploying-code)
- [Admin APIs](#admin-apis)
- [Architecture Diagram](#architecture-diagram)

## Setup Market Place
To set up your product on AWS Marketplace, you need to create a product and configure it with the following details
1. Product logo URL (Public bucket Logo URL).
2. Legal Information for End User(EULA).
3. User Registration URL(fulfilment URL).
4. Metadata about product.
5. Support information for product(Refund Policy).
6. AWS Accounts and Countries whitelisting.

## Register new Customers
With SaaS subscriptions and SaaS contracts, your customers subscribe to your products through AWS Marketplace, but access the product on environment you manage in your AWS account. After subscribing to the product, your customer is directed to a website you create and manage as a part of your SaaS product to register their account and conﬁgure the product.

When creating your product, you provide a URL to your registration landing page. AWS Marketplace uses that URL to redirect customers to your registration landing page after they subscribe. On your software's registration URL, you collect whatever information is required to create an account for the customer. AWS Marketplace recommends collecting your customer’s email addresses if you plan to contact them through email for usage notifications.

The registration landing page needs to be able to identify and accept the x-amzn-marketplace-token token in the form data from AWS Marketplace with the customer’s identiﬁer for billing. It should then pass that token value to the AWS Marketplace Metering Service and AWS Marketplace Entitlement Service APIs to resolve for the unique customer identiﬁer and corresponding product code.

## Grant and revoke access to your product

  ### Grant access to new subscribers
  Once the resolveCustomer endpoint return successful response, the SaaS vendors must to provide access to the solution to the new subscriber. 
  
  Based on the type of listing contract or subscription we have defined different conditions in the `grant-revoke-access-to-product.js` stream handler that is executed on adding new or updating existing rows.

  In our implementation the Marketplace Tech Admin (The email address you have entered when deploying), will receive email when new environment needs to be provisioned or existing environment needs to be updated. AWS Marketplace strongly recommends automating the access and environment management which can be achieved by modifying the `grant-revoke-access-to-product.js` function.

  The property successfully subscribed is set when successful response is returned from the SQS entitlement handler for SaaS Contract based listings or after receiving **subscribe-success message from the Subscription SNS Topic in the case of AWS SaaS subscriptions in the `subscription-sqs-handler.js`.


  ### Update entitlement levels to new subscribers (SaaS Contracts only)
  Each time the entitlement is update we receive message on the SNS topic. 
  The lambda function `entitlement-sqs.js` on each message is calling the marketplaceEntitlementService and storing the response in the dynamoDB.

  We are using the same DynamoDB stream to detect changes in the entailment for SaaS contracts. When the entitlement is update notification is sent to the `MarketplaceTechAdmin`.

  ### Revoke access to customers with expired contracts and cancelled subscriptions 
  The revoke access logic is implemented in a similar manner as the grant access logic. 

  In our implementation the `MarketplaceTechAdmin` receives email when the contract expires or the subscription is cancelled. 
  AWS Marketplace strongly recommends automating the access and environment management which can be achieved by modifying the `grant-revoke-access-to-product.js` function.

## Deploying Code
To setup and deploy code follow below step.
1. Install AWS CLI and configure a profile.
2. Install Serverless
3. Update config in Parameter Store.
4. Run below command inside node-code folder to get the config.
    ```javascript
    npm run make-config
    ```
5. Run below command to deploy the code
  ```bash
  sls deploy
  ```

## Admin APIs
Below are the apis available for admin to update product & offer information.
The host/method and auth is common to all APIs

```javascript
  HOST:-    /admin
  Method:-  Post
  Auth:-    private
```

  ### Product API
  - **Get Product Detail By Id**
    This api will return the product details by productId, ([Sample Payload](./node-code/events/get_product_details_by_id.json)) 
  - **Update Product Details**
    This api will update the product details, ([Sample Payload](./node-code/events/update_product_details.json)) 
  - **Update fulfilment**
    This api will update the fulfilment URL of product, ([Sample Payload](./node-code/events/update_fulfilment.json)) 
  - **Update AWS Allowed Account** 
    This api will update allowed aws account for a product, ([Sample Payload](./node-code/events/update_allowed_aws_account.json)) 
  - **Release Product**
  - **Add Tags**
    This api will add new tags to a product visibility, ([Sample Payload](./node-code/events/add_tags.json)) 
  - **Delete Tags**
    This api will delete existing tags to a product, ([Sample Payload](./node-code/events/delete_tags.json)) 

  ### Offer API.
  - **Get Offer Details By ID**
    This api will get the offer details by offer id, ([Sample Payload](./node-code/events/get_offer_details_by_id.json))
  - **Get Offer Id by Product Id** 
    This api will get offer id by product id, ([Sample Payload](./node-code/events/get_offer_details_by_id.json))
  - **Update Legal Term**
    This api will update the legal terms in public offer.
    Events:-
      1. Standard EULA ([Sample Payload](./node-code/events/update_legal_term_standard_eula.json))
      2. Custom EULA ([Sample Payload](./node-code/events/update_legal_term_custom_eula.json))
  - **Update Support Term**
    This api will update the refund policy of a product.
      1. Refund Policy ([Sample Payload](./node-code/events/update_support_term.json))
  - **Update Offer Availability By Country**
    This api will update list of countries by availability, ([Sample Payload](./node-code/events/update_support_term.json))
  - **Update Offer Information**
  - **Release Offer**


## Architecture Diagram
![](./misc/marketplace.jpg)

# Functions Created
Below are the list of function created for integration of **AWS Marketplace**.

  1. **RedirectToRegister(register.js)**
    This is a edge lambda used for redirect user to registration form.

  2. **GrantRevokeAccess(grant-revoke-access-to-product.js)**
    This function get triggerd via DynamoDB Stream to evaluate request type of
    - User Subscribe
    - Entitlement Updated
    - User Unsubscribe

  3. **SubscribeUser(subscribe-user.js)**
    This function will save user data in DDB recieved via form either filled by user or recieved from AWS Marketplace.

  4. **SetupResources(setup-resources.js)**
    This function will listen the SupportSNS Topic, send email to support admin and will start setup the environment.
    This function notify admin on any entitlement updated and will setup the resources if required OR send notificaion to any other SNS/SQS/EventBridge to notify.

  5. **Entitlement(entitlement-sqs.js)**
    This function listen SQS Queue to get data when a user change the contract, subscribe or unsubscribe.

  6. **MeteringHourlyJob(meteringHourlyJob.js)**
    This function is called via cloudwatch event to send ussage of resources to AWS Marketplace Hourly. 

  7. **AdminJobs(admin.js)**
    This function is used to do admin related jobs like
    - Get Product Details
    - Get Offer Details
    - Update fulfilment URL.
    - Update product info.
    - Update allowed aws accounts.
    - Create Offer.
    - Update allowed Countries.
    - Update Support Terms.
    - Update Legal Terms.

# Resource Created
  1. SAAS Product on AWS Marketplace
  2. API Gateway
  3. Lambda Functions
  4. Dynamodb Tables
  5. SQS
  6. SNS
  7. S3 Bucket
  8. Cloudwatch Event

