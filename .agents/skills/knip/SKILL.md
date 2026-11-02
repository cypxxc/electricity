---
name: knip
description: Use when finding and removing unused files, unused dependencies, dead exports, unused types, or redundant enum/interface definitions in JavaScript/TypeScript/Next.js projects.
---

# Knip: Unused Code & Dependency Audit

## Overview
Knip analyzes your TypeScript/JavaScript codebase to discover unused files, unreferenced exports, unused dependencies, and dead types. It finds clutter that ESLint and TypeScript compilers overlook.

---

## Quick Reference Commands

```bash
# Run audit with Bun
bun run knip

# Run with auto-fixing (safely removes unused exports where supported)
bun run knip --fix

# Target specific areas
bun run knip --include files,dependencies,devDependencies
```

---

## Configuration (`knip.json` / `knip.ts`)
Next.js projects often have custom entry points (e.g. `scripts/`, `tests/`, migrations). Configure Knip to avoid false positives:

```json
{
  "$schema": "https://unpkg.com/knip@5/overview/config.json",
  "entry": [
    "app/**/{page,layout,loading,error,not-found,route,default}.{ts,tsx}",
    "scripts/**/*.{ts,js}",
    "tests/**/*.{ts,js}"
  ],
  "project": ["**/*.{ts,tsx,js,mjs}"],
  "ignore": ["**/*.d.ts"]
}
```

---

## Clean-up Workflow

1. **Audit Unused Files**:
   - Check if the file is truly obsolete or an entry script (e.g. test fixture, migration script).
   - If obsolete, delete using git.
   - If active script, register it under `entry` in knip config.

2. **Audit Unused Dependencies**:
   - Remove unused packages: `bun remove <package>` or `bun remove -d <package>`.

3. **Audit Unused Exports & Types**:
   - If an exported function or type is only used within its file, remove the `export` keyword.
   - If it is completely uncalled, safely delete the dead function or type.
