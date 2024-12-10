const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
const crypto = require("crypto");
const bcrypt = require("bcryptjs"); // Importing bcrypt
const { SimpleTransaction } = require("./simpleTransactionObject");


const databaseFile = "./database/appdata.db";
let db;

// Setting up the database
const existingDatabase = fs.existsSync(databaseFile);
const createUsersTableSQL =
  "CREATE TABLE users (id TEXT PRIMARY KEY, username TEXT NOT NULL, password TEXT NOT NULL)";
const createItemsTableSQL =
  "CREATE TABLE items (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, " +
  "access_token TEXT NOT NULL, transaction_cursor TEXT, bank_name TEXT, " +
  "is_active INTEGER NOT_NULL DEFAULT 1, " +
  "FOREIGN KEY(user_id) REFERENCES users(id))";
const createAccountsTableSQL =
  "CREATE TABLE accounts (id TEXT PRIMARY KEY, item_id TEXT NOT NULL, " +
  "name TEXT, FOREIGN KEY(item_id) REFERENCES items(id))";
const createTransactionsTableSQL =
	"CREATE TABLE transactions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, " +
	"account_id TEXT NOT NULL, category TEXT, date TEXT, " +
	"authorized_date TEXT, name TEXT, amount REAL, currency_code TEXT, " +
	"is_removed INTEGER NOT NULL DEFAULT 0, " +
	"FOREIGN KEY(user_id) REFERENCES users(id), " +
	"FOREIGN KEY(account_id) REFERENCES accounts(id))";


dbWrapper
  .open({ filename: databaseFile, driver: sqlite3.Database })
  .then(async (dBase) => {
    db = dBase;
    try {
      if (!existingDatabase) {
       // creating database
        await db.run(createUsersTableSQL);
        await db.run(createItemsTableSQL);
        await db.run(createAccountsTableSQL);
        await db.run(createTransactionsTableSQL);
      } else {
        // Avoiding the bug where the database gets created, but the tables don't
        const tableNames = await db.all(
          "SELECT name FROM sqlite_master WHERE type='table'"
        );
        const tableNamesToCreationSQL = {
          users: createUsersTableSQL,
          items: createItemsTableSQL,
          accounts: createAccountsTableSQL,
          transactions: createTransactionsTableSQL,
        };
        for (const [tableName, creationSQL] of Object.entries(
          tableNamesToCreationSQL
        )) {
          if (!tableNames.some((table) => table.name === tableName)) {
            console.log(`Creating ${tableName} table`);
            await db.run(creationSQL);
          }
        }
        console.log("Database is up and running!");
        sqlite3.verbose();
      }
    } catch (dbError) {
      console.error(dbError);
    }
  });

const debugExposeDb = function () {
  return db;
};

const getItemIdsForUser = async function (userId) {
  const items = await db.all(
    `SELECT id FROM items WHERE user_id=? AND is_active = 1`,
    userId
  );
  return items;
};

const getItemsAndAccessTokensForUser = async function (userId) {
  const items = await db.all(
    `SELECT id, access_token FROM items WHERE user_id=? AND is_active = 1 `,
    userId
  );
  return items;
};

const getAccountIdsForItem = async function (itemId) {
  const accounts = await db.all(
    `SELECT id FROM accounts WHERE item_id = ?`,
    itemId
  );
  return accounts;
};

const confirmItemBelongsToUser = async function (possibleItemId, userId) {
  const result = await db.get(
    `SELECT id FROM items WHERE id = ? and user_id = ?`,
    possibleItemId,
    userId
  );
  console.log(result);
  if (result && result.id === possibleItemId) {
    return true;
  } else {
    console.warn(
      `User ${userId} claims to own item they don't: ${possibleItemId}`
    );
    return false;
  }
};

const deactivateItem = async function (itemId) {
  const updateResult = await db.run(
    `UPDATE items SET access_token = 'REVOKED', is_active = 0 WHERE id = ?`,
    itemId
  );
  return updateResult;
};

const addUser = async function (userId, username, password) {
  try {
  
    const result = await db.run(
      `INSERT INTO users(id, username, password) VALUES("${userId}", "${username}", "${password}")`
    );
    return result;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

const getUserList = async function () {
  const result = await db.all(`SELECT id, username FROM users`); // Excluding password from the list for security
  return result;
};

const getUserRecord = async function (userId) {
  const result = await db.get(`SELECT * FROM users WHERE id=?`, userId);
  return result;
};

const getBankNamesForUser = async function (userId) {
  const result = await db.all(
    `SELECT id, bank_name
      FROM items WHERE user_id=? AND is_active = 1`,
    userId
  );
  return result;
};

const addItem = async function (itemId, userId, accessToken) {
  const result = await db.run(
    `INSERT INTO items(id, user_id, access_token) VALUES(?, ?, ?)`,
    itemId,
    userId,
    accessToken
  );
  return result;
};

const addBankNameForItem = async function (itemId, institutionName) {
  const result = await db.run(
    `UPDATE items SET bank_name=? WHERE id =?`,
    institutionName,
    itemId
  );
  return result;
};

const addAccount = async function (accountId, itemId, acctName) {
  await db.run(
    `INSERT OR IGNORE INTO accounts(id, item_id, name) VALUES(?, ?, ?)`,
    accountId,
    itemId,
    acctName
  );
};

const getItemInfo = async function (itemId) {
  const result = await db.get(
    `SELECT user_id, access_token, transaction_cursor FROM items WHERE id=?`,
    itemId
  );
  return result;
};

const getItemInfoForUser = async function (itemId, userId) {
  const result = await db.get(
    `SELECT user_id, access_token, transaction_cursor FROM items 
    WHERE id= ? AND user_id = ?`,
    itemId,
    userId
  );
  return result;
};

// Adding a new transaction to the database

const addNewTransaction = async function (transactionObj) {
  try {
    const result = await db.run(
      `INSERT INTO transactions
    (id, user_id, account_id, category, date, authorized_date, name, amount, 
      currency_code)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
      transactionObj.id,
      transactionObj.userId,
      transactionObj.accountId,
      transactionObj.category,
      transactionObj.date,
      transactionObj.authorizedDate,
      transactionObj.name,
      transactionObj.amount,
      transactionObj.currencyCode
    );

    if (transactionObj.pendingTransactionId != null) {
    
// copying any user created valued from other transaction to this one 

    }

    return result;
  } catch (error) {
    console.log(
      `Looks like I'm encountering an error. ${JSON.stringify(error)}`
    );
    if (error.code === "SQLITE_CONSTRAINT") {
      console.log(`Maybe I'm reusing a cursor?`);
    }
  }
};

//Modifying an existing transaction in the database

const modifyExistingTransaction = async function (transactionObj) {
  try {
    const result = await db.run(
      `UPDATE transactions 
      SET account_id = ?, category = ?, date = ?, 
      authorized_date = ?, name = ?, amount = ?, currency_code = ? 
      WHERE id = ?
      `,
      transactionObj.accountId,
      transactionObj.category,
      transactionObj.date,
      transactionObj.authorizedDate,
      transactionObj.name,
      transactionObj.amount,
      transactionObj.currencyCode,
      transactionObj.id
    );
    return result;
  } catch (error) {
    console.log(
      `Looks like I'm encountering an error. ${JSON.stringify(error)}`
    );
  }
};

// marking a transaction from database as removed

const markTransactionAsRemoved = async function (transactionId) {
  try {
    const updatedId = transactionId + "-REMOVED-" + crypto.randomUUID();
    const result = await db.run(
      `UPDATE transactions SET id = ?, is_removed = 1 WHERE id = ?`,
      updatedId,
      transactionId
    );
    return result;
  } catch (error) {
    console.log(
      `Looks like I'm encountering an error. ${JSON.stringify(error)}`
    );
  }
};

// Actually deleting a transaction from the database

const deleteExistingTransaction = async function (transactionId) {
  try {
    const result = await db.run(
      `DELETE FROM transactions WHERE id = ?`,
      transactionId
    );
    // Checking if any rows were affected
    return result.affectedRows > 0;  // Returns true if transaction was deleted
  } catch (error) {
    console.log(`Error deleting transaction: ${JSON.stringify(error)}`);
    return false;  // Returns false if there was an error
  }
};


// Fetching transactions for user from the database

const getTransactionsForUser = async function (userId, maxNum) {
  const results = await db.all(
    `SELECT transactions.*,
      accounts.name as account_name,
      items.bank_name as bank_name
    FROM transactions
    JOIN accounts ON transactions.account_id = accounts.id
    JOIN items ON accounts.item_id = items.id
    WHERE transactions.user_id = ?
      and is_removed = 0
    ORDER BY date DESC
    LIMIT ?`,
    userId,
    maxNum
  );
  return results;
};

//Saving cursor to the database

const saveCursorForItem = async function (transactionCursor, itemId) {
  try {
    await db.run(
      `UPDATE items SET transaction_cursor = ? WHERE id = ?`,
      transactionCursor,
      itemId
    );
  } catch (error) {
    console.error(
      `It's a big problem that I can't save my cursor. ${JSON.stringify(error)}`
    );
  }
};


// Comparing a plaintext password with the stored password in the database

const comparePasswords = async function (userId, plainPassword) {
  try {
    const userRecord = await db.get(`SELECT password FROM users WHERE id = ?`, userId);
    
    if (!userRecord) {
      console.warn(`No user found with ID: ${userId}`);
      return false;
    }

    console.log(`Stored hashed password: ${userRecord.password}`);
    console.log(`Stored plain password: ${plainPassword}`);
    
    // Comparing the plain password with the stored hashed password
    const isValid = await bcrypt.compare(plainPassword, userRecord.password);
    console.log(`Password comparison result: ${isValid}`);
    return isValid;
  } catch (error) {
    console.error(`Error comparing passwords: ${error}`);
    return false;
  }
};




const deleteUserAccount = async function (userId) {
  try {
    // Deleting the user's transactions
    const deleteTransactionsResult = await db.run(
      `DELETE FROM transactions WHERE user_id = ?`,
      userId
    );
    console.log(`Deleted transactions for user ${userId}: ${deleteTransactionsResult.changes} row(s)`);

    // Deactivating the user's items 
    const deactivateItemsResult = await db.run(
      `UPDATE items SET is_active = 0 WHERE user_id = ?`,
      userId
    );
    console.log(`Deactivated items for user ${userId}: ${deactivateItemsResult.changes} row(s)`);

    // Deleting the user record from the 'users' table
    const deleteUserResult = await db.run(
      `DELETE FROM users WHERE id = ?`,
      userId
    );
    console.log(`Deleted user ${userId}: ${deleteUserResult.changes} row(s)`);

    // Returning a success message
    return { success: true, message: "User account deleted successfully." };

  } catch (error) {
    console.error(`Error deleting user account: ${error}`);
    throw new Error("There was an error deleting the user account.");
  }
};

module.exports = {
  debugExposeDb,
  getItemIdsForUser,
  getItemsAndAccessTokensForUser,
  getAccountIdsForItem,
  confirmItemBelongsToUser,
  deactivateItem,
  addUser,
  getUserList,
  getUserRecord,
  getBankNamesForUser,
  addItem,
  addBankNameForItem,
  addAccount,
  getItemInfo,
  getItemInfoForUser,
  addNewTransaction,
  modifyExistingTransaction,
  deleteExistingTransaction,
  markTransactionAsRemoved,
  getTransactionsForUser,
  saveCursorForItem,
  comparePasswords,
  deleteUserAccount,
};

