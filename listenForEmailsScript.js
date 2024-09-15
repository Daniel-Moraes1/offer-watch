const fs = require("fs").promises;
const path = require("path");
const process1 = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process1.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process1.cwd(), "credentials.json");

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listLabels(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.labels.list({
    userId: "me",
  });
  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    console.log("No labels found.");
    return;
  }
  console.log("Labels:");
  labels.forEach((label) => {
    console.log(`- ${label.name}`);
  });
}

const setWatch = async (auth) => {
  const gmail = google.gmail({ version: "v1", auth });

  // const APPLICATION_ID = "ai-application-t-1726336195973";
  const APPLICATION_ID = "ai-application-tracker-2";
  const TOPIC_ID = "ApplicationTracking";

  // end the existing watch
  await gmail.users
    .stop({
      userId: "me",
    })
    .catch((err) => {
      console.log(err);
    });

  // set a new watch
  const res = await gmail.users
    .watch({
      userId: "me", // me or email address
      requestBody: {
        labelIds: ["INBOX"],
        topicName: `projects/${APPLICATION_ID}/topics/${TOPIC_ID}`, // Replace with your Pub/Sub topic
      },
    })
    .catch((err) => {
      console.log(err);
    });
  console.log("Watch response:", res.data);
};

authorize().then(listLabels).catch(console.error);

authorize().then(setWatch).catch(console.error);
