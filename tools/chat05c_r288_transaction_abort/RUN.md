# Reproduction

Run from this directory on a machine with Python 3.11+ and stdlib sqlite3:

```bash
python -m unittest discover -s test -p 'test_r288.py' -v
```

Tests validate original ZIP hashes/CRCs/manifests before extracting exact source into disposable temp directories, then exercise the exact upstream R287 trigger with its embedded original R285/05C terminal bridge. The original V129 test suite can also run after extracting `source_readonly/chat05c_v129_original.zip` without changing bytes.

Warnings: the unchanged R287 upstream bootstrap may leak temporary `sqlite3.Connection` objects; Python `-W error::ResourceWarning` emits unraisable destructor warnings. We did NOT change those unrelated original files. For a warning-clean test transcript only, `-W ignore::ResourceWarning` suppresses these original fixture destructor warnings; this does not mean fixture resource hygiene was fixed. The R288 handler itself does not create or retain its own Connection; it requires a trusted exclusive connection owner.
