# Import provenance: 10B-V127

Restored by Claude Code (C2, 2026-11-28) from the owner-private cloud checkpoint.

- Source archive: `CHAT10B-V127-SOURCE-PROVENANCE-09B-REVIEW-FAIL.zip`, 72288 bytes, SHA256 `74dbff600b04fb18da88fd1df3e9fc8673c0ee359045bd7c9e28ac0ccd91f2d4`, ZIP CRC OK.
- The original archive stays in owner-private storage and was not modified. It is not published here.
- Internal author manifest hashes were re-verified against the extracted bytes before import.
- Published: 30 files; 3 redacted (owner-private Drive file IDs replaced with `<owner-private-drive-id>`), 6 excluded (raw logs, bytecode caches, nested private archives). Exact original and published SHA256 for every file: `IMPORT_MANIFEST.json`.
- Author tests re-run on 2026-11-28 (Node 24.22.1 / CPython 3.12.10): 36 tests: 31 pass, 3 fail, 2 skip — identical to the archive.

**The 3 failures are intended.** They reproduce a receipt/battle binding defect in the vendored Chat09B V123 model (see `REVIEW_V127.md`). Chat09B V128/V129 (imported separately) target receipt binding, but this 10B suite was not re-run against them. 10A has no code checkpoint in storage (plans only), so nothing was imported for 10A.

Status: isolated offline model/fixture only. No runtime, no D1, no Worker, no deployment. Independent critical review has NOT been performed for this code; author self-reports inside the files are not review verdicts. Not wired into the game or CI.
