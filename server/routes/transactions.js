const express = require("express");
const { getLoggedInUserId } = require("../utils");
const db = require("../db");
const { plaidClient } = require("../plaid");
const { setTimeout } = require("timers/promises");
const { SimpleTransaction } = require("../simpleTransactionObject");

const router = express.Router();


router.post("/sync", async (req, res, next) => {
  try {
    const userId = getLoggedInUserId(req);
    const items = await db.getItemIdsForUser(userId);
    console.log(items);
    const fullResults = await Promise.all(
      items.map(async (item) => await syncTransactions(item.id))
    );
    res.json({ completeResults: fullResults });
  } catch (error) {
    console.log(`Running into an error!`);
    next(error);
  }
});

/*****************************************/

// Routing to delete a transaction by its ID
router.delete('/delete/:txnId', async (req, res) => {
  const { txnId } = req.params; 

  try {
    // Calling the database function to delete the transaction
    const result = await db.deleteExistingTransaction(txnId);
    
    if (result) {
      res.status(200).json({ message: "Transaction deleted successfully." });
    } else {
      res.status(400).json({ message: "Transaction not found or failed to delete." });
    }
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Error deleting transaction." });
  }
});


/********************************************/

const fetchNewSyncData = async function (
  accessToken,
  initialCursor,
  retriesLeft = 3
) {
  const allData = {
    added: [],
    removed: [],
    modified: [],
    nextCursor: initialCursor,
  };
  if (retriesLeft <= 0) {
    console.error("Too many retries!");

    return allData;
  }
  try {
    let keepGoing = false;
    do {
      const results = await plaidClient.transactionsSync({
        access_token: accessToken,
        options: {
          include_personal_finance_category: true,
        },
        cursor: allData.nextCursor,
      });
      const newData = results.data;
      allData.added = allData.added.concat(newData.added);
      allData.modified = allData.modified.concat(newData.modified);
      allData.removed = allData.removed.concat(newData.removed);
      allData.nextCursor = newData.next_cursor;
      keepGoing = newData.has_more;
      console.log(
        `Added: ${newData.added.length} Modified: ${newData.modified.length} Removed: ${newData.removed.length} `
      );

      // if (Math.random() < 0.5) {
      //   throw new Error("SIMULATED PLAID SYNC ERROR");
      // }
    } while (keepGoing === true);
    return allData;
  } catch (error) {

    console.log(
      `Oh no! Error! ${JSON.stringify(
        error
      )} Let's try again from the beginning!`
    );
    await setTimeout(1000);
    return fetchNewSyncData(accessToken, initialCursor, retriesLeft - 1);
  }
};



const syncTransactions = async function (itemId) {
  //  Retrieving our access token and cursor from the database
  const {
    access_token: accessToken,
    transaction_cursor: transactionCursor,
    user_id: userId,
  } = await db.getItemInfo(itemId);

  const summary = { added: 0, removed: 0, modified: 0 };
  const allData = await fetchNewSyncData(accessToken, transactionCursor);

  //  Saving new transactions to the database
  await Promise.all(
    allData.added.map(async (txnObj) => {
      console.log(`I want to add ${txnObj.transaction_id}`);
      const result = await db.addNewTransaction(
        SimpleTransaction.fromPlaidTransaction(txnObj, userId)
      );
      if (result) {
        summary.added += result.changes;
      }
    })
  );

  // Updating modified transactions in our database
  await Promise.all(
    allData.modified.map(async (txnObj) => {
      console.log(`I want to modify ${txnObj.transaction_id}`);
      const result = await db.modifyExistingTransaction(
        SimpleTransaction.fromPlaidTransaction(txnObj, userId)
      );
      if (result) {
        summary.modified += result.changes;
      }
    })
  );

  //Doing something in our database with the removed transactions
  await Promise.all(
    allData.removed.map(async (txnObj) => {
      console.log(`I want to remove ${txnObj.transaction_id}`);

      const result = await db.markTransactionAsRemoved(txnObj.transaction_id);
      if (result) {
        summary.removed += result.changes;
      }
    })
  );

  console.log(`The last cursor value was ${allData.nextCursor}`);
  // Saving our cursor value to the database
  await db.saveCursorForItem(allData.nextCursor, itemId);

  console.log(summary);
  return summary;
};


router.get("/list", async (req, res, next) => {
  try {
    const userId = getLoggedInUserId(req);
    const maxCount = req.params.maxCount ?? 50;
    const transactions = await db.getTransactionsForUser(userId, maxCount);
    res.json(transactions);
  } catch (error) {
    console.log(`Running into an error!`);
    next(error);
  }
});

module.exports = { router, syncTransactions };
