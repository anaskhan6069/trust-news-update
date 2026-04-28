# Trust News Documentation

## 1. Project Overview

Trust News is a production-ready news platform built with Next.js 14 App Router, Tailwind CSS, shadcn/ui-style components, NextAuth.js v5, Google Sheets, Google Drive, Nodemailer, React Query, React Context, Framer Motion, React Hook Form, Zod, Lucide React, React Icons, and next-themes.

Users can sign up with credentials, sign in with Google, submit news with image/video uploads, and wait for admin approval. Admins can review drafts, approve them into published news, or reject them.

## 2. Prerequisites

- Node.js 20 LTS or newer
- npm 10 or newer
- A Google account
- A Google Cloud project
- A Gmail account with 2-Step Verification enabled
- A Vercel account for deployment

## 3. Local Setup

```bash
cd trust-news
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Fill `.env.local` with your Google OAuth, Google service account, Google Sheets, Drive folder, admin, and SMTP values before using authentication, uploads, or database-backed pages.

## 4. Google Cloud Console Setup

1. Go to Google Cloud Console.
2. Create a new project named `Trust News`.
3. Open APIs & Services.
4. Enable these APIs:
   - Google Sheets API
   - Google Drive API
   - Gmail API
5. Create a Service Account:
   - APIs & Services → Credentials → Create Credentials → Service Account
   - Give it a clear name like `trust-news-service`
   - Create and download a JSON key
6. Copy values into `.env.local`:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` from `client_email`
   - `GOOGLE_PRIVATE_KEY` from `private_key`
7. Create OAuth 2.0 credentials:
   - Credentials → Create Credentials → OAuth Client ID
   - Application type: Web application
   - Authorized JavaScript origin: `http://localhost:3000`
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
8. Copy OAuth values into:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

For Vercel, add your production URL as an authorized origin and add:

```text
https://your-domain.com/api/auth/callback/google
```

## 5. Google Sheets Setup

Create a spreadsheet named `TrustNewsDB`.

Create exactly three sheets with these headers.

### Users

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| id | name | email | hashedPassword | provider | role | createdAt |

### Draft News

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| id | title | description | category | imageUrl | videoUrl | authorName | authorEmail | status | submittedAt | approvedAt |

### Published News

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| id | title | description | category | imageUrl | videoUrl | authorName | authorEmail | publishedAt | draftId |

Share the spreadsheet with the service account email as Editor.

Copy the spreadsheet ID from the URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

Set:

```env
GOOGLE_SHEETS_ID=SPREADSHEET_ID
```

## 6. Google Drive Setup

1. Create a Drive folder named `Trust News Uploads`.
2. Share it with the service account email as Editor.
3. Copy the folder ID from the URL:

```text
https://drive.google.com/drive/folders/FOLDER_ID
```

Set:

```env
GOOGLE_DRIVE_FOLDER_ID=FOLDER_ID
```

Uploaded files are made publicly readable by the Drive helper so images and videos can render on the site.

## 7. Gmail SMTP Setup

1. Open your Google Account security settings.
2. Enable 2-Step Verification.
3. Create an App Password for Mail.
4. Set:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_app_password
```

Admin notification emails are sent to `ADMIN_EMAIL`.

## 8. Authentication Flow

```text
Visitor opens Trust News
→ Header shows Sign In and Sign Up
→ User signs up with name, email, password
→ Password is bcrypt-hashed
→ User row is written to Users sheet
→ User signs in through NextAuth credentials provider
→ JWT session is issued for 30 days
→ Session exposes id, name, email, role
```

Google OAuth:

```text
Visitor clicks Continue with Google
→ Google OAuth consent
→ NextAuth callback receives Google profile
→ Existing user is fetched by email
→ If missing, a Users sheet row is created with provider=google
→ JWT session is issued
```

Admin:

```text
Admin opens /admin/login
→ Enters ADMIN_EMAIL and ADMIN_PASSWORD
→ Credentials provider validates env values
→ JWT session is issued with role=admin
→ /admin/dashboard becomes accessible
```

## 9. News Posting & Approval Flow

```text
Authenticated user opens /post-news
→ Completes validated form
→ Image uploads to Google Drive
→ Optional video uploads to Google Drive
→ Draft row is written to Draft News sheet
→ Nodemailer sends admin notification
→ User sees success toast
→ Admin opens dashboard
→ Admin approves draft
→ Draft row status becomes approved
→ Published News row is created with a new id
→ News appears on homepage, listing, detail, and category pages
```

Rejected drafts stay in the Draft News sheet with `status=rejected`.

## 10. Admin System Guide

Set admin credentials:

```env
ADMIN_EMAIL=admin@trustnews.com
ADMIN_PASSWORD=your_secure_password
```

Go to:

```text
/admin/login
```

Dashboard features:

- Total Published News
- Total Drafts Pending
- Total Registered Users
- Draft table with pagination
- Search by title, author, or email
- Category filter
- Approve action
- Reject action

Only sessions with `session.user.role === "admin"` can access admin APIs.

## 11. Deployment to Vercel

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Set Framework Preset to Next.js.
4. Add all environment variables from `.env.local`.
5. Set:

```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_production_secret
```

6. Add the production Google OAuth redirect URI:

```text
https://your-domain.com/api/auth/callback/google
```

7. Deploy.
8. Test:
   - Google login
   - Credentials signup
   - News submission
   - Admin approval
   - Image and video rendering

## 12. Common Issues & Troubleshooting

### Google Sheets permission denied

Share the spreadsheet with `GOOGLE_SERVICE_ACCOUNT_EMAIL` as Editor.

### Google Drive upload fails

Share the upload folder with the service account and verify `GOOGLE_DRIVE_FOLDER_ID`.

### Private key errors

Keep the private key in `.env.local` with escaped newlines:

```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Google OAuth redirect mismatch

The callback URL must match exactly:

```text
http://localhost:3000/api/auth/callback/google
```

and in production:

```text
https://your-domain.com/api/auth/callback/google
```

### Gmail SMTP authentication fails

Use a Gmail App Password, not your normal Gmail password.

### Build succeeds but pages show API errors

Check that all Google and SMTP environment variables exist in the runtime environment.

## 13. How to Add New Categories

1. Open `constants/index.ts`.
2. Add a new category object to `categories`.
3. Update the `CategorySlug` union in `types/index.ts`.
4. Use the slug in submitted or imported news rows.

Example:

```ts
{
  label: "Business",
  slug: "business",
  badgeClassName: "bg-sky-700 text-white"
}
```

## 14. How to Change Admin Credentials

Local:

```env
ADMIN_EMAIL=new-admin@example.com
ADMIN_PASSWORD=new_secure_password
```

Vercel:

1. Open Project Settings.
2. Go to Environment Variables.
3. Update `ADMIN_EMAIL`.
4. Update `ADMIN_PASSWORD`.
5. Redeploy the project.

Existing admin sessions should sign out and sign back in after credentials change.
