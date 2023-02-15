### DynamoDB, Lambda API

This demo is using CDK to provision a DynamoDB table, a Lambda Function with Function URL. 
This example is using Ajv library to validate user input.

In order to deploy this stack

1- Replace AWS Account ID and Region in the `.env` file

2- Install CDK CLI -> `npm install -g aws-cdk`

3- Install packages via npm -> `npm install`

4- Install Lambda source dependencies and Build the Lambda Function Code -> `cd ./src && npm i && npm run build`

5- Change back to project root folder and deploy the stack via CDK CLI -> `cd .. && cdk deploy`

6- Lambda Function URL will appear as an output

Using CURL Command

### Create an order
curl --location --request POST 'https://xxxxxx.lambda-url.us-east-1.on.aws/orders/tCinpuxub' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "John Doe",
    "items": ["Apple", "Banana", "Water"],
    "address": "My Adress Information",
    "payment": "Cash"
}'

### Update an Order
curl --location --request PUT 'https://heic5thmray36rinedg25ispje0kprlo.lambda-url.us-east-1.on.aws/orders/tCinpuxub' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "John Doe",
    "items": ["Banana", "Apple", "Bread"],
    "address": "My Adress Information",
    "payment": "Cash"
}'

### GET All Orders
curl --location --request GET 'https://xxxxxx.lambda-url.us-east-1.on.aws/orders/' \
--header 'Content-Type: application/json' 

### Get Single Order
curl --location --request GET 'https://xxxxxx.lambda-url.us-east-1.on.aws/orders/tCinpuxub' \
--header 'Content-Type: application/json'

### Delete an Order
curl --location --request DELETE 'https://xxxxxx.lambda-url.us-east-1.on.aws/orders/tCinpuxub' \
--header 'Content-Type: application/json'


-----------
### For removing the resources used in this demo
`cdk destroy`