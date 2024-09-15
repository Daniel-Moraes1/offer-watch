const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const { processMessageToChatGPT } = require("./chat.js");

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Your Pub/Sub webhook endpoint
app.post("/pubsub", async (req, res) => {
  try {
    const pubsubMessage = req.body.message;
    const messageData = Buffer.from(pubsubMessage.data, "base64").toString();
    const message = JSON.parse(messageData);

    // Log the Gmail message ID received in the notification
    console.log("New email notification received:", message);

    // Use the Gmail API to fetch the new email
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });

    const messages = await gmail.users.messages.list({
      userId: "me",
      maxResults: 4,
    });

    const emailId = messages.data.messages[0].id;

    const emailRes = await gmail.users.messages.get({
      userId: "me",
      id: emailId,
    });

    const headers = emailRes.data.payload.headers;
    const subjectHeader = headers.find((header) => header.name === "Subject");
    const subject = subjectHeader ? subjectHeader.value : "No Subject";

    // Fetch the body of the email
    let body = "";
    const parts = emailRes.data.payload.parts;
    if (parts) {
      const textPart = parts.find((part) => part.mimeType === "text/plain");
      if (textPart) {
        body = Buffer.from(textPart.body.data, "base64").toString();
      }
    }

    console.log(`Email Subject:\n${subject}`);
    console.log(`Email Body:\n${body}`);

    const chatResponse = await processMessageToChatGPT(subject, body);
    console.log("chatResponse:", chatResponse);

    if (chatResponse.status !== "Unrelated") {
      // send status to frontend
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error processing notification:", error);
    res.status(200).send("Error");
  }
});

// Start the Express server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Authorize function (similar to what you already have)
const fs = require("fs").promises;
const path = require("path");
const process1 = require("process");
const { authenticate } = require("@google-cloud/local-auth");

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const TOKEN_PATH = path.join(process1.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process1.cwd(), "credentials.json");

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) return client;
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) await saveCredentials(client);
  return client;
}

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

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
