//returns the logged in user ID
const db = require("./db");

const getLoggedInUserId = function (req) {
  return req.cookies["signedInUser"];
};

module.exports = { getLoggedInUserId };
