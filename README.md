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
  - **Unified Pinned Section:** Pin your most-used tables and storage buckets for quick access. Pinned items appear together at the top of the sidebar, above all other sections.
  - Pin/unpin any table or bucket using the star icon next to each item. Pinned items are removed from their original section and shown only in the pinned section.
  - No table or bucket is selected by default. When you first connect or if nothing is selected, a friendly welcome message is shown in the main content area.
  - Sectioned layout: logo/header, pinned, database, storage, settings, disconnect
  - Table and storage file views use a unified card-based design
  - Inline search, sorting, and selection for all tables
  - Reload button for refreshing table or bucket data
  - Toast notifications for actions (save, delete, etc.)

- **Settings**
  - Configure max visibility duration for private file signed URLs
  - Settings are persisted locally and applied to all private file views

- **Extensible & Minimal**
  - Built with Next.js, React, and Supabase JS client
  - Modular, feature-based structure for easy extension
  - Centralized config and constants
  - Minimal dependencies and easy to maintain

## 🛠️ Getting Started

1. Clone the repo and install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
2. Configure your Supabase project URL and keys in the app or via environment variables (see `src/config/settings.ts`).
3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 📁 Project Structure

- `src/app/` — App entry and layout
- `src/components/ui/` — Generic, reusable UI components
- `src/features/` — Modular feature areas (e.g., metrics, storage)
- `src/hooks/` — Custom React hooks
- `src/lib/` — Supabase client and utilities
- `src/config/` — Centralized constants and settings
- `public/` — Static assets and icons

## 🧩 Adding New Features

- Create a new folder in `src/features/` for your feature (e.g., `src/features/your-feature/`).
- Place all feature-specific components, hooks, and logic in that folder.
- Import shared UI components from `src/components/ui/` and utilities from `src/lib/` as needed.
- Add any new constants or settings to `src/config/constants.ts` or `src/config/settings.ts`.

## 🏗️ Contribution Guidelines

- Keep code modular and reusable.
- Centralize all constants and settings in `src/config/`.
- Add JSDoc/comments to complex utilities and components.
- Follow the existing file/folder naming conventions.
- See `CONTRIBUTING.md` for more details (coming soon).

## 💡 Why Kopabase?

- No vendor lock-in: works with any Supabase project
- Fast, clean, and focused on real admin workflows
- Open source and easy to extend

## 📦 Major Dependencies

- **next**: React framework for server-side rendering and static site generation
- **react, react-dom**: Core React libraries
- **@supabase/supabase-js**: Supabase client for database and storage
- **@radix-ui/react-***: Accessible, composable UI primitives
- **react-hook-form, @hookform/resolvers**: Form state management and validation
- **zod**: TypeScript-first schema validation
- **lucide-react**: Icon library
- **date-fns**: Date utility functions
- **embla-carousel-react**: Carousel/slider component
- **recharts**: Charting library
- **tailwindcss, tailwind-merge, tailwindcss-animate**: Utility-first CSS framework and helpers
- **clsx, class-variance-authority**: Conditional className utilities
- **dotenv**: Environment variable management
- **firebase, genkit, @genkit-ai/googleai, @genkit-ai/next**: AI and cloud integrations (optional/advanced)

See `package.json` for the full list and versions.

## 🔑 Configuration: Supabase Credentials

Kopabase requires your Supabase project URL and anon key to connect to your database and storage.

You can provide these credentials in one of two ways:

### 1. Environment Variables (Recommended)

Create a `.env.local` file in the project root with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

- You can find these values in your [Supabase project settings](https://app.supabase.com/project/_/settings/api).
- Restart the dev server after editing your `.env.local` file.

### 2. JSON Config (Advanced/Programmatic)

If you want to provide config programmatically (e.g., for deployment or custom environments), use this JSON structure:

```json
{
{
    "projectUrl": "your-supabase-project-url",
    "anonKey": "your-supabase-project-anon-key",
    "serviceRoleKey": "your-supabse-project-service-role-key",
    "projectName": "haalkhata admin"
  }
}
```

You can inject these values at runtime or extend the app to load them from a config file. By default, Kopabase uses environment variables as shown above.

**Required fields:**
- `supabaseUrl`: Your Supabase project URL (starts with `https://`)
- `supabaseAnonKey`: Your Supabase anon/public API key

See `src/config/settings.ts` for how these are loaded and used.

---

**Enjoy managing your Supabase project with Kopabase!**
