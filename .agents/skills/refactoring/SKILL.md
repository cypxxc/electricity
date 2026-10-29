---
name: refactoring
description: Use when restructuring existing code without altering external behavior, addressing code smells, simplifying complex logic, extracting functions or components, splitting large files, or preparing code for new features.
---

# Code Refactoring Guide

## Overview

**Refactoring is the process of changing a software system in such a way that it does not alter the external behavior of the code yet improves its internal structure.**

Refactoring reduces technical debt, eliminates code smells, and makes future development significantly faster, safer, and more maintainable.

## The Iron Law of Refactoring

```
NEVER COMBINE REFACTORING WITH NEW FEATURES OR BUG FIXES IN THE SAME COMMIT.
```

If you change observable behavior while refactoring, you are not refactoring; you are altering functionality. Always separate structural changes from behavioral changes.

## When to Use

- Improving readability, maintainability, or testability of existing code.
- Eliminating code smells (Long Function, God Component, Feature Envy, Primitive Obsession, Deep Nesting).
- Extracting reusable hooks, utilities, or component primitives.
- Decomposing large monolithic modules into single-responsibility units.
- Preparing a codebase for an upcoming feature (Make the change easy, then make the easy change).

## The 4-Step Refactoring Cycle

```
[1. Verify Baseline] -> [2. Identify Smell] -> [3. Atomic Refactor Move] -> [4. Re-Verify & Commit]
```

### Step 1: Verify Baseline (Safety Net)
Before touching any code:
1. Run the test suite: `bun test` or `npm test`.
2. Ensure all tests pass.
3. If tests are missing or coverage is inadequate, write characterization tests first to capture current behavior.

### Step 2: Identify Specific Code Smells
- **Long Function / God Component**: Function exceeds 30-40 lines or does multiple unrelated tasks.
- **Deep Nesting (Arrowhead Anti-Pattern)**: Nested `if`, `else`, `switch`, loops exceeding 2-3 levels.
- **Primitive Obsession**: Passing around multiple related primitives instead of an object or type.
- **Duplicate Logic (DRY Violation)**: Same calculation, query, or transformation repeated across files.
- **Feature Envy**: A function accesses data and methods of another module more than its own.
- **Divergent Change**: A single file has to be modified for multiple unrelated reasons.

### Step 3: Execute Atomic Refactoring Moves
Apply standard Fowler refactoring techniques one at a time:

1. **Extract Function / Custom Hook**:
   - Pull contiguous logic with a clear single purpose into a named helper function or React hook.
   - Example: Extract complex calculation logic out of UI component render into a pure utility function.

2. **Replace Nested Conditionals with Guard Clauses (Early Return)**:
   - Flatten nested `if (...) { ... }` blocks by checking error/edge conditions first and returning immediately.

3. **Introduce Parameter Object / Interface**:
   - When a function takes 4+ arguments: bundle them into a structured typed options object.

4. **Replace Magic Numbers / Strings with Named Constants or Enums**:
   - Convert hardcoded literals into self-documenting constants or typed unions.

5. **Decompose Conditional / Lookup Table**:
   - Replace complex `if/else if/else if` chains with a `Map` or Record lookup object.

### Step 4: Re-Verify & Commit
- Run tests and linter immediately: `bun test && bun run build`.
- Confirm 0 regression.
- Commit the atomic refactor move with a clear commit message:
  `refactor(scope): extract formatCurrency helper from records table`

## Red Flags & Anti-Patterns to Avoid

| Anti-Pattern | Correct Approach |
|---|---|
| "Big Bang" refactoring that touches 30 files at once | Small, atomic steps that can be reviewed and rolled back independently |
| Changing business logic while refactoring | Refactor first, verify green, then add/change feature in a separate step |
| Refactoring code that has zero test coverage | Write tests first (characterization tests) before modifying structure |
| Over-abstracting for hypothetical future needs (YAGNI) | Refactor for clarity and current needs, not speculative futures |
