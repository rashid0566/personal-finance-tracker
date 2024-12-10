//importing functions from utils.js and client.js
import { callMyServer, showSelector, hideSelector, resetUI } from "./utils.js";
import { refreshConnectedBanks, clientRefresh } from "./client.js";

/**
 * Methods to handle signing in and creating new users. Because this is just
 * a sample, we decided to skip the whole "creating a password" thing.
 */

//Creating a new username and password and sending to server
export const createNewUser = async function () {
  const newUsername = document.querySelector("#username").value;
  const newPassword = document.querySelector("#passwordCreate").value;
  await callMyServer("/server/users/create", true, {
    username: newUsername,
    password: newPassword,
  });
  await refreshSignInStatus();
};

/**
 * Getting a list of all of our users on the server.
 */
const getExistingUsers = async function () {
  const usersList = await callMyServer("/server/users/list");
  if (usersList.length === 0) {
    hideSelector("#existingUsers");
  } else {
    showSelector("#existingUsers");
    document.querySelector("#existingUsersSelect").innerHTML = usersList.map(
      (userObj) => `<option value="${userObj.id}">${userObj.username}</option>`
    );
  }
};

// function to Sign in when the UserId and Password are correct
export const signIn = async function () {
  const userId = document.querySelector("#existingUsersSelect").value;
  const password = document.querySelector("#passwordSignIn").value;
  try {
    
    // If the password is correct, attempt to sign in
    // Calling the server's sign-in endpoint
    const response = await callMyServer("/server/users/sign_in", true, { userId: userId , password: password });
      
    if (response.signedIn) {
      await refreshSignInStatus();
    } else {
      alert("Sign-in failed. Please check your credentials.");
      showSelector("#ErrorPassword"); 
    }
  } catch (error) {
    // Handling error when incorrect password or user not found
    alert("Incorrect password or user not found. Please try again.");
  }
};

//Sign out function
export const signOut = async function () {
  await callMyServer("/server/users/sign_out", true);
  await refreshSignInStatus();
  resetUI();
};

//Refreshing the sign in status
export const refreshSignInStatus = async function () {
  const userInfoObj = await callMyServer("/server/users/get_my_info");
  const userInfo = userInfoObj.userInfo;
  if (userInfo == null) {
    showSelector("#notSignedIn");
    hideSelector("#signedIn");
    getExistingUsers();
  } else {
    showSelector("#signedIn");
    hideSelector("#notSignedIn");
    document.querySelector("#welcomeMessage").textContent = `Signed in as ${
      userInfo.username
    } (user ID #${userInfo.id.substr(0, 8)}...)`;
    await refreshConnectedBanks();

    await clientRefresh();
  }
};
