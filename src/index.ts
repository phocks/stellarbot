require("dotenv").config();
import { client } from "./client";
import StellarSdk from "stellar-sdk";
import to from "await-to-js";

const main = async () => {
  const [verifyError, verifyResult] = await to(
    client.get("account/verify_credentials")
  );
  if (verifyError) {
    console.error(verifyError);
    return;
  }

  const pair = StellarSdk.Keypair.random();
  console.log(pair.publicKey());
  // const tweet = await client.post("statuses/update", {
  //   status: "Hello world!!",
  //   auto_populate_reply_metadata: true,
  // });

  // console.log(tweet);
};

// RUN MAIN
main();
