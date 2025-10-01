import { google } from "googleapis";
import fs from "fs";

const auth = new google.auth.GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/drive"],
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS
});
const drive = google.drive({ version: "v3", auth });

export async function uploadFile(name: string, mimeType: string, filePath: string, parentFolderId: string) {
  const res = await drive.files.create({
    requestBody: { name, parents: [parentFolderId], mimeType },
    media: { mimeType, body: fs.createReadStream(filePath) },
    fields: "id, webViewLink, webContentLink"
  });
  return res.data;
}
