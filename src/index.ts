require("dotenv").config();
import { client } from "./client";
import StellarSdk from "stellar-sdk";
import to from "await-to-js";
import fetch from "node-fetch";

const accountAddress = process.env.stellar_public;

const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");

const main = async () => {
  // const [verifyError, verifyResult] = await to(
  //   client.get("account/verify_credentials")
  // );

  // if (verifyError) {
  //   console.error(verifyError);
  //   return;
  // }

  // the JS SDK uses promises for most actions, such as retrieving an account
  const account = await server.loadAccount(accountAddress);
  console.log("Balances for account: " + accountAddress);
  account.balances.forEach(function (balance: any) {
    console.log("Type:", balance.asset_type, ", Balance:", balance.balance);
  });

  
  var lastCursor = 0; // or load where you left off

  var txHandler = function (txResponse: any) {
    console.log(txResponse);
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
