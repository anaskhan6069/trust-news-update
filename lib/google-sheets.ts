import { google, type sheets_v4 } from "googleapis";
import { v4 as uuidv4 } from "uuid";
import type {
  AppUser,
  CategorySlug,
  DashboardStats,
  DraftNewsItem,
  DraftNewsWithRow,
  NewsItem,
  NewsStatus,
  UserRole
} from "@/types";
import { normalizeCategory } from "@/lib/utils";

const SHEETS_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const USERS_RANGE = "Users!A2:G";
const DRAFT_RANGE = "'Draft News'!A2:K";
const PUBLISHED_RANGE = "'Published News'!A2:J";

let sheetsClient: sheets_v4.Sheets | null = null;

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

function getSheetsClient(): sheets_v4.Sheets {
  if (!sheetsClient) {
    const auth = new google.auth.JWT({
      email: getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
      key: getPrivateKey(),
      scopes: SHEETS_SCOPES
    });

    sheetsClient = google.sheets({ version: "v4", auth });
  }

  return sheetsClient;
}

function getSpreadsheetId(): string {
  return getRequiredEnv("GOOGLE_SHEETS_ID");
}

function normalizeRows(values: unknown[][] | null | undefined): string[][] {
  return (values ?? []).map((row) => row.map((cell) => String(cell ?? "")));
}

async function getRows(range: string): Promise<string[][]> {
  const response = await getSheetsClient().spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range
  });

  return normalizeRows(response.data.values);
}

async function appendRow(range: string, values: string[]): Promise<void> {
  await getSheetsClient().spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [values]
    }
  });
}

async function updateRange(range: string, values: string[][]): Promise<void> {
  await getSheetsClient().spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values
    }
  });
}

function mapUser(row: string[]): AppUser {
  return {
    id: row[0] ?? "",
    name: row[1] ?? "",
    email: row[2] ?? "",
    hashedPassword: row[3] ?? "",
    provider: row[4] === "google" ? "google" : "credentials",
    role: row[5] === "admin" ? "admin" : "user",
    createdAt: row[6] ?? ""
  };
}

function mapDraft(row: string[], rowNumber: number): DraftNewsWithRow {
  return {
    id: row[0] ?? "",
    title: row[1] ?? "",
    description: row[2] ?? "",
    category: normalizeCategory(row[3] ?? "other"),
    imageUrl: row[4] ?? "",
    videoUrl: row[5] ?? "",
    authorName: row[6] ?? "",
    authorEmail: row[7] ?? "",
    status: normalizeStatus(row[8] ?? "draft"),
    submittedAt: row[9] ?? "",
    approvedAt: row[10] ?? "",
    rowNumber
  };
}

function mapPublished(row: string[]): NewsItem {
  return {
    id: row[0] ?? "",
    title: row[1] ?? "",
    description: row[2] ?? "",
    category: normalizeCategory(row[3] ?? "other"),
    imageUrl: row[4] ?? "",
    videoUrl: row[5] ?? "",
    authorName: row[6] ?? "",
    authorEmail: row[7] ?? "",
    publishedAt: row[8] ?? "",
    draftId: row[9] ?? ""
  };
}

function normalizeStatus(status: string): NewsStatus {
  if (status === "approved" || status === "rejected") {
    return status;
  }

  return "draft";
}

export async function getUsers(): Promise<AppUser[]> {
  const rows = await getRows(USERS_RANGE);
  return rows.filter((row) => row[0]).map(mapUser);
}

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  const normalizedEmail = email.toLowerCase();
  const users = await getUsers();
  return users.find((user) => user.email.toLowerCase() === normalizedEmail) ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  hashedPassword: string;
  provider: "credentials" | "google";
  role?: UserRole;
}): Promise<AppUser> {
  const now = new Date().toISOString();
  const user: AppUser = {
    id: uuidv4(),
    name: input.name,
    email: input.email.toLowerCase(),
    hashedPassword: input.hashedPassword,
    provider: input.provider,
    role: input.role ?? "user",
    createdAt: now
  };

  await appendRow("Users!A:G", [
    user.id,
    user.name,
    user.email,
    user.hashedPassword,
    user.provider,
    user.role,
    user.createdAt
  ]);

  return user;
}

export async function upsertGoogleUser(input: { name: string; email: string }): Promise<AppUser> {
  const existing = await findUserByEmail(input.email);

  if (existing) {
    return existing;
  }

  return createUser({
    name: input.name,
    email: input.email,
    hashedPassword: "",
    provider: "google",
    role: "user"
  });
}

export async function getPublishedNews(): Promise<NewsItem[]> {
  const rows = await getRows(PUBLISHED_RANGE);
  return rows
    .filter((row) => row[0])
    .map(mapPublished)
    .sort((first, second) => new Date(second.publishedAt).getTime() - new Date(first.publishedAt).getTime());
}

export async function getPublishedNewsById(id: string): Promise<NewsItem | null> {
  const news = await getPublishedNews();
  return news.find((item) => item.id === id) ?? null;
}

export async function queryPublishedNews(input: {
  category?: CategorySlug;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ news: NewsItem[]; total: number; page: number; limit: number; hasMore: boolean }> {
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.max(1, Math.min(input.limit ?? 9, 50));
  const search = input.search?.trim().toLowerCase();

  let filteredNews = await getPublishedNews();

  if (input.category) {
    filteredNews = filteredNews.filter((item) => item.category === input.category);
  }

  if (search) {
    filteredNews = filteredNews.filter((item) => {
      const haystack = `${item.title} ${item.description} ${item.authorName}`.toLowerCase();
      return haystack.includes(search);
    });
  }

  const total = filteredNews.length;
  const start = (page - 1) * limit;
  const news = filteredNews.slice(start, start + limit);

  return {
    news,
    total,
    page,
    limit,
    hasMore: start + limit < total
  };
}

export async function getRelatedNews(input: {
  id: string;
  category: CategorySlug;
  limit?: number;
}): Promise<NewsItem[]> {
  const news = await getPublishedNews();
  return news.filter((item) => item.id !== input.id && item.category === input.category).slice(0, input.limit ?? 3);
}

export async function createDraftNews(input: {
  title: string;
  description: string;
  category: CategorySlug;
  imageUrl: string;
  videoUrl?: string;
  authorName: string;
  authorEmail: string;
}): Promise<DraftNewsItem> {
  const draft: DraftNewsItem = {
    id: uuidv4(),
    title: input.title,
    description: input.description,
    category: input.category,
    imageUrl: input.imageUrl,
    videoUrl: input.videoUrl ?? "",
    authorName: input.authorName,
    authorEmail: input.authorEmail,
    status: "draft",
    submittedAt: new Date().toISOString(),
    approvedAt: ""
  };

  await appendRow("'Draft News'!A:K", [
    draft.id,
    draft.title,
    draft.description,
    draft.category,
    draft.imageUrl,
    draft.videoUrl,
    draft.authorName,
    draft.authorEmail,
    draft.status,
    draft.submittedAt,
    draft.approvedAt
  ]);

  return draft;
}

export async function getDraftNews(): Promise<DraftNewsWithRow[]> {
  const rows = await getRows(DRAFT_RANGE);
  return rows.filter((row) => row[0]).map((row, index) => mapDraft(row, index + 2));
}

export async function getPendingDrafts(): Promise<DraftNewsWithRow[]> {
  const drafts = await getDraftNews();
  return drafts
    .filter((draft) => draft.status === "draft")
    .sort((first, second) => new Date(second.submittedAt).getTime() - new Date(first.submittedAt).getTime());
}

export async function getDraftById(id: string): Promise<DraftNewsWithRow | null> {
  const drafts = await getDraftNews();
  return drafts.find((draft) => draft.id === id) ?? null;
}

export async function approveDraftNews(id: string): Promise<NewsItem> {
  const draft = await getDraftById(id);

  if (!draft) {
    throw new Error("Draft not found");
  }

  if (draft.status !== "draft") {
    throw new Error("Draft has already been processed");
  }

  const approvedAt = new Date().toISOString();
  const published: NewsItem = {
    id: uuidv4(),
    title: draft.title,
    description: draft.description,
    category: draft.category,
    imageUrl: draft.imageUrl,
    videoUrl: draft.videoUrl,
    authorName: draft.authorName,
    authorEmail: draft.authorEmail,
    publishedAt: approvedAt,
    draftId: draft.id
  };

  await updateRange(`'Draft News'!I${draft.rowNumber}:K${draft.rowNumber}`, [["approved", draft.submittedAt, approvedAt]]);
  await appendRow("'Published News'!A:J", [
    published.id,
    published.title,
    published.description,
    published.category,
    published.imageUrl,
    published.videoUrl,
    published.authorName,
    published.authorEmail,
    published.publishedAt,
    published.draftId
  ]);

  return published;
}

export async function rejectDraftNews(id: string): Promise<void> {
  const draft = await getDraftById(id);

  if (!draft) {
    throw new Error("Draft not found");
  }

  if (draft.status !== "draft") {
    throw new Error("Draft has already been processed");
  }

  await updateRange(`'Draft News'!I${draft.rowNumber}`, [["rejected"]]);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [news, drafts, users] = await Promise.all([getPublishedNews(), getPendingDrafts(), getUsers()]);

  return {
    totalPublished: news.length,
    pendingDrafts: drafts.length,
    registeredUsers: users.length
  };
}
