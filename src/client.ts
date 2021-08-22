import Twitter from "twitter-lite";

export const client = new Twitter({
  subdomain: "api", // "api" is the default (change for other subdomains)
  version: "1.1", // version "1.1" is the default (change for other subdomains)
  consumer_key: "wUtSPmLq4rC6VSC2AyJ3muWpJ", // from Twitter.
  consumer_secret: "whUpzSaqGtB7jy4Z0d3MM8GwsTa55bWGEE9xzEeeqJr0V2lop5", // from Twitter.
  access_token_key: "1382487695302164481-Oh2o2nvs8mhiMNTRgpa8bXT5pHecqu", // from your User (oauth_token)
  access_token_secret: "1oyWOZsGGf8v0CpvSPfpXXhRaadg1OVzN8OvuygB80VUv", // from your User (oauth_token_secret)
});
