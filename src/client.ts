import Twitter from "twitter-lite";

// TODO: Try checking if env is string
export const client = new Twitter({
  subdomain: "api", // "api" is the default (change for other subdomains)
  version: "1.1", // version "1.1" is the default (change for other subdomains)
  consumer_key: process.env.consumer_key || "", // from Twitter.
  consumer_secret: process.env.consumer_secret || "", // from Twitter.
  access_token_key: process.env.access_token_key || "", // from your User (oauth_token)
  access_token_secret: process.env.access_token_secret || "", // from your User (oauth_token_secret)
});
