# Kopabase

A bare minimum Supabase client for everyday admin work.

## 🚀 Key Features

- **Supabase Database Table Management**
  - View all tables in your Supabase project
  - Sort, search, and select rows
  - Add, edit, and delete records
  - Multi-row selection and batch delete
  - Column sorting and search for all fields

- **Supabase Storage Management**
  - View all storage buckets in your project
  - Browse files in each bucket with a modern table UI
  - Sort, search, and select files
  - View file details: filename, size, uploaded date
  - Download/view files (with signed URLs for private buckets)
  - Delete one or multiple files with confirmation
  - Sort files by name, date, or size (client-side for size)
  - Search by filename, size, or uploaded date

- **Modern, Consistent UI/UX**
  - Responsive sidebar with collapsible Database and Storage sections
  - Sectioned layout: logo/header, database, storage, settings, disconnect
  - Table and storage file views use a unified card-based design
  - Inline search, sorting, and selection for all tables
  - Reload button for refreshing table or bucket data
  - Toast notifications for actions (save, delete, etc.)

- **Settings**
  - Configure max visibility duration for private file signed URLs
  - Settings are persisted locally and applied to all private file views

- **Extensible & Minimal**
  - Built with Next.js, React, and Supabase JS client
  - Modular component structure for easy extension
  - Minimal dependencies and easy to maintain

## 🛠️ Getting Started

1. Clone the repo and install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
2. Configure your Supabase project URL and keys in the app.
3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 📁 Project Structure

- `src/components/` — UI components (tables, storage, dialogs, sidebar, etc.)
- `src/app/` — App entry and layout
- `src/lib/` — Supabase client and utilities
- `public/` — Static assets and icons

## 💡 Why Kopabase?

- No vendor lock-in: works with any Supabase project
- Fast, clean, and focused on real admin workflows
- Open source and easy to extend

---

**Enjoy managing your Supabase project with Kopabase!**
