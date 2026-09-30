# LinkVault 📂🔗

> A **Google Drive & Google Photos style** personal knowledge organizer for educational videos, posts, and social links with nested folders and date-wise timeline views.

---

## 🌟 Key Features

1. **Google Drive-Style Folder Hierarchy:**
   - Create root folders and nested subfolders (e.g. `Computer Science > System Design`).
   - Color code and pick custom icons for each folder.
   - Breadcrumb navigation path with direct jumping.
   - Subfolder discovery bar.

2. **Google Photos-Style Date-Wise View:**
   - Items are automatically arranged under sticky chronological date headers (**Today**, **Yesterday**, **This Week**, etc.).
   - Switch seamlessly between 3 view modes:
     - 📸 **Photos Grid**: High-density visual card grid with rich thumbnails.
     - 🗂️ **Drive Cards**: Detailed card layout with descriptions, notes, and tags.
     - ⏱️ **Timeline Stream**: Compact chronological activity stream.

3. **Smart Link Scraping & Ingestion:**
   - Paste any link (YouTube, Instagram, X/Twitter, LinkedIn, GitHub, blogs, ArXiv papers).
   - Instant OpenGraph and oEmbed metadata extraction (title, description, high-res thumbnail, author, platform badge).
   - In-app YouTube video player so you can study videos without leaving your dashboard.

4. **Search & Instant Filters:**
   - Search across link titles, URLs, notes, authors, and descriptions.
   - Filter chips for YouTube, Instagram, X/Twitter, LinkedIn, GitHub, and Web.
   - Star / Favorite your most important bookmarks.

---

## 🚀 Getting Started

### 1. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Seeding Demo Links (Optional)
If your database is empty, click **"Load Demo Links & Folders"** in the sidebar to instantly populate realistic folders and links spanning different dates!

### 3. Production Build
```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite with Prisma ORM (100% local, zero external setup needed)
- **Styling**: Tailwind CSS & Lucide React
- **Scraper**: Cheerio, OpenGraph, YouTube & Twitter oEmbed
- **Dates**: `date-fns` for relative and bucketed calendar grouping
