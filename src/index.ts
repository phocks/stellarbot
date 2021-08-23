require("dotenv").config();
import { client } from "./client";
import StellarSdk from "stellar-sdk";
import to from "await-to-js";
import fetch from "node-fetch";
const sqlite3 = require("sqlite3").verbose();
import { open } from "sqlite";
import SQL from "sql-template-strings";

const DB_TABLE_NAME = "key_value";

const accountAddress = process.env.stellar_public;
const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");

const main = async () => {
  let err, result;

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
    `INSERT OR IGNORE INTO ${DB_TABLE_NAME} (name, count) VALUES ("cursor", "4731829894516736")`
  );

  let lastCursor;

  [err, result] = await to(
    db.get(`SELECT * FROM ${DB_TABLE_NAME} WHERE name = ?`, "cursor")
  );

  if (err) {
    console.error(err);
    return;
  } else {
    if (result) {
      lastCursor = result.count;
    }
  }

  // const result2 = await db.run(
  //   'UPDATE tbl SET col = ? WHERE col = ?',
  //   'foo',
  //   'test'
  // )

  // console.log(result2)

  // the JS SDK uses promises for most actions, such as retrieving an account
  const account = await server.loadAccount(accountAddress);
  console.log("Balances for account: " + accountAddress);
  account.balances.forEach(function (balance: any) {
    console.log("Type:", balance.asset_type, ", Balance:", balance.balance);
  });

  var txHandler = async function (txResponse: any) {
    const result = await txResponse;
    console.log(result);
  };

  var es = server
    .transactions()
    .forAccount(accountAddress)
    .cursor(lastCursor)
    .stream({
      onmessage: txHandler,
    });

  // const pair = StellarSdk.Keypair.random();
  // console.log(pair.publicKey());
  // console.log(pair.secret());

  // const tweet = await client.post("statuses/update", {
  //   status: "Hello world!!",
  //   auto_populate_reply_metadata: true,
  // });

  // console.log(tweet);
};

// RUN MAIN
main();
