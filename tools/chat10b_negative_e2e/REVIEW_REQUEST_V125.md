# REQUIRED INDEPENDENT CRITICAL REVIEW - NOT EXECUTED

Risk: security/authorization, provenance, data integrity and terminal state semantics.

Review the **exact archive bytes** in the owner-private Chat10Б V125 Cloud Checkpoint. Review scope: only `tools/chat10b_negative_e2e/**`; all existing V123 files must retain their pinned SHA256. Inspect original manifest byte checks; confirmation that `trusted-knowledge-adapter.mjs` is not reimplemented in `test/source-chat06.test.mjs` and that directly imported original bytes are used; the distinction of real source execution vs synthetic fixture provider; verify pinned `source_vendor/chat06` SHA from original V2 checkpoint; failure on altered source; absence of network/SQL/secrets, no runtime/pass conflation; accurate SKIP labels for ACK/CAS; no Chat09Б execution without independently read back cloud original; no external proof material in logs; package contains only own test scope.

Independent reviewer must be a genuinely distinct configured `critical_reviewer`, not this conversation's own self-check. Review must pin archive SHA and manifest, include finding list and disposition, and require a separate owner GO before real server adapters, branch PR publication, D1 or deployment. No review is claimed to have occurred.

Status: `INDEPENDENT_CRITICAL_REVIEW_PENDING/ROLE_NOT_AVAILABLE_HERE`. Self-check and passing tests are not independent review.
