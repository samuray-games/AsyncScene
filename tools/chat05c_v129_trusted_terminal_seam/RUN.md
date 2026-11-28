# Run isolated V129 verification

Runtime: CPython 3.13 with SQLite JSON1 and FOREIGN_KEYS enabled; Python stdlib only.

```
python -W error::ResourceWarning -m unittest discover -s test -p 'test_*.py' -v
python -m compileall -q bridge.py test
```

The test loader applies `fixtures/migrations/0001..0011` and unmodified proposed `0012`, then `fixtures/upstream/v128_candidate.sql`, and only then `seam.sql`. No live production DB is opened. `recursive_triggers=OFF` is intentional to cover the original EX10 case. Test code uses only disposable file-backed databases.

To use in a real service, implementation must supply production verifier objects and a separately durable monotonic witness, plus owner-authorized exclusive integration. No route, keys, Worker hook, D1 object or real issuer included.
