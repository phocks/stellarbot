require("dotenv").config();
import { client } from "./client";
import StellarSdk from "stellar-sdk";
import to from "await-to-js";
import fetch from "node-fetch";

const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");

const main = async () => {
  const [verifyError, verifyResult] = await to(
    client.get("account/verify_credentials")
  );
  if (verifyError) {
    console.error(verifyError);
    return;
  }

  // the JS SDK uses promises for most actions, such as retrieving an account
  const account = await server.loadAccount(process.env.stellar_public);
  console.log("Balances for account: " + process.env.stellar_public);
  account.balances.forEach(function (balance: any) {
    console.log("Type:", balance.asset_type, ", Balance:", balance.balance);
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
