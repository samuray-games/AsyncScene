---
name: scope-isolation-check
description: Verify exact write ownership, mirror ownership, stable-read dependencies, shared wiring ownership and collision-free parallel lanes without blocking isolated execution.
---

# Scope Isolation Check

Use this skill to decide whether a proposed task is safe to execute in the current lane.

It does not approve runtime work or create locks.

## Verdicts

- return `SAFE_TO_PROCEED` when the lane is exact, isolated and collision-free;
- return `BLOCKED_SCOPE_COLLISION` when scopes overlap, depend on each other or touch shared wiring; and
- include exact paths, owners and dependencies for every collision.
