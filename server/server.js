require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const APP_PORT = process.env.APP_PORT || 8000;


// Setting up the server

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("./public"));

const server = app.listen(APP_PORT, function () {
  console.log(`Server is up and running at http://localhost:${APP_PORT}/`);
});


const usersRouter = require("./routes/users");
const linkTokenRouter = require("./routes/tokens");
const bankRouter = require("./routes/banks");
const { router: transactionsRouter } = require("./routes/transactions");
const debugRouter = require("./routes/debug");
const { getWebhookServer } = require("./webhookServer");

app.use("/server/users", usersRouter);
app.use("/server/tokens", linkTokenRouter);
app.use("/server/banks", bankRouter);
app.use("/server/transactions", transactionsRouter);
app.use("/server/debug", debugRouter);

// error handling
const errorHandler = function (err, req, res, next) {
  console.error(`Your error:`);
  console.error(err);
  if (err.response?.data != null) {
    res.status(500).send(err.response.data);
  } else {
    res.status(500).send({
      error_code: "OTHER_ERROR",
      error_message: "I got some other message on the server.",
    });
  }
};
app.use(errorHandler);

// Initializing the webhook server, too.
const webhookServer = getWebhookServer();
