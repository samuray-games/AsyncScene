# Import provenance: 05C-R288

Restored by Claude Code (C2, 2026-11-28) from the owner-private cloud checkpoint.

- Source archive: `chat05c_r288_FULL_TXN_ROLLBACK_FINAL_20261114.zip`, 287377 bytes, SHA256 `b669b7859817fbec487ae5513a37cd8d6b77d3f439060eb7deea994f81babc37`, ZIP CRC OK.
- The original archive stays in owner-private storage and was not modified. It is not published here.
- Internal author manifest hashes were re-verified against the extracted bytes before import.
- Published: 8 files; 0 redacted (owner-private Drive file IDs replaced with `<owner-private-drive-id>`), 6 excluded (raw logs, bytecode caches, nested private archives). Exact original and published SHA256 for every file: `IMPORT_MANIFEST.json`.
- Author tests re-run on 2026-11-28 (Node 24.22.1 / CPython 3.12.10): 17/17 PASS only with the owner-private inputs present; from this public tree the suite cannot start.

The R288 tests first verify two nested owner-private archives by SHA256 (`source_readonly/chat05c_v129_original.zip` = the V129 archive imported next to this folder, and `source_readonly/chat040_r287_delta_original.zip`, a Chat04.0 R287 checkpoint). Those raw archives are intentionally not published; their hashes are listed in `IMPORT_MANIFEST.json`. To re-run, place the owner-private originals at those paths.

Status: isolated offline model/fixture only. No runtime, no D1, no Worker, no deployment. Independent critical review has NOT been performed for this code; author self-reports inside the files are not review verdicts. Not wired into the game or CI.
