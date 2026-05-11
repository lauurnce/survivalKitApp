# UTM-tagged links — finals push, December 2026

Paste these instead of a bare `tryi2i.com`. An untagged link is invisible in
the growth report: 0 of 1,001 `events` rows in one 60-day window carried any
tag, so no channel could be credited with anything.

All links point at the home page on purpose. The `enter` event, which is the
only event that records `utm_source` / `utm_medium` / `utm_campaign`, fires on
`/` (and `/account`). A tagged link to a subject or module page is not
recorded today.

Campaign for this push: **`finals-dec-2026`** (Aug-10-wave finals run
Dec 9–19, 2026).

## Ready to paste

| Where | Link |
|---|---|
| Messenger / Telegram / Discord group chats (section GCs) | `https://tryi2i.com/?utm_source=groupchat&utm_medium=social&utm_campaign=finals-dec-2026` |
| TikTok — bio link | `https://tryi2i.com/?utm_source=tiktok&utm_medium=social&utm_campaign=finals-dec-2026` |
| Facebook — posts in BSIT groups and pages | `https://tryi2i.com/?utm_source=facebook&utm_medium=social&utm_campaign=finals-dec-2026` |
| X — posts and bio | `https://tryi2i.com/?utm_source=x&utm_medium=social&utm_campaign=finals-dec-2026` |

## Links the product already tags for you

You do not need to tag these by hand; `lib/utm.ts` does it.

| Link | source | medium | campaign |
|---|---|---|---|
| Progress card native share sheet | `share_card` | `social` | `progress_card` |
| Class-rep invite link (copy button) | `class_invite` | `referral` | `class_rep` |
| Receipt / welcome / expiry / win-back email CTA | `lifecycle` | `email` | the email kind |
| Finals reactivation email CTA | `reactivation` | `email` | `finals-dec-2026` |

The class invite lands on `/class/<code>/join`, which does not record
attribution yet, so those tags are carried but not counted until it does.

## Rules for new links

- Lowercase, `a-z0-9`, `-` and `_` only. `Facebook` and `facebook` count as
  two channels.
- `utm_source` is the place (`tiktok`, `groupchat`), `utm_medium` the kind of
  channel (`social`, `email`, `referral`), `utm_campaign` the push.
- Only those three. `utm_content` and `utm_term` are not stored, so adding
  them changes nothing.
- One campaign name per push. Reuse `finals-dec-2026` until the push ends.
