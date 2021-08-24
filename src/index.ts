require("dotenv").config();
import { client } from "./client";
import StellarSdk from "stellar-sdk";
import to from "await-to-js";
import fetch from "node-fetch";
const sqlite3 = require("sqlite3").verbose();
import { open } from "sqlite";
import SQL from "sql-template-strings";
const dayjs = require("dayjs");

const DB_TABLE_NAME = "key_value";

const accountAddress = process.env.stellar_public;
const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");

const main = async () => {
  let err, result;

  // Is date in the past over a certain amount of time?
  function isStale(dateString: string, minutesAgo: number = 30) {
    let now = dayjs();
    let date = dayjs(dateString);
    let diff = now.diff(date, "minute");
    return diff > minutesAgo;
  }

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

  [err, result] = await to(
    db.get(`SELECT * FROM ${DB_TABLE_NAME} WHERE name = ?`, "paging_token")
  );

  if (err) {
    console.error(err);
    return;
  } else {
    if (result) {
      pagingToken = result.count;
    }
  }

  // const result2 = await db.run(
  //   'UPDATE tbl SET col = ? WHERE col = ?',
  //   'foo',
  //   'test'
  // )

  // console.log(result2)

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
    console.log("Type:", balance.asset_type, ", Balance:", balance.balance);
  });

  var txHandler = async function (txResponse: any) {
    const result = await txResponse;
    console.log(result);
    console.log("Paging token:", result.paging_token);

    pagingToken = result.paging_token;
    const created_at: string = result.created_at;
    const memo: string = result.memo;

    // Check if not old
    if (isStale(created_at, 30)) {
      console.log("Transaction is stale. Not processing.");
    } else {
      // Tweet it out
      const [tweetError, tweetResult] = await to(
        client.post("statuses/update", {
          status: memo,
        })
      );
    }

    // Update paging token in database
    await db.run(
      `UPDATE ${DB_TABLE_NAME} SET count = ? WHERE name = ?`,
      pagingToken,
      "paging_token"
    );
  };

  // Listen for transactions
  var es = server
    .transactions()
    .forAccount(accountAddress)
    .cursor(pagingToken)
    .stream({
      onmessage: txHandler,
    });

  // const tweet = await client.post("statuses/update", {
  //   status: "Hello world!!",
  //   auto_populate_reply_metadata: true,
  // });

  // console.log(tweet);
};

// RUN MAIN
main();
