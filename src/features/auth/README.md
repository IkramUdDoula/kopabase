# Auth Feature

This module contains all logic, components, and hooks related to authentication and user management.

## Structure
- `AuthList.tsx` — Sidebar list of users (and optionally providers/sessions)
- `AuthViewer.tsx` — Main viewer for user management in a table format
- `AddUserDialog.tsx` — Dialog for adding a new user
- `EditUserDialog.tsx` — Dialog for editing an existing user

## Usage
- Import these components from `@/features/auth/` in your dashboard or feature modules.
- All components are exported as default and are designed to be used together for a modular, maintainable auth admin experience.

## Guidelines
- Place all future auth-specific components, hooks, and utilities here.
- Keep the feature self-contained for easy extension and maintenance.
- Follow the modular pattern for symmetry with other features (e.g., database, storage). 