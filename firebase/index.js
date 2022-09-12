var firebase = require("firebase-admin");

var credentials = require("./credentials.json");

firebase.initializeApp({
  credential: firebase.credential.cert(credentials),
  databaseURL: "https://support-ticket-desk.firebaseio.com",
});

module.exports = firebase;
