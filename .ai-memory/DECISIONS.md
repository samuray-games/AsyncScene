# Decisions

MEMORY_REVISION: 2026-07-19-2253-JST
NOTION_MEMORY_REVISION: 2026-07-19-2216-JST

## Authority order

1. Latest direct user instruction.
2. Current project instructions.
3. Primary repository authority.
4. Current repository execution and canon sources.
5. Canonical Notion bootstrap.
6. Backups and archives as historical evidence.

## Cross-chat bootstrap migration

The mandatory live bootstrap is the Notion page `ASYNCHRONIA - PROJECT MEMORY`.
Page ID: `3a0815ae-752f-8139-945e-e38dfefbb111`.
URL: https://app.notion.com/p/3a0815ae752f8139945ee38dfefbb111.
The former Google Drive document is deprecated and retained only as a migration stub.

Every bootstrap must fetch the Notion page in the current response, report its exact top-level `MEMORY_REV`, verify current repository primary evidence, and use repository sources for current implementation, runtime, and task state. Fail closed if Notion cannot be loaded after defined recovery paths.

Repository memory revisions and Notion `MEMORY_REV` are separate domains and must be labeled separately.
