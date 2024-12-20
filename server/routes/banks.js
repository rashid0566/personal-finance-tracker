//importing the required files
const express = require("express");
const db = require("../db");
const { getLoggedInUserId } = require("../utils");
const { plaidClient } = require("../plaid");

const router = express.Router();

//getting list of the logged in user ids
router.get("/list", async (req, res, next) => {
  try {
    const userId = getLoggedInUserId(req);
    const result = await db.getBankNamesForUser(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

//function for deactivating the bank
router.post("/deactivate", async (req, res, next) => {
  try {
    const itemId = req.body.itemId;
    const userId = getLoggedInUserId(req);
    const { access_token: accessToken } = await db.getItemInfoForUser(
      itemId,
      userId
    );
    await plaidClient.itemRemove({
      access_token: accessToken,
    });
    await db.deactivateItem(itemId);

    res.json({ removed: itemId });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
