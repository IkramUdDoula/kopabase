# Kopabase

A modern admin dashboard for Supabase, built with Next.js, React, and Tailwind CSS.

## Features
- **Connect to any Supabase project** via form or JSON import
- **Securely view database tables** and records
- **Add, edit, and delete records**
- **Metrics dashboard**: Database size (live), plus placeholders for connections, API usage, storage, and more
- **All sensitive operations are performed server-side** (service_role key never exposed to frontend)
- **Beautiful, responsive UI** with custom component library

## Getting Started

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd <project-directory>
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root with:
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_REF=your-project-ref
```
- You can find these in your Supabase dashboard under Project Settings > API.

### 4. Run the development server
```bash
npm run dev
```

## Usage
- On first load, connect to your Supabase project using the form or by importing a JSON config.
- Browse and manage your tables and records.
- View live metrics (database size) and more coming soon.

## Project Structure
- `src/app/` - Next.js app directory (routing, pages, API routes)
- `src/components/` - UI and dashboard components
- `src/components/metrics/` - Metric cards (database size, etc.)
- `src/app/api/metrics/` - Secure API routes for metrics (server-side only)
- `src/lib/` - Supabase client and utilities

## Security
- The `service_role` key is **never sent to the client**. All sensitive API calls are made via server-side API routes.

## Customization
- To add a new metric, create an API route in `src/app/api/metrics/` and a card in `src/components/metrics/`. 

## License
MIT
