import { Context, Callback } from "aws-lambda";
import { validateBody } from "./lib";
import * as AWS from "aws-sdk";
import { generate } from "shortid";

const DynamoDB = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION
});

const TABLE_NAME = process.env.TABLE_NAME as string;

export async function handler(
  event: any,
  context: Context,
  callback: Callback
) {
  try {
    console.log(JSON.stringify(event));
    console.log("TABLE_NAME", TABLE_NAME);
    const httpPath = event.requestContext.http.path;
    const httpMethod = event.requestContext.http.method;

    if (httpPath === "/orders" && httpMethod === "GET") {
      console.log("GET all orders");
      const result = await DynamoDB.scan({
        TableName: TABLE_NAME,
        ConsistentRead: true,
      }).promise();
      const allOrders = result.Items;
      return callback(null, allOrders);

    } else if (httpPath === "/orders" && httpMethod === "POST") {
      const body = JSON.parse(event.body);
      console.log("ADD an order body:", body);
      const validSchema = validateBody(body);
      if (!validSchema.valid) {
        const errorMessage = validSchema.errors?.map(
          (err) => `Error validating schema: ${err.message}`
        );
        console.error("Error Validating Schema", errorMessage);
        return callback("Internal Server Error:");
      }
      const now = new Date().toISOString();
      body.createdAt = now;
      body.updatedAt = now;
      body.id = generate();
      await DynamoDB.put({
        TableName: TABLE_NAME,
        Item: body,
      }).promise();
      return callback(null, body);

    } else if (httpPath.startsWith("/orders/") && httpMethod === "PUT") {
      const id = httpPath.split("/")[2];
      if (!id) return callback("Error");
      const body = JSON.parse(event.body);
      console.log(`UPDATE an order id: ${id} body: ${body}`);
      const validSchema = validateBody(body);
      if (!validSchema.valid) {
        const errorMessage = validSchema.errors?.map(
          (err) => `Error validating schema: ${err.message}`
        );
        console.error("Error Validating Schema", errorMessage);
        return callback("Internal Server Error:");
      }
      const now = new Date().toISOString();
      const result = await DynamoDB.update({
        TableName: TABLE_NAME,
        Key: {
          id,
        },
        UpdateExpression: "SET #items = :items, updatedAt = :updatedAt",
        ExpressionAttributeNames: {
            "#items": "items"
        },
        ExpressionAttributeValues: {
          ":items": body.items,
          ":updatedAt": now as any
        },
        ReturnValues: "ALL_NEW"
      }).promise();
      const order = result.$response.data;
      return callback(null, order);

    } else if (httpPath.startsWith("/orders/") && httpMethod === "GET") {
      const id = httpPath.split("/")[2];
      if (!id) return callback("Error");
      console.log("GET an order", id);
      const result = await DynamoDB.get({
        TableName: TABLE_NAME,
        Key: {
          id,
        },
        ConsistentRead: true,
      }).promise();
      return callback(null, result.Item);

    } else if (httpPath.startsWith("/orders/") && httpMethod === "DELETE") {
      const id = httpPath.split("/")[2];
      if (!id) return callback("Error");
      console.log("DELETE an order", id);
      const result = await DynamoDB.delete({
        TableName: TABLE_NAME,
        Key: {
          id,
        }
      }).promise();
      return callback(null, result.$response.data);
    }

    return callback(null, {});
  } catch (err) {
    console.error(err);
    return callback("Internal error");
  }
}
