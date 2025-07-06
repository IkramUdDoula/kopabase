# Database Feature

This module contains all logic, components, and hooks related to database table management.

## Structure
- `TableList.tsx` — Sidebar list of database tables
- `TableViewer.tsx` — Main table viewer for CRUD operations
- `add-record-dialog.tsx` — Dialog for adding a new record
- `edit-record-dialog.tsx` — Dialog for editing an existing record

## Usage
- Import these components from `@/features/database/` in your dashboard or feature modules.
- All components are exported as default and are designed to be used together for a modular, maintainable database admin experience.

## Guidelines
- Place all future database-specific components, hooks, and utilities here.
- Keep the feature self-contained for easy extension and maintenance.
- Follow the modular pattern for symmetry with other features (e.g., storage). 