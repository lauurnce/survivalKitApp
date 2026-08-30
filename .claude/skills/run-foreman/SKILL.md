---
name: run-foreman
description: Activate FOREMAN. Use when asked to "talk to foreman", "activate foreman", "run foreman", "/run-foreman", or to route a specific request through product triage before Mason or Medic get dispatched — or to run FOREMAN's full backlog triage pass.
---

# Run FOREMAN

FOREMAN has two modes (see `.claude/agents/foreman.md`'s "Which mode" section)
and they get invoked differently — don't dispatch both the same way.

## Mode 1 — Interactive intake (the common case)

Triggered by `/run-foreman <what you want built or fixed>`, or `/run-foreman`
with nothing after it, or just "talk to foreman about X" in conversation.

**Run this inline, in the current session — do not dispatch FOREMAN as a
subagent for this mode.** Interactive intake is a live back-and-forth (ask
questions, propose, wait for approval); a subagent dispatched via the Agent
tool runs to completion asynchronously and can't hold a real-time
conversation with the user the way this mode needs. Reading the file
inline also sidesteps the staleness caveat in Mode 2 below.

Steps:

1. Read `.claude/agents/foreman.md` in full, fresh, right now (even if
   you've read it earlier this session — you want the current file).
2. Adopt it: run Step 1 (read the previous journal) and Step 2 (domain
   context), then follow the "Interactive intake" section exactly, in this
   conversation, as FOREMAN. If the command had text after it, treat that
   as the opening request; otherwise ask the user what they want first.
3. Ask clarifying questions per step (a) whenever scope, acceptance
   criteria, or boundaries are unclear — don't guess on the user's behalf.
4. State the proposal (step d) and stop. Do not run `gh issue create`,
   `--add-label`, or `gh issue comment` until the user explicitly approves.
5. On approval, run step e's `gh` calls yourself, inline, exactly as
   written — you're acting as FOREMAN, so this is FOREMAN's write scope,
   not a separate dispatch.
6. Once the issue is labeled and routed, drop the FOREMAN persona and
   resume your normal role: tell the user the issue is ready, name which
   specialist it routes to (Mason or Medic), and offer to dispatch that
   agent now via the Agent tool. **FOREMAN never dispatches Mason, Medic,
   or Sentry itself** — see `.claude/agents/foreman.md`'s "What you are
   not" — that dispatch is this session's job, on the user's go-ahead, same
   as it already is for issues that come from the backlog.

## Mode 2 — Batch triage pass

Triggered by an explicit ask to "run a triage pass" / "sweep the backlog"
with no specific request attached — this is a one-shot autonomous scan, so
dispatch it the same way `x-updates` dispatches HERALD:

```
Agent({ subagent_type: "foreman" })
```

**If `.claude/agents/foreman.md` has been edited this session, restart the
session before dispatching it this way.** Agent definitions load at session
start, same as every other department agent in this repo — a subagent
dispatched after a mid-session edit runs the old instructions. (Mode 1
above doesn't have this problem, since it reads the file fresh each time.)

Relay FOREMAN's chat summary (Step 8) to the user once it reports back.
