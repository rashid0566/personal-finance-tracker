const express = require("express");
const escape = require("escape-html");
const { v4: uuidv4 } = require("uuid");
const { getLoggedInUserId } = require("../utils");
const db = require("../db");
const bcrypt = require("bcryptjs");

const router = express.Router();

router.post("/create", async (req, res, next) => {
  try {
    const userId = uuidv4();
    const username = req.body.username;
    const password = req.body.password;

    // Hashing the password using bcrypt
    const saltRounds = 10; // Number of salt rounds for bcrypt
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(`hashed password created: ${hashedPassword}`);

    // Saving the user record with the hashed password
    const result = await db.addUser(userId, username, hashedPassword);
    console.log(`User creation result is ${JSON.stringify(result)}`);

    if (result["lastID"] != null) {
      res.cookie("signedInUser", userId, {
        maxAge: 1000 * 60 * 5, // 5 minutes
        httpOnly: true, // Preventing client-side JavaScript from accessing the cookie
      });
      return res.status(201).json(result); // Created, respond with status 201
    } else {
      return res.status(400).json({ message: "User creation failed" }); // Bad Request
    }
  } catch (error) {
    next(error);
  }
});

router.get("/list", async (req, res, next) => {
  try {
    const result = await db.getUserList();
    res.status(200).json(result); // OK, returning user list
  } catch (error) {
    next(error);
  }
});

/**********************************/

// Updated Sign-in Route
router.post("/sign_in", async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const password = req.body.password;

    // Check if the password is correct
    const isPasswordValid = await db.comparePasswords(userId, password);
    console.log(isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid user ID or password" }); // Unauthorized
    }

    // If the password is valid, set the session cookie
    res.cookie("signedInUser", userId, {
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,  // Prevents client-side JavaScript from accessing the cookie
    });

    // Respond with success
    return res.status(200).json({ signedIn: true }); // OK, sign-in successful

  } catch (error) {
    next(error);
  }
});


/************************************/

router.post("/sign_out", async (req, res, next) => {
  try {
    res.clearCookie("signedInUser");
    return res.status(200).json({ signedOut: true }); // OK, signed out successfully
  } catch (error) {
    next(error);
  }
});

/**
 * Get the id and username of our currently logged in user, if any.
 */
router.get("/get_my_info", async (req, res, next) => {
  try {
    const userId = getLoggedInUserId(req);  // Fetchs the userId from the session/cookie

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" }); // Unauthorized
    }

    const userObject = await db.getUserRecord(userId);
    if (!userObject) {
      res.clearCookie("signedInUser"); // Clears the cookie if user not found
      return res.status(404).json({ message: "User not found" }); // Not Found
    }

    res.status(200).json({ userInfo: { id: userObject.id, username: userObject.username } }); // OK, user info
  } catch (error) {
    next(error);
  }
});



router.delete("/delete", async (req, res) => {
  try {
    // Getting the logged-in user ID from session/cookie
    const userId = getLoggedInUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" }); // Unauthorized
    }

    // Fetching the user from the database
    const userObject = await db.getUserRecord(userId);
    if (!userObject) {
      return res.status(404).json({ message: "User not found" }); // Not Found
    }

    // Deleting the user's account from the database
    await db.deleteUserAccount(userId);

    // Clearing the session or cookie to log out
    res.clearCookie("signedInUser");

    // Returning success response
    return res.status(200).json({ message: "Account deleted successfully." });

  } catch (error) {
    console.error("Error deleting account:", error);
    return res.status(500).json({ message: "There was an error deleting your account." });
  }
});




module.exports = router;

