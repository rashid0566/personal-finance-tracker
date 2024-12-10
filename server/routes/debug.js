// importing the required files
const express = require("express");
const { getLoggedInUserId } = require("../utils");
const db = require("../db");
const { plaidClient } = require("../plaid");
const {
  SandboxItemFireWebhookRequestWebhookCodeEnum,
  WebhookType,
} = require("plaid");

const router = express.Router();

//running a server code
router.post("/run", async (req, res, next) => {
  try {
    const userId = getLoggedInUserId(req);
    res.json({ status: "done" });
  } catch (error) {
    next(error);
  }
});

//function for webhook
router.post("/generate_webhook", async (req, res, next) => {
  try {
    const userId = getLoggedInUserId(req);
    const itemsAndTokens = await db.getItemsAndAccessTokensForUser(userId);
    const randomItem =
      itemsAndTokens[Math.floor(Math.random() * itemsAndTokens.length)];
    const accessToken = randomItem.access_token;
    const result = await plaidClient.sandboxItemFireWebhook({
      webhook_code:
        SandboxItemFireWebhookRequestWebhookCodeEnum.SyncUpdatesAvailable,
      access_token: accessToken,
    });
    res.json(result.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
