import { Readable } from "node:stream";
import { google, type drive_v3 } from "googleapis";

const DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive"];

let driveClient: drive_v3.Drive | null = null;

export interface DriveUploadInput {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

export interface DriveUploadResult {
  id: string;
  viewUrl: string;
  directUrl: string;
  embedUrl: string;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function getPrivateKey(): string {
  return getRequiredEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");
}

function getDriveClient(): drive_v3.Drive {
  if (!driveClient) {
    const auth = new google.auth.JWT({
      email: getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
      key: getPrivateKey(),
      scopes: DRIVE_SCOPES
    });

    driveClient = google.drive({ version: "v3", auth });
  }

  return driveClient;
}

export async function uploadFileToDrive(input: DriveUploadInput): Promise<DriveUploadResult> {
  const drive = getDriveClient();
  const folderId = getRequiredEnv("GOOGLE_DRIVE_FOLDER_ID");
  const body = Readable.from(input.buffer);

  const uploaded = await drive.files.create({
    requestBody: {
      name: input.fileName,
      mimeType: input.mimeType,
      parents: [folderId]
    },
    media: {
      mimeType: input.mimeType,
      body
    },
    fields: "id, webViewLink"
  });

  const fileId = uploaded.data.id;

  if (!fileId) {
    throw new Error("Google Drive did not return a file id");
  }

  await drive.permissions.create({
    fileId,
    requestBody: {
      type: "anyone",
      role: "reader"
    }
  });

  return {
    id: fileId,
    viewUrl: `https://drive.google.com/file/d/${fileId}/view`,
    directUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
    embedUrl: `https://drive.google.com/file/d/${fileId}/preview`
  };
}
