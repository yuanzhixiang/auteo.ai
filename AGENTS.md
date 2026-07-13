# Project Instructions

- Write all project content in English, except for documentation under `plan/`, which must be written in Chinese as specified below.
- The English requirement applies to source code, identifiers, comments, user-facing copy, documentation outside `plan/`, tests, configuration descriptions, and commit messages.

## Plan Documentation

Store all project documentation under `plan/`. Do not create legacy numbered decision directories or legacy log directories. The `plan/` directory is a source-mirrored collection of product requirements and behavioral specifications. Use it to document page and component UI/UX, API behavior, business rules, interface contracts, permission constraints, known limitations, and non-goals.

### Directory Structure

- Each subproject maintains its own `plan/` directory, whose paths mirror the source paths within that subproject.
- For file-level documentation, replace the source file extension with `.md`. For example, `src/foo/bar.ts` maps to `plan/src/foo/bar.md`.
- Align page and API route documentation with their source entry points. For example, `page.tsx` maps to `page.md`, and `route.ts` maps to `route.md`.
- Component-level documentation follows the same mirrored path convention. For example, `src/components/foo/bar.tsx` maps to `plan/src/components/foo/bar.md`.
- Document capabilities, experience guidelines, or system rules implemented by multiple files in the nearest source-mirrored `README.md`.
- Document repository-wide behavior and root-level files under the repository root `plan/` directory using the same mirrored path convention. For example, `.prettierrc.mjs` maps to `plan/.prettierrc.md`.

### Writing Rules

- Plan documents must be written in Chinese. Titles, body text, product terminology, interaction descriptions, interface logic, and limitation descriptions must all use Chinese.
- Before changing a page, component, API, product contract, business rule, or user flow, read the corresponding source-mirrored plan document.
- After requirements, interactions, interface logic, business rules, or security constraints are confirmed through discussion with AI or the team, update the most relevant source-mirrored plan document.
- A frontend `page.md` must cover the page purpose, user flow, information architecture, primary interactions, filtering, sorting, pagination behavior, loading state, empty state, error state, permission state, responsive behavior, copy guidelines, accessibility, and key UI/UX constraints.
- A frontend component `.md` must cover the component responsibility, usage scenarios, props or data inputs, visual states, interaction states, keyboard behavior, hover behavior, focus behavior, disabled behavior, loading behavior, edge cases, and composition with pages or other components.
- A backend `route.md` must cover the API purpose, request and response formats, authentication and tenant boundaries, parameter validation, core processing flow, database reads and writes, external service calls, side effects, error codes, expiration behavior, idempotency, concurrency rules, security constraints, and edge cases.
- If a feature includes both frontend and backend work, document frontend interactions and page or component UI/UX in the relevant frontend plan. Document backend APIs, data flow, detailed logic, and security constraints in the relevant API or service plan.
- Do not use `Status / Decision / Alternatives / Impact` as the primary plan template. Move historical material into sections such as `Historical Approaches`, `Deprecated Contracts`, or `Change Log`, while preserving any context that still explains the current requirements.
