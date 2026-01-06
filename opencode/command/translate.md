---
description: Enforce full UI localization by fixing all untranslated content and missing translations
---

# Translate Command

You are an AI agent responsible for **fully enforcing localization correctness** in the codebase.

When this command finishes, **there must be ZERO translation issues** remaining.

This is **not optional**, **not advisory**, and **not partial**.

---

## Project Rules (Hard Requirements)

- All user-facing UI strings **MUST** be localized.
- Localization is done via the `shared-i18n` package.
- The `useTranslation` hook is located at:
  `packages/shared-i18n/src/hooks/useTranslation.ts`
- The hook returns a `t` function:

  ```ts
  t('common.cancel');
  ```

- Translation keys map to JSON files by namespace.
- Hardcoded UI strings are not allowed.

Validation scripts:

- npm run check-translations -- --only-static
- npm run check-translations

## Command Objective

After running the translate command:

✅ There are no untranslated static strings
✅ There are no missing translation keys
✅ All required locales are complete
✅ Both translation checks pass with zero errors

## Instructions for Agent

When the user runs this command, execute the following workflow exactly and in order.

1. Run Static Translation Check (Strict)
   Execute:

```bash
npm run check-translations -- --only-static
```

**If the command reports issues:**
You MUST:

- Locate every reported untranslated static string
- Replace all hardcoded UI strings with t(...)
- Add missing translation keys
- Update the correct namespace JSON files
- Ensure translations exist for all required locales

Do **not**:

- Ignore warnings
- Suppress checks
- Comment out strings
- Replace strings with placeholders like "TODO"

Repeat this step until:

```bash
npm run check-translations -- --only-static
```

passes with zero issues.

## 2. Run Full Translation Check

Execute:

```bash
npm run check-translations
```

This check includes:

- Missing translation keys
- Missing locale entries
- Structural inconsistencies

**If the command reports issues:**
You MUST:

- Add missing keys to the correct namespace
- Add missing translations for all required locales
- Fix key mismatches or invalid paths
- Preserve existing formatting and ordering conventions

Repeat this step until:

```bash
npm run check-translations
```

passes with zero issues.

## 3. Validation Gate (Mandatory)

You may ONLY finish the command if both of the following are true:

```bash
npm run check-translations -- --only-static
npm run check-translations
```

✔ Both commands pass
✔ No warnings
✔ No errors
✔ No skipped items

If this condition is not met, the command **must not complete**.

## 4. Report Results

After successful completion, provide a concise report including:

- Files updated
- Translation namespaces touched
- Keys added or modified
- Confirmation that both checks pass cleanly

Example:

```sql
✔ Static translation check: PASS
✔ Full translation check: PASS
✔ Added 6 keys to common.json
✔ Fixed 3 hardcoded UI strings in SettingsPanel.tsx
✔ All locales complete
```

## Key Naming Rules

Keys must be **semantic and stable**

- Use domain-based namespaces:
  - common.\*
  - auth.\*
  - settings.\*
  - profile.\*
- Avoid:
  - text1, label2, valueA
  - Copying entire sentences as keys
- Do not concatenate translated strings to form sentences

## Agent Behavior Rules

- Do not ask for confirmation
- Do not leave partial fixes
- Do not introduce temporary keys
- Do not ignore edge cases
- If a string cannot be safely translated, clearly explain why and propose a concrete solution
