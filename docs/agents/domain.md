# Domain docs

This repository uses a single-context domain documentation layout.

## Before exploring

Read these sources when they exist:

- `CONTEXT.md` at the repository root for domain vocabulary.
- `docs/adr/` for architectural decisions relevant to the area being changed.

If either source does not exist, proceed without creating it. Producer skills create domain terms and decisions only when they are resolved.

## Use the glossary's vocabulary

Use terms as defined in `CONTEXT.md` when naming domain concepts in issues, proposals, hypotheses, and tests. If a needed concept is absent, reconsider whether the codebase already uses another term before proposing a glossary addition.

## Flag ADR conflicts

Surface any conflict with an existing ADR explicitly rather than silently overriding the recorded decision.
