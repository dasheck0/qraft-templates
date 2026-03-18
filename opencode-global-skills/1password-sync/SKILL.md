---
name: 1password-sync
description: >
  Syncs local secret files (like .env, provisioning profiles, certificates, or any secret file)
  with 1Password using the `op` CLI. Handles uploading files as Secure Notes, checking for
  updates, downloading and replacing local files, and managing a project-local mapping file
  (.op-sync.json) that maps local paths to 1Password vault items — so team members can stay
  in sync. Also helps with installing the `op` CLI and signing in if needed.

  Trigger this skill whenever the user wants to move, store, sync, pull, push, check, update,
  or compare ANY file with 1Password or a vault — regardless of language or phrasing. This
  includes German phrases like "pack die .env in 1password", "secrets synchronisieren",
  "aus dem vault laden", "im vault speichern", "hat sich was geändert in 1password",
  "eintrag im vault updaten", "secrets aus 1password holen", "secrets hochladen".
  Also trigger for English: "put in 1password", "pull from vault", "sync secrets",
  "update vault entry", "check if 1password changed", "store in vault", "upload to 1password".
  Trigger proactively when ANY secret file (.env, .env.*, *.mobileprovision, *.p12, *.pem,
  *.json credentials, .op-sync.json) is mentioned together with 1Password, vault, or team
  secret sharing — even if the request is short and casual like "sync secrets bitte" or
  "check ob sich was geändert hat".
---

# 1Password Sync Skill

This skill helps sync local secret files with 1Password using the `op` CLI. Files are stored
as **Secure Notes** (entire file content as the note body). A project-local `.op-sync.json`
tracks the mappings so every team member knows which local file corresponds to which 1Password
item.

---

## Prerequisites

### Check if `op` CLI is installed

```bash
op --version
```

If not installed, help the user:

**macOS (Homebrew):**
```bash
brew install 1password-cli
```

**macOS (direct download):**
Direct the user to: https://developer.1password.com/docs/cli/get-started/

**Linux:**
```bash
# Download from: https://developer.1password.com/docs/cli/get-started/
# Or via package manager depending on distro
```

After install, verify: `op --version`

### Sign in

If the user is not signed in, help them:

```bash
# First-time setup (adds account):
op account add

# Sign in:
eval $(op signin)
```

To check if already signed in:
```bash
op whoami
```

---

## Mapping File: `.op-sync.json`

Store this file in the **project root directory**. It is Git-tracked (no secrets, only references).

**Schema:**
```json
{
  "version": 1,
  "mappings": [
    {
      "localPath": ".env",
      "vault": "MyVault",
      "account": "my-team.1password.com",
      "item": "My Project .env",
      "itemId": "abc123xyz"
    }
  ]
}
```

- `localPath` — path relative to the project root
- `vault` — 1Password vault name (ask the user if unknown)
- `account` — 1Password account (ask the user if unknown, or detect via `op account list`)
- `item` — human-readable item title in 1Password
- `itemId` — 1Password item ID (store after first create/find for reliable lookups)

**When `.op-sync.json` already exists:** Always read it first to check for existing mappings before asking the user for vault/account/item info.

---

## Detecting Vault & Account

If no mapping exists for the file yet:

1. Check context — did the user already mention a vault or account in this conversation?
2. If not, list available accounts: `op account list`
3. If multiple accounts, ask the user which one to use.
4. List vaults in the chosen account: `op vault list --account <account>`
5. If multiple vaults, ask the user which one to use.
6. Ask for the item name (suggest a sensible default based on the filename, e.g. `.env` → `"<ProjectName> .env"`).

---

## Operations

### Upload (create or update)

Upload a local file to 1Password as a Secure Note.

**Step 1: Check if mapping exists in `.op-sync.json`**

If mapping exists, go to Step 3. If not, determine vault/account/item name (see above).

**Step 2: Check if item already exists in 1Password**

```bash
op item get "<item-name>" --vault "<vault>" --account "<account>" --format json
```

- If it exists → update it (see Step 3b)
- If not → create it (see Step 3a)

**Step 3a: Create new Secure Note**

```bash
op item create \
  --category "Secure Note" \
  --title "<item-name>" \
  --vault "<vault>" \
  --account "<account>" \
  "notesPlain=$(cat <local-file>)"
```

After creation, get the item ID and save the mapping to `.op-sync.json`.

**Step 3b: Update existing Secure Note**

```bash
op item edit "<item-id-or-name>" \
  --vault "<vault>" \
  --account "<account>" \
  "notesPlain=$(cat <local-file>)"
```

**After upload:** Confirm success to the user and show the item name + vault. If `.op-sync.json` was created or updated, mention it.

---

### Download (replace local file)

Download a file from 1Password and replace the local file.

**Step 1: Find the mapping**

Check `.op-sync.json` for the file. If no mapping exists, ask the user for vault/account/item.

**Step 2: Fetch the item**

```bash
op item get "<item-id-or-name>" \
  --vault "<vault>" \
  --account "<account>" \
  --fields "notesPlain" \
  --format json
```

Parse the `value` field from the JSON response.

**Step 3: Write to local file**

Write the fetched content to the local file path, replacing it entirely.

**After download:** Confirm to the user which file was replaced and from which vault/item.

---

### Check for changes (diff)

Compare local file with 1Password version without replacing.

**Step 1:** Fetch the 1Password content (same as Download Step 2).

**Step 2:** Compare with local file content.

**Step 3:** Report to the user:
- "No changes — local file matches 1Password."
- "1Password has a newer version. Show diff? Replace local file?"
- "Local file has changes not in 1Password. Upload to sync?"

Show a brief diff if there are changes (first 30 lines of diff is enough unless user wants more).

---

### Sync check (check all mappings)

If the user asks to "sync" or "check everything", iterate all mappings in `.op-sync.json` and run the diff check for each file. Report a summary.

---

## Important Behaviors

**Always read `.op-sync.json` first** before asking the user for vault/account/item. Avoid asking for information already known.

**Never print file contents** in full to the chat unless the user explicitly asks — secret files may contain sensitive values. Show only diffs or summaries.

**Suggest `.op-sync.json` be committed** to Git after first creation: "I've created `.op-sync.json` — you should commit this so your team can use the same mappings."

**If `op` commands fail** with auth errors, suggest `eval $(op signin)` or `op signin --account <account>`. Do not retry automatically — report the error and ask the user to sign in first.

**Item naming convention:** Suggest names like `"<ProjectName> <filename>"` (e.g., `"MyApp .env"`, `"MyApp production.env"`). Let the user override.

---

## Example Interactions

**"Put our .env in 1Password"**
→ Read `.op-sync.json`, no mapping found → list accounts/vaults → ask for vault + item name → upload → save mapping → suggest commit

**"Check if the .env in 1Password changed"**
→ Read `.op-sync.json` → find mapping → fetch from 1Password → diff → report result

**"Pull the .env from 1Password"**
→ Read `.op-sync.json` → find mapping → download → replace local `.env` → confirm

**"Sync all files"**
→ Read all mappings → check each → report summary of what's in sync and what differs
