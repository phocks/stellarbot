require("dotenv").config();
import { client } from "./client";
import StellarSdk from "stellar-sdk";
import to from "await-to-js";
// import fetch from "node-fetch";
const sqlite3 = require("sqlite3").verbose();
import { open } from "sqlite";
// import SQL from "sql-template-strings";
// const dayjs = require("dayjs");
import isStale from "./lib/isStale";

const DB_TABLE_NAME = "key_value";
const MINUTES_UNTIL_STALE = 30;

const accountAddress = process.env.stellar_public;
const server = new StellarSdk.Server("https://horizon.stellar.org");

const main = async () => {
  // const [verifyError, verifyResult] = await to(
  //   client.get("account/verify_credentials")
  // );

  // if (verifyError) {
  //   console.error(verifyError);
  //   return;
  // }

  // Set up local database file if it doesn't exist
  const db = await open({
    filename: "./db/database.db",
    driver: sqlite3.Database,
  });

  // Create database table if it doesn't exist
  await db.exec(
    `CREATE TABLE IF NOT EXISTS ${DB_TABLE_NAME} (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE,
      count TEXT
      )`
  );

  // Insert row if it doesn't exist
  await db.exec(
    `INSERT OR IGNORE INTO ${DB_TABLE_NAME}
    (name, count) VALUES ("paging_token", "0")`
  );

  let pagingToken: string = "0";

  const [dbError, dbResult] = await to(
    db.get(`SELECT * FROM ${DB_TABLE_NAME} WHERE name = ?`, "paging_token")
  );

  if (dbError) {
    console.error(dbError);
    return;
  } else {
    if (dbResult) {
      pagingToken = dbResult.count;

      // Override paging token (for testing)
      // pagingToken = "158281815579824129";
    }
  }

  // the JS SDK uses promises for most actions, such as retrieving an account
  const [accountError, account]: [Error | null, any] = await to(
    server.loadAccount(accountAddress)
  );

  if (accountError) {
    console.error(accountError);
    return;
  }

  console.log("Balances for account: " + accountAddress);
  account.balances.forEach(function (balance: any) {
    console.log("Type:", balance.asset_type, " Balance:", balance.balance);

    if (balance.asset_type === "native") {
      // Testing Twitter bio update
      // client
      //   .post("account/update_profile", {
      //     description: `XLM balance: ${balance.balance}`,
      //   })
      //   .then(() => {
      //     console.log("Profile updated");
      //   });
    }
  });

  // Handle streaming messages from Horizon
  const handleMessage = async function (payment: any) {
    const transaction = await payment.transaction();

    // console.dir(payment);
    // console.dir(transaction);

    pagingToken = payment.paging_token;
    const created_at: string = payment.created_at;
    const memo: string = transaction.memo;
    const transactionId = transaction.id;
    const expertUrl = `https://stellar.expert/explorer/public/tx/${transactionId}`;
    const amount = payment.amount;
    const assetType = payment.asset_type;

    // console.log(payment);
    console.log("Created at:", created_at);
    console.log("Paging token:", payment.paging_token);
    console.log("Memo:", memo);
    console.log("Amount:", amount);
    console.log("Asset type", assetType);
    console.log("Asset code", payment.asset_code);
    console.log("Transaction ID:", transactionId);

    let doTweet = true;
    if (isStale(created_at, MINUTES_UNTIL_STALE)) doTweet = false;
    if (assetType !== "native") doTweet = false;

    // Check if we want to tweet
    if (!doTweet) {
      console.log("Something is up. Don't tweet...");
    } else {
      // Tweet something here
      // We want something like:
      // Received AMOUNT Stellar Lumens from SENDER_ADDRESS with
      // memo MESSAGE url etc etc

      // Get account balance first
      let xlmBalance = "0";

      const [accountError, account]: [Error | null, any] = await to(
        server.loadAccount(accountAddress)
      );

      if (accountError) {
        console.error(accountError);
      } else {
        console.log("Balances for account: " + accountAddress);
        account.balances.forEach(function (balance: any) {
          console.log(
            "Type:",
            balance.asset_type,
            " Balance:",
            balance.balance
          );

          if (balance.asset_type === "native") {
            xlmBalance = balance.balance;
          }
        });
      }

      const [tweetError, tweetResult] = await to(
        client.post("statuses/update", {
          status: `XLM RECEIVED!!
${parseFloat(amount)} Stellar Lumens
Memo: ${memo}
Balance: ${parseFloat(xlmBalance)}
URL: ${expertUrl}`,
        })
      );
      if (tweetError) {
        console.error(tweetError);
      } else {
        console.log("Tweeted!");
        // console.log(tweetResult);
      }
    }

    console.log("---");

    // Update paging token in database
    // so we don't keep processing old messages
    await db.run(
      `UPDATE ${DB_TABLE_NAME} SET count = ? WHERE name = ?`,
      pagingToken,
      "paging_token"
    );
  };

  // Listen for transactions
  const es = server
    .payments()
    .forAccount(accountAddress)
    .cursor(pagingToken)
    .stream({
      onmessage: handleMessage,
    });

  // const tweet = await client.post("statuses/update", {
  //   status: "Hello world!!",
  //   auto_populate_reply_metadata: true,
  // });

  // console.log(tweet);
};

// RUN MAIN
main();
