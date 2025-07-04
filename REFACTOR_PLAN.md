# Refactor Plan: Modular, Open Source Friendly Codebase

## Goal
Make the codebase modular, maintainable, and easy for contributors to extend or implement new features with minimal effort.

---

## 1. Centralize Reusable Logic and Components
- [ ] Audit all UI components and move generic ones to `src/components/ui/`
- [ ] Move business logic and utility functions to `src/lib/utils.ts` or `src/utils/`
- [ ] Refactor repeated logic in components/pages into utilities or hooks
- [ ] Ensure custom React hooks are in `src/hooks/`

## 2. Centralize Configuration, Constants, and Variables
- [ ] Create `src/config/` directory
- [ ] Move all app-wide constants to `src/config/constants.ts`
- [ ] Move dynamic/user/environment settings to `src/config/settings.ts`
- [ ] Replace hardcoded values throughout the codebase with imports from config/constants
- [ ] Use environment variables for secrets and deployment-specific values

## 3. Modularize Feature Areas
- [ ] Create a `src/features/` directory (or use `src/app/` if preferred)
- [ ] For each major feature (e.g., metrics, storage), create a dedicated folder
- [ ] Move feature-specific components, hooks, and logic into these folders
- [ ] Ensure features import shared utilities/components as needed

## 4. Improve File Naming and Structure
- [ ] Standardize file and folder naming conventions (e.g., PascalCase for components)
- [ ] Group related files (component, styles, tests) together
- [ ] Remove or merge redundant files

## 5. Documentation
- [ ] Update `README.md` to reflect new structure and contribution guidelines
- [ ] Add comments and JSDoc to complex utilities and components
- [ ] Document how to add new features or extend existing ones

## 6. Open Source Friendliness
- [ ] Add a `CONTRIBUTING.md` with clear guidelines for contributors
- [ ] Add or update `CODE_OF_CONDUCT.md`
- [ ] Ensure all dependencies are documented in `package.json` and `README.md`
- [ ] Add issue and PR templates (in `.github/` folder)

---

## Optional Improvements
- [ ] Add automated linting and formatting (ESLint, Prettier)
- [ ] Add basic test setup (Jest, React Testing Library)
- [ ] Add CI/CD configuration for PR checks

---

## How to Use This Plan
- Check off each item as you complete it
- Use this as a reference for onboarding new contributors
- Update as the project evolves 