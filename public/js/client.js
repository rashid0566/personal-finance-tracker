//importing all the relevant files
import { startLink } from "./link.js";
import {
  createNewUser,
  refreshSignInStatus,
  signIn,
  signOut,
} from "./signin.js";
import {
  callMyServer,
  currencyAmount,
  humanReadableCategory,
  showSelector,
} from "./utils.js";

//This function involves connecting with the bank from plaid and getting the transaction data.
export const refreshConnectedBanks = async () => {
  const banksMsg = document.querySelector("#banksMsg");
  const bankData = await callMyServer("/server/banks/list");
  if (bankData == null || bankData.length === 0) {
    banksMsg.textContent = "You aren't connected to any banks yet. 🙁";
  } else if (bankData.length === 1) {
    banksMsg.textContent = `You're connected to ${
      bankData[0].bank_name ?? "unknown"
    }`;
  } else {
   
    banksMsg.textContent =
      `You're connected to ` +
      bankData
        .map((e, idx) => {
          return (
            (idx == bankData.length - 1 && bankData.length > 1 ? "and " : "") +
            (e.bank_name ?? "(Unknown)")
          );
        })
        .join(bankData.length !== 2 ? ", " : " ");
  }
  document.querySelector("#connectToBank").textContent =
    bankData != null && bankData.length > 0
      ? "Connect another bank!"
      : "Connect a bank!";

  
  const bankOptions = bankData.map(
    (bank) => `<option value=${bank.id}>${bank.bank_name}</option>`
  );

  const bankSelect = document.querySelector("#deactivateBankSelect");
  bankSelect.innerHTML =
    `<option>--Pick one--</option>` + bankOptions.join("\n");
};


//This function involves deleting a particular transaction
const deleteTransaction = async (txnId) => {
  const confirmDelete = confirm("Are you sure you want to delete this transaction?");
  if (confirmDelete) {
    console.log(`Deleting transaction with ID: ${txnId}`);
    await callMyServer(`/server/transactions/delete/${txnId}`, false, null, true);
    // After deletion, refresh the transaction list
    clientRefresh();
  }
};

//This function shows the transaction details in a table
const showTransactionData = (txnData) => {
  // Creates the table rows dynamically
  const tableRows = txnData.map((txnObj) => {
    const row = document.createElement('tr');

    // Adding cells to the row
    row.innerHTML = `
      <td>${txnObj.date}</td>
      <td>${txnObj.name}</td>
      <td>${humanReadableCategory(txnObj.category)}</td>
      <td class="text-end">${currencyAmount(txnObj.amount, txnObj.currency_code)}</td>
      <td>${txnObj.bank_name}<br/>${txnObj.account_name}</td>
    `;

    // Creating the delete button
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
    deleteButton.innerText = 'Delete';

    // Adding event listener for delete button
    deleteButton.addEventListener('click', () => {
      deleteTransaction(txnObj.id);  // Pass the transaction ID to the delete function
    });

    // Adding the button cell to the row
    const buttonCell = document.createElement('td');
    buttonCell.appendChild(deleteButton);
    row.appendChild(buttonCell);

    return row;
  });

  // Clearing the existing table content and append the new rows
  const table = document.querySelector("#transactionTable");
  table.innerHTML = '';  // Clear existing rows
  table.append(...tableRows);  // Append the newly created rows
};

//connecting to the bank
const connectToBank = async () => {
  await startLink(() => {
    refreshConnectedBanks();
  });
};

//refreshing client function
export const clientRefresh = async () => {
  const txnData = await callMyServer("/server/transactions/list?maxCount=50");
  showTransactionData(txnData);
};

//refreshing server
const serverRefresh = async () => {
  await callMyServer("/server/transactions/sync", true);
};

const generateWebhook = async () => {
  await callMyServer("/server/debug/generate_webhook", true);
};

//detactivating the bank
const deactivateBank = async () => {
  const itemId = document.querySelector("#deactivateBankSelect").value;
  if (itemId != null && itemId !== "") {
    await callMyServer("/server/banks/deactivate", true, {});
    await refreshConnectedBanks();
  }
};


// This function deletes the account
const deleteAccount = async () => {
  const confirmation = confirm("Are you sure you want to delete your account? This action cannot be undone.");
  
  if (!confirmation) {
    return; // If the user cancels nothing happens
  }

  try {
    // Making the request to delete the account
    const response = await callMyServer("/server/users/delete", false, {}, true);
    console.log(response.status)
    
    if (response.status === undefined) {
      // Account deleted successfully
      alert("Your account has been deleted successfully.");
      await signOut(); // Signing out the user after account deletion
      resetUI(); // refreshing the page
    } else {
      alert("Failed to delete account. Please try again.");
    }
  } catch (error) {
}
};

// Connecting the Delete Account button to the deleteAccount function
const deleteButton = document.querySelector("#deleteAccount");

if (deleteButton) {
  deleteButton.addEventListener("click", deleteAccount);
} else {
  console.error("Delete account button not found!");
}

// Connecting selectors to functions
const selectorsAndFunctions = {
  "#createAccount": createNewUser,
  "#signIn": signIn,
  "#signOut": signOut,
  "#connectToBank": connectToBank,
  "#serverRefresh": serverRefresh,
  "#clientRefresh": clientRefresh,
  "#generateWebhook": generateWebhook,
  "#deactivateBank": deactivateBank,
};

//function for buttons to interact
Object.entries(selectorsAndFunctions).forEach(([sel, fun]) => {
  if (document.querySelector(sel) == null) {
    console.warn(`Hmm... couldn't find ${sel}`);
  } else {
    document.querySelector(sel)?.addEventListener("click", fun);
  }
});

await refreshSignInStatus();
