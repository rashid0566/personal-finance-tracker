//This function makes HTTP requests to the server using the CRUD method
export const callMyServer = async function (
  endpoint,
  isPost = false,
  postData = null,
  isDelete = false
) {
  const optionsObj = isPost ? { method: "POST" } : isDelete ? { method: "DELETE" } : {method: "GET"};
  if ((isPost || isDelete) && postData !== null) {
    optionsObj.headers = { "Content-type": "application/json" };
    optionsObj.body = JSON.stringify(postData);
  }
  const response = await fetch(endpoint, optionsObj);
  if (response.status === 500) {
    await handleServerError(response);
    return;
  }
  const data = await response.json();
  console.log(`Result from calling ${endpoint}: ${JSON.stringify(data)}`);
  return data;
};

//Hiding a part of html
export const hideSelector = function (selector) {
  document.querySelector(selector).classList.add("d-none");
};

//Showing part of html
export const showSelector = function (selector) {
  document.querySelector(selector).classList.remove("d-none");
};

//showing output in html
export const showOutput = function (textToShow) {
  if (textToShow == null) return;
  const output = document.querySelector("#output");
  output.textContent = textToShow;
};

//converts a category string into a more readable format
export const humanReadableCategory = function (category) {
  return category
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (s) => s.toUpperCase())
    .replace(/\b(And|Or)\b/, (s) => s.toLowerCase());
};

//formatting the currency
const formatters = {
  USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
};

//function for formatting currency amount
export const currencyAmount = function (amount, currencyCode) {
  try {
    if (formatters[currencyCode] == null) {
      formatters[currencyCode] = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
      });
    }
    return formatters[currencyCode].format(amount);
  } catch (error) {
    console.log(error);
    return amount;
  }
};

//function for handling server errors
const handleServerError = async function (responseObject) {
  const error = await responseObject.json();
  console.error("I received an error ", error);
  if (error.hasOwnProperty("error_message")) {
    showOutput(`Error: ${error.error_message} -- See console for more`);
  }
};

//resetting the UI
export const resetUI = function () {
  showOutput("");
  document.querySelector("#username").value = "";
  document.querySelector("#passwordSignIn").value = "";
  document.querySelector("#passwordCreate").value = "";
  hideSelector("#ErrorPassword");
};
