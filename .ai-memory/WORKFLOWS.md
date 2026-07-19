# Workflows

MEMORY_REVISION: 2026-07-19-2253-JST
NOTION_MEMORY_REVISION: 2026-07-19-2216-JST

## Bootstrap workflow

1. Fetch the live Notion page `ASYNCHRONIA - PROJECT MEMORY` in the current response.
2. Report its exact top-level `MEMORY_REV`.
3. Verify current repository primary evidence and use repository sources for implementation, runtime, and task state.
4. Treat Notion as compact cross-chat bootstrap context; use archives and backups only as historical evidence.
5. Fail closed if the canonical Notion page cannot be loaded after defined recovery paths.

Canonical page ID: `3a0815ae-752f-8139-945e-e38dfefbb111`.
Canonical URL: https://app.notion.com/p/3a0815ae752f8139945ee38dfefbb111.
The former Google Drive document is deprecated migration-stub context only.

## Revision workflow

Repository memory revisions are generated independently from the Notion `MEMORY_REV`. Keep both fields explicit and update expected child revisions consistently. Fail closed on unresolved mismatch.

## Scope workflow

Keep runtime, gameplay, UI, economy, persistence, bridge/mailbox, recovery artifacts, and Stage 6 unchanged unless a task explicitly authorizes them. Validate exact allowed paths, `git diff --check`, stale active-state references, and repository memory consistency before publication.
