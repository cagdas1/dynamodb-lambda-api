import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { config } from "dotenv";
import { Construct } from "constructs";
config();

class DynamoAPIStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const dynamoTable = new dynamodb.Table(this, "orders-table", {
            tableName: "orders",
            partitionKey: {name: "id", type: dynamodb.AttributeType.STRING},
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });

        const lambdaFunction = new lambda.Function(this, "lambda-function", {
            functionName: "orders",
            runtime: lambda.Runtime.NODEJS_18_X,
            code: new lambda.AssetCode("src"),
            handler: "order.handler",
            timeout: cdk.Duration.seconds(60),
            environment: {
                TABLE_NAME: dynamoTable.tableName
            }
        });

        // Grant lambdas to access dynamodb table
        dynamoTable.grantReadWriteData(lambdaFunction)

        
        //Create function urls for the lambda functions
        const cors = {
            allowedOrigins: ['*'],
        };
        const ordersURL = lambdaFunction.addFunctionUrl({authType: lambda.FunctionUrlAuthType.NONE, cors});

        new cdk.CfnOutput(this, "URLS", {
            value: ordersURL.url
        });

    }
}

const app = new cdk.App();
new DynamoAPIStack(app, "DynamoAPIStack", {
    env: {
        account: process.env.AWS_ACCOUNT_ID,
        region: process.env.AWS_REGION
    }
});