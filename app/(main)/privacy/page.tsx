import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How BSIT Survival Kit collects, uses, and protects your personal data, in compliance with the Philippine Data Privacy Act of 2012 (RA 10173).",
};

// The Google Analytics property the site loads (app/layout.tsx reads it from
// NEXT_PUBLIC_GA_ID). Named here so the policy states exactly what is loaded.
const GA_MEASUREMENT_ID = "G-WN5Q254FCG";

const LINK =
  "text-ink hover:text-accent transition-colors underline underline-offset-2";

// Every cookie and browser-storage key the site sets, from a grep of the code
// for cookies().set, res.cookies.set, localStorage and sessionStorage. Keep this
// list in step with the code: add a row whenever a new key ships.
const COOKIES: [name: string, setBy: string, purpose: string, lasts: string][] = [
  ["bsit_device_id", "Us", "A signed copy of your device ID, so your reading progress and any unlock stay tied to this browser. HttpOnly: page scripts cannot read it.", "1 year"],
  ["sb-…-auth-token", "Supabase Auth, on our behalf", "Keeps you signed in. Only set once you log in.", "Until you sign out, at most 400 days"],
  ["_ga, _ga_…", "Google Analytics", "Tells visits from the same browser apart so page-view counts are not inflated.", "Up to 2 years"],
  ["admin_session", "Us", "Signs in the site administrator. Never set for students.", "8 hours"],
];

const LOCAL_STORAGE: [key: string, purpose: string][] = [
  ["bsit_device_id", "Your device ID (see Section 2)."],
  ["theme", "Whether you chose light or dark mode."],
  ["bsit_last_module", "The module you last opened, for the \"Continue reading\" link on the home page."],
  ["bsit-pages-…, bsit-static-… (Cache Storage)", "Copies of the public lesson and subject pages you opened, so they still open with no signal. Never sent to us; your browser can clear them."],
  ["bsit_install_prompt_dismissed", "When you closed the \"add to home screen\" suggestion, so it stays away for three weeks."],
  ["bsit_recent_lessons", "The last few lessons you opened (titles and links), for \"Pick up where you left off\". Never sent to us."],
  ["bsit:tour:…", "Which page tours you have finished or skipped, so they don't repeat."],
  ["bsit:landing-seen", "That this browser has opened the home page before, so the home page tour waits until your second visit."],
  ["bsit_signup_nudge_dismissed", "That you closed the \"create a free account\" prompt."],
  ["last-feedback-prompt, rated-modules", "When we last asked for feedback, and which modules you already rated, so we don't ask again."],
];

const SESSION_STORAGE: [key: string, purpose: string][] = [
  ["bsit:session-entered", "Counts a visit once per browser session, not once per page."],
  ["bsit_signup_nudge_shown", "Shows the sign-up prompt at most once per session."],
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-20">
      <div className="max-w-prose mx-auto">

        <Link
          href="/"
          className="font-sans text-sm text-ink-muted hover:text-ink transition-colors mb-10 inline-block"
        >
          ← Back to home
        </Link>

        <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted mb-4">
          Legal
        </p>
        <h1 className="font-serif text-display-lg text-ink mb-3 leading-tight">
          Privacy Policy
        </h1>
        <p className="font-sans text-sm text-ink-faint mb-12">
          Last updated: 31 October 2026 &mdash; Compliant with the Philippine Data Privacy Act of 2012 (RA 10173)
        </p>

        <div className="font-sans text-base text-ink-muted leading-relaxed space-y-10">

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">1. Who We Are</h2>
            <p>
              BSIT Survival Kit is a study guide app for Filipino BSIT (Bachelor of
              Science in Information Technology) students. It is operated by a single
              independent developer.
            </p>
            <p className="mt-3">
              As the personal information controller under RA 10173, the developer also
              serves as the Data Protection Officer (DPO). You can reach the DPO at:{" "}
              <a href="mailto:paneslawrence8@gmail.com" className={LINK}>
                paneslawrence8@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">2. What We Collect</h2>
            <p className="mb-4">We only collect what we actually need. Here is what that looks like:</p>

            <div className="space-y-5">
              <div>
                <p className="font-sans font-medium text-ink mb-1">Account and profile</p>
                <p>
                  Your email address and password are collected when you create an
                  account (the password is stored only as a secure hash by our
                  sign-in provider). Your name, and optionally your age, gender,
                  school, and course, are collected only if you fill in your profile.
                  All of it is optional, and you can delete your account and this
                  data yourself at any time from your Profile page.
                </p>
                <p className="mt-2 text-ink-faint text-sm">
                  We previously ran a &quot;notify me&quot; waitlist for subjects that
                  had no content yet. That is finished: every subject now has content,
                  everyone who signed up was emailed, and their names and emails were
                  deleted.
                </p>
              </div>

              <div>
                <p className="font-sans font-medium text-ink mb-1">Device ID</p>
                <p>
                  A randomly generated identifier (UUID), created by your browser the
                  first time you visit. It is kept in your browser&apos;s local storage
                  and in a cookie (see Section 5). It is not tied to your identity
                  unless you also sign up.
                </p>
              </div>

              <div>
                <p className="font-sans font-medium text-ink mb-1">Reading activity</p>
                <p>
                  Pages you visit, modules you open, sections you read, and how you
                  arrived (for example, the link or campaign tag that brought you
                  here). We store this in our own database linked to your device ID.
                  The modules you mark as done are also linked to your account when
                  you are signed in, so your progress follows you across devices. We
                  use this to remember your progress and to understand how students
                  use the app.
                </p>
              </div>

              <div>
                <p className="font-sans font-medium text-ink mb-1">Usage data collected by Google Analytics</p>
                <p>
                  Every page loads Google Analytics (measurement ID{" "}
                  <span className="font-mono text-sm">{GA_MEASUREMENT_ID}</span>).
                  Google receives the address of each page you view, your IP address,
                  and your browser, device, and approximate location, and sets its own
                  cookies to recognize repeat visits. We see only aggregated reports,
                  not your IP address.
                </p>
              </div>

              <div>
                <p className="font-sans font-medium text-ink mb-1">Payment data</p>
                <p>
                  If you buy access to reviewers, you pay on PayMongo&apos;s checkout
                  page by GCash, Maya, or card. Your card number, e-wallet login, and
                  any details you type on that page go to PayMongo, never to us. We
                  keep a record of the purchase: the PayMongo payment reference, the
                  plan, the subject or year it unlocks, the amount, and when it was
                  paid, linked to your account and device ID.
                </p>
              </div>

              <div>
                <p className="font-sans font-medium text-ink mb-1">Feedback</p>
                <p>
                  If you rate a module or send feedback, we store the rating and your
                  comment, linked to your device ID and, unless you send it
                  anonymously, your account.
                </p>
              </div>

              <div>
                <p className="font-sans font-medium text-ink mb-1">Code you run in the playground</p>
                <p>
                  Python and SQL run entirely in your browser and are never sent to
                  us. Java and C code is passed through our server to Judge0, a
                  third-party code execution service, to be compiled and run. We do
                  not store submitted code.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">3. Why We Collect It</h2>
            <div className="space-y-3">
              <p>
                <span className="text-ink font-medium">Account email and profile</span> —
                to sign you in, keep your unlocked subjects tied to your account across
                devices, and personalize your dashboard.
              </p>
              <p>
                <span className="text-ink font-medium">Emails we send</span> —
                receipts and messages about a purchase (a welcome note, a warning
                before your access ends, and a note after it ends). We may also
                send an occasional study reminder, such as before finals; every one
                has an unsubscribe link, and we will not use your email for anything
                else without your permission.
              </p>
              <p>
                <span className="text-ink font-medium">Device ID, reading activity, and analytics</span> —
                to save your reading progress across visits and to understand which
                modules students find most useful, so we can improve the app.
              </p>
              <p>
                <span className="text-ink font-medium">Payment data</span> —
                to verify your payment, activate your access, and keep records we
                may need to resolve a dispute or refund.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">4. Service Providers We Use</h2>
            <p className="mb-4">
              We use a small number of services to run the app. Each one receives only
              the data it needs to do its job for us, listed below. We never sell your
              data, and we do not share it with anyone else unless the law requires us to.
            </p>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-ink mb-1">
                  Supabase{" "}
                  <span className="font-normal text-ink-faint text-sm">(Database and sign-in — Singapore region)</span>
                </p>
                <p>
                  Stores your account, profile, device ID, reading activity, feedback,
                  and purchase records, and handles signing in. Data is hosted in
                  Singapore.
                </p>
              </div>
              <div>
                <p className="font-medium text-ink mb-1">
                  Vercel{" "}
                  <span className="font-normal text-ink-faint text-sm">(Web hosting — global edge network)</span>
                </p>
                <p>
                  Serves the app. Vercel processes request metadata (IP addresses,
                  headers) as part of normal web hosting, under its own privacy policy.
                </p>
              </div>
              <div>
                <p className="font-medium text-ink mb-1">
                  Google Analytics{" "}
                  <span className="font-normal text-ink-faint text-sm">(Usage statistics — Google LLC)</span>
                </p>
                <p>
                  Receives the usage data described in Section 2 and processes it under{" "}
                  <a href="https://policies.google.com/privacy" className={LINK}>
                    Google&apos;s privacy policy
                  </a>
                  . You can opt out with Google&apos;s{" "}
                  <a href="https://tools.google.com/dlpage/gaoptout" className={LINK}>
                    Analytics opt-out browser add-on
                  </a>{" "}
                  or by blocking cookies from google-analytics.com; the app works
                  the same either way.
                </p>
              </div>
              <div>
                <p className="font-medium text-ink mb-1">
                  PayMongo{" "}
                  <span className="font-normal text-ink-faint text-sm">(Payments — GCash, Maya, and card)</span>
                </p>
                <p>
                  Runs the checkout page and processes your payment. We send it the
                  plan and price, plus your device ID and account ID so the payment
                  can be matched to you. PayMongo handles your payment details under
                  its own privacy policy.
                </p>
              </div>
              <div>
                <p className="font-medium text-ink mb-1">
                  Resend{" "}
                  <span className="font-normal text-ink-faint text-sm">(Email delivery)</span>
                </p>
                <p>
                  Delivers the emails described in Section 3. It receives your email
                  address and the content of each message.
                </p>
              </div>
              <div>
                <p className="font-medium text-ink mb-1">
                  Judge0{" "}
                  <span className="font-normal text-ink-faint text-sm">(Code execution — ce.judge0.com)</span>
                </p>
                <p>
                  Receives the Java or C code you run in the playground, through our
                  server, so it never sees your account. Do not put sensitive or
                  personal data in code. Judge0 is an independent service with its
                  own terms and privacy policy.
                </p>
              </div>
              <div>
                <p className="font-medium text-ink mb-1">
                  jsDelivr and sql.js.org{" "}
                  <span className="font-normal text-ink-faint text-sm">(File delivery for the playground)</span>
                </p>
                <p>
                  The playground downloads its Python engine from jsDelivr, and its
                  SQL engine from sql.js.org only if our own copy fails to load.
                  These public file servers see your IP address like any web
                  request. No code or personal data is sent to them.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">5. Cookies and Browser Storage</h2>
            <p className="mb-4">
              We do not use advertising cookies. These are all the cookies and
              browser-storage entries the site sets:
            </p>
            <p className="font-sans font-medium text-ink mb-2">Cookies</p>
            <ul className="space-y-3 list-none mb-6">
              {COOKIES.map(([name, setBy, purpose, lasts]) => (
                <li key={name}>
                  <span className="font-mono text-sm text-ink">{name}</span>{" "}
                  <span className="text-ink-faint text-sm">({setBy}; lasts {lasts.toLowerCase()})</span>
                  <br />
                  {purpose}
                </li>
              ))}
            </ul>
            <p className="font-sans font-medium text-ink mb-2">Local storage (stays until you clear it)</p>
            <ul className="space-y-3 list-none mb-6">
              {LOCAL_STORAGE.map(([key, purpose]) => (
                <li key={key}>
                  <span className="font-mono text-sm text-ink">{key}</span> — {purpose}
                </li>
              ))}
            </ul>
            <p className="font-sans font-medium text-ink mb-2">Session storage (cleared when you close the tab)</p>
            <ul className="space-y-3 list-none">
              {SESSION_STORAGE.map(([key, purpose]) => (
                <li key={key}>
                  <span className="font-mono text-sm text-ink">{key}</span> — {purpose}
                </li>
              ))}
            </ul>
            <p className="mt-4">
              You can clear or block any of these in your browser settings. Blocking
              our own cookie and storage means your progress and unlocks will not be
              remembered on that browser.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">6. Your Rights Under RA 10173</h2>
            <p className="mb-4">
              As a data subject under the Philippine Data Privacy Act, you have the
              following rights:
            </p>
            <ul className="space-y-3 list-none">
              {[
                ["Right to be informed", "You have the right to know what data we collect and why. This policy is how we fulfill that."],
                ["Right to access", "You can request a copy of the personal data we hold about you."],
                ["Right to rectify", "You can ask us to correct inaccurate or incomplete data."],
                ["Right to erasure", "You can delete your account and personal data yourself, any time, from your Profile page — or email us and we will do it for you. We will comply unless we are legally required to retain it (see Section 8)."],
                ["Right to object", "You can object to how we process your data, including for analytics. To stop Google Analytics, use the opt-out in Section 4."],
                ["Right to data portability", "You can request your data in a structured, commonly used format."],
                ["Right to file a complaint", "If you believe your rights have been violated, you can file a complaint with the National Privacy Commission at privacy.gov.ph."],
              ].map(([title, description]) => (
                <li key={title} className="flex gap-3">
                  <span className="font-mono text-accent mt-0.5 shrink-0">—</span>
                  <p>
                    <span className="text-ink font-medium">{title}</span>{" "}
                    — {description}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">7. How to Exercise Your Rights</h2>
            <p className="mb-3">
              <span className="text-ink font-medium">To delete your account</span> — sign in,
              go to your Profile page, and use the &quot;Delete my account&quot; option. This
              removes your profile and unlinks your name from your subscription and progress
              history immediately.
            </p>
            <p className="mb-3">
              <span className="text-ink font-medium">To stop study-reminder emails</span> — use
              the unsubscribe link in any of them.
            </p>
            <p>
              For anything else (access, correction, or if you can&apos;t sign in), email us at{" "}
              <a
                href="mailto:paneslawrence8@gmail.com?subject=Data%20Privacy%20Request"
                className={LINK}
              >
                paneslawrence8@gmail.com
              </a>{" "}
              with the subject line <span className="font-mono text-sm bg-ink/5 px-1.5 py-0.5 rounded">Data Privacy Request</span>.
              Please describe what you are requesting (access, correction, deletion, etc.)
              and we will respond within a reasonable time, and no later than the period
              required under NPC Circular 16-01.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">8. Data Retention</h2>
            <div className="space-y-3">
              <p>
                <span className="text-ink font-medium">Account and profile</span> —
                kept until you delete your account.
              </p>
              <p>
                <span className="text-ink font-medium">Waitlist name and email</span> —
                deleted once the subject you signed up for has content and we have
                notified you, since that is the only purpose we collected it for.
                All notify-me signups from the 2026 waitlist were deleted in July
                2026 after everyone was emailed. The signup form is no longer in
                use.
              </p>
              <p>
                <span className="text-ink font-medium">Reading activity</span> —
                retained for up to 12 months, then deleted or anonymized.
              </p>
              <p>
                <span className="text-ink font-medium">Google Analytics data</span> —
                kept by Google for no more than 14 months, the longest retention
                Google Analytics allows.
              </p>
              <p>
                <span className="text-ink font-medium">Payment records</span> —
                kept for as long as necessary to resolve disputes and comply with any
                applicable accounting or legal obligations.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">9. Security</h2>
            <p>
              Your data is stored in Supabase with encrypted connections (TLS in
              transit, AES-256 at rest). Admin access to the dashboard is protected by
              password authentication. We apply reasonable technical measures to protect
              your data, but no system is completely immune to breaches. If a breach
              occurs that affects your rights, we will notify you and the National
              Privacy Commission as required by law.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink mb-3">10. Contact</h2>
            <p>
              For any privacy-related questions, requests, or concerns, reach out to the
              Data Protection Officer:
            </p>
            <p className="mt-3">
              <a href="mailto:paneslawrence8@gmail.com" className={LINK}>
                paneslawrence8@gmail.com
              </a>
            </p>
          </section>

          <div className="border-t border-ink-faint/20 pt-8">
            <p className="font-mono text-label-sm text-ink-faint">
              This policy was written in plain English on purpose. If something is unclear,
              email us and we will explain it.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
