# 🚀 LinkVault Deployment Guide (Vercel & Netlify)

This guide shows you how to deploy **LinkVault** to **Vercel** or **Netlify** so that **different users can sign up, log in, and have their own private folders and links** that are permanently stored in the cloud.

---

## 1. Get a Free Cloud Database (Supabase or Neon)

Because Vercel and Netlify use serverless functions, local SQLite files (`dev.db`) get wiped when functions restart. A free cloud PostgreSQL database guarantees **0% data loss forever**.

### Option A: Supabase (Recommended)
1. Go to [https://supabase.com](https://supabase.com) and create a free account.
2. Click **New Project** and name it `linkvault`.
3. In Project Settings -> **Database**, copy your **Connection String (URI)** (select "NodeJS" or "Transaction pooler"):
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
   ```

### Option B: Neon Serverless Postgres
1. Go to [https://neon.tech](https://neon.tech) and create a free account.
2. Create a project and copy the connection string:
   ```
   postgresql://[USER]:[PASSWORD]@[HOST]/neondb?sslmode=require
   ```

---

## 2. Deploy to Vercel (1-Click)

1. Push your repository to **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial LinkVault release"
   git remote add origin https://github.com/YOUR_USERNAME/linkvault.git
   git push -u origin main
   ```
2. Go to [https://vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your `linkvault` repository.
4. In the **Environment Variables** section, add:
   - `DATABASE_URL`: Your Supabase or Neon PostgreSQL connection URL.
   - `JWT_SECRET`: Any random 32+ character string (e.g. `mysupersecretkeylinkvault2026!`).
5. In `prisma/schema.prisma` before deploying to Postgres, switch provider from `sqlite` to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
6. Run `npx prisma db push` once to create the tables in your cloud database.
7. Click **Deploy**!

---

## 3. How Multi-User Works

Once deployed:
- Any visitor can go to your website and click **"Sign In / Create Account"**.
- Each user gets their own completely isolated vault:
  - User A creates folders like *System Design* and saves YouTube videos.
  - User B creates folders like *Cooking Recipes* and saves Instagram reels.
  - User A and User B cannot see or alter each other's data.
- **Export & Import Vault (JSON)**: Users can download full JSON backups of their links anytime from their profile menu.
