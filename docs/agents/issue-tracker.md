# Issue tracker: GitHub

Issues and PRDs for this repo live in GitHub Issues on `lauurnce/survivalKitApp`. Use the `gh` CLI with `--repo lauurnce/survivalKitApp` for all operations so commands target the upstream repository rather than a fork.

## Conventions

- **Create an issue**: `gh issue create --repo lauurnce/survivalKitApp --title "..." --body "..."`.
- **Read an issue**: `gh issue view <number> --repo lauurnce/survivalKitApp --comments`.
- **List issues**: `gh issue list --repo lauurnce/survivalKitApp --state open --json number,title,body,labels,comments` with appropriate label and state filters.
- **Comment on an issue**: `gh issue comment <number> --repo lauurnce/survivalKitApp --body "..."`.
- **Apply or remove labels**: `gh issue edit <number> --repo lauurnce/survivalKitApp --add-label "..."` or `--remove-label "..."`.
- **Close an issue**: `gh issue close <number> --repo lauurnce/survivalKitApp --comment "..."`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue in `lauurnce/survivalKitApp`.

## When a skill says "fetch the relevant ticket"

Read the issue and its comments from `lauurnce/survivalKitApp`.
