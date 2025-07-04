# Contributing to Kopabase

Thank you for your interest in contributing! We welcome all improvements, bug fixes, and new features.

## 🧩 How to Contribute

1. **Fork the repository** and create your branch from `master`.
2. **Follow the modular structure:**
   - Place new features in `src/features/<your-feature>/`.
   - Use `src/components/ui/` for generic UI components.
   - Add custom hooks to `src/hooks/`.
   - Add utilities to `src/lib/`.
   - Centralize all constants and settings in `src/config/`.
3. **Code style:**
   - Use consistent naming (PascalCase for components, camelCase for hooks, UPPER_SNAKE_CASE for constants).
   - Add JSDoc/comments to complex utilities and components.
   - Keep code modular and reusable.
4. **Configuration:**
   - Add new constants to `src/config/constants.ts`.
   - Add new settings or environment variables to `src/config/settings.ts`.
5. **Testing:**
   - Test your changes locally before submitting a PR.
   - Add tests if possible (test setup coming soon).
6. **Pull Requests:**
   - Describe your changes clearly in the PR description.
   - Reference related issues if applicable.
   - Ensure your branch is up to date with `master`.

## 🏗️ Adding New Features
- Create a new folder in `src/features/` for your feature.
- Place all feature-specific components, hooks, and logic in that folder.
- Import shared UI components from `src/components/ui/` and utilities from `src/lib/` as needed.
- Add any new constants or settings to `src/config/constants.ts` or `src/config/settings.ts`.

## 💬 Communication
- Use GitHub Issues for bug reports and feature requests.
- Be respectful and follow the [Code of Conduct](CODE_OF_CONDUCT.md).

---

Thank you for helping make Kopabase better! 