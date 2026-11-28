# Chat05C R288 - application-level full-transaction rollback

Atom: CHAT05C-R288-SECURITY-ABORT-FULL-TXN-ROLLBACK

Scope: this isolated directory only. Upstream owner-private source ZIPs are copied exactly without modification. Proposed transaction handler tests the proven `RAISE(ABORT)` weakness of the original Chat04.0 R287 SQL trigger while leaving that trigger, the original Chat05C V129 `TerminalSeam.commit()`, common D1 and Worker untouched.

V129 real isolated entrypoint is `bridge.py:183` `TerminalSeam.commit()` (`BEGIN IMMEDIATE`, own exception handler with explicit `ROLLBACK`). The R287 negative case used its own raw connection and caught `sqlite3.IntegrityError`, then committed unrelated security-effective writes. R288 will add a distinct fail-closed callback transaction boundary for such operations. This is not a production Worker handler and MUST NOT be treated as a native D1 guarantee.

Sources: V129 SHA256 29c92ba922d92925a1efdda0e9b747b353e490a68bbf8e060f728e69cb75fa06; R287 delta SHA256 3bbab702f7c65d40df47827e275a4482ab570cc2dc0dd743396255dcd14bd450; exact original R287 nested SHA256 f07f1f60d0043cf33829af3cf5423b967a050af42672a90b834c3753dda57d19.

Original migration 0011 durability remains UNKNOWN; original 0011 and Chat05Б's 0012 are not changed. No real issuer, external witness, independent critical reviewer, hosted or native D1, production or PXX acceptance.
