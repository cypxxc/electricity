---
name: clean-code
description: Use when cleaning up codebases, removing dead or unused code, eliminating duplicate logic, organizing imports, improving naming and readability, reducing cognitive complexity, or enforcing coding hygiene.
---

# Clean Code & Codebase Hygiene Guide

## Overview

**Clean code is code that is easy to read, easy to understand, and easy to maintain.**

As software evolves, technical clutter accumulates: unused imports, commented-out dead code, orphaned helper files, and inconsistent naming. Following the **Boy Scout Rule** ("Always leave the code cleaner than you found it") prevents codebases from deteriorating into unmanageable legacy systems.

## The 5 Pillars of Clean Code

```
[1. Dead Code Elimination] -> [2. Intent-Revealing Naming] -> [3. Flat Flow & Low Complexity] -> [4. Single Responsibility] -> [5. Import & Module Hygiene]
```

### Pillar 1: Dead Code Elimination (Zero Tolerance)
- **Unused Files & Components**: Delete orphaned files, unreferenced components, and obsolete test fixtures immediately. Do not keep them "just in case" (Git history preserves them).
- **Unused Variables & Imports**: Remove unused parameters, variables, and imports. Let TypeScript / ESLint enforce zero unused tokens.
- **Commented-Out Code**: Never commit commented-out code blocks. If code is no longer needed, delete it.
- **Unreachable Code**: Eliminate dead conditional branches and unreachable returns.

### Pillar 2: Intent-Revealing Naming
- **Functions are Verbs**: `calculateTotalExpenditure()`, `fetchSession()`, `validateRecord()`.
- **Booleans are Predicates**: Start with `is`, `has`, `can`, `should` (e.g. `isLoading`, `hasPermission`, `isComplete`).
- **Variables are Descriptive Nouns**: Avoid cryptic abbreviations (`cnt`, `tmp`, `rec_val` -> `recordCount`, `temporaryBuffer`, `monthlyExpenditure`).
- **Consistent Domain Terminology**: Pick one term per concept and stick with it across the codebase (e.g., don't mix `user`, `account`, and `client` for the same entity).

### Pillar 3: Flat Flow & Low Cognitive Complexity
- **Early Return Guards**: Exit early on invalid inputs, missing permissions, or loading states. Avoid deep nested `if/else` ladders.
  ```typescript
  // Bad: Deep nesting
  function process(user) {
    if (user) {
      if (user.isActive) {
        if (user.hasAccess) {
          return execute();
        }
      }
    }
    return null;
  }

  // Good: Early returns
  function process(user) {
    if (!user || !user.isActive || !user.hasAccess) return null;
    return execute();
  }
  ```
- **Max Indentation Rule**: Keep functions within 1-2 levels of indentation.
- **Avoid Flag Arguments**: Passing boolean flags like `doWork(true)` often indicates the function is doing two different things. Split into two functions instead.

### Pillar 4: Single Responsibility & Small Functions
- **Do One Thing Well**: A function should perform one cohesive operation at a single level of abstraction.
- **Function Size**: Aim for functions under 20-30 lines. If a function requires scrolling to read, consider splitting it.
- **Pure Functions When Possible**: Prefer pure functions with deterministic outputs and no side effects for core business logic, calculations, and data formatting.

### Pillar 5: Import & Module Hygiene
- **Group Imports Consistently**:
  1. Framework & external libraries (e.g. `react`, `next`, `lucide-react`)
  2. Internal aliases & core services (e.g. `@/lib/...`, `@/components/...`)
  3. Local & relative utilities
- **Clean Export Surface**: Only export what is meant to be consumed by external modules. Keep internal helpers module-private.

## Clean Code Checklist Before Submitting Code

- [ ] All unreferenced files and unused imports removed.
- [ ] No commented-out code blocks remaining.
- [ ] Variable and function names clearly express business intent.
- [ ] No deep indentation (3+ levels); early returns applied.
- [ ] Lint check passes: `bun run lint` or `npm run lint`.
- [ ] Build & tests pass cleanly: `bun test && bun run build`.
