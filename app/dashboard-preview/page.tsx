/**
 * ADMIN DASHBOARD v2 — VISUAL MOCKUP. Not wired to anything.
 *
 * Every number below is hardcoded sample data. Nothing here queries the
 * database, and none of these aggregates exist yet — they are Tasks 5 and 6 of
 * docs/superpowers/plans/2026-08-20-admin-dashboard-v2.md.
 *
 * Originally a throwaway on `feat/admin-dashboard-preview`; merged for design
 * reference behind the same admin guard as /admin (review flag: the route sat
 * outside auth while carrying plausible-looking invented metrics). Invented
 * numbers must never be mistaken for phase-1 output — see the plan doc's
 * "nothing may render invented data" rule for the real dashboard.
 *
 * The primitives are copied from components/AdminDashboard.tsx rather than
 * imported, so the BarChart change (two-line labels) can be shown side by side
 * with the current behaviour without touching the real component.
 */

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/adminSession";

interface TopItem {
  label: string;
  count: number;
}

function SectionBand({ eyebrow, title, summary }: { eyebrow: string; title: string; summary?: string }) {
  return (
    <div className="sticky top-4 z-20 mb-8">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border border-ink/30 bg-paper px-5 py-4 shadow-sm">
        <span className="label-sm text-ink-faint font-mono">{eyebrow}</span>
        <h2 className="font-serif text-2xl md:text-3xl text-ink leading-none">{title}</h2>
        {summary && <span className="ml-auto font-mono text-xs text-ink-muted">{summary}</span>}
      </div>
    </div>
  );
}

function Stat({ value, label, accent, dot, subValue }: {
  value: number | string; label: string; accent?: boolean; dot?: boolean; subValue?: string;
}) {
  return (
    <div className={`relative border p-6 transition-colors duration-150 ${
      accent ? "border-accent/40 bg-accent/5 hover:border-accent/70" : "border-ink-faint/30 hover:border-ink/40"
    }`}>
      <div className="flex items-baseline gap-2 mb-1">
        {dot && <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0 self-center" />}
        <p className={`font-serif text-4xl ${accent ? "text-accent" : "text-ink"}`}>{value}</p>
      </div>
      <p className="label-sm text-ink-muted">{label}</p>
      {subValue && <p className="absolute bottom-2 right-3 font-mono text-[10px] text-ink-faint">{subValue}</p>}
    </div>
  );
}

/** CURRENT behaviour: single line, clipped at a fixed width. */
function BarChartOld({ data, label }: { data: TopItem[]; label: string }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div>
      <p className="label mb-4">{label}</p>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.label} className="group flex items-center gap-3">
            <span className="font-sans text-xs text-ink-muted w-28 sm:w-40 truncate shrink-0" title={item.label}>{item.label}</span>
            <div className="flex-1 bg-ink-faint/20 h-4">
              <div className="h-4 bg-accent" style={{ width: `${(item.count / max) * 100}%` }} />
            </div>
            <span className="font-mono text-xs text-ink-muted w-8 text-right">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * PROPOSED: wider column, wraps to two lines. `shrink-0` and the fixed width
 * are kept deliberately — that width is what makes every row's bar start at the
 * same x. Removing it (rather than widening it) lets long labels push each bar
 * to a different offset and the bar column stops forming a straight edge.
 */
function BarChartNew({ data, label, totalGroups }: { data: TopItem[]; label: string; totalGroups?: number }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-4">
        <p className="label">{label}</p>
        {totalGroups !== undefined && totalGroups > data.length && (
          <span className="font-mono text-[10px] text-ink-faint">top {data.length} of {totalGroups}</span>
        )}
      </div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.label} className="group flex items-center gap-3">
            <span className="font-sans text-xs text-ink-muted w-40 sm:w-56 shrink-0 leading-tight line-clamp-2">{item.label}</span>
            <div className="flex-1 bg-ink-faint/20 h-4">
              <div className="h-4 bg-accent transition-all duration-300 group-hover:bg-accent-dark" style={{ width: `${(item.count / max) * 100}%` }} />
            </div>
            <span className="font-mono text-xs text-ink-muted w-8 text-right">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-xs text-ink-muted border-l-2 border-accent/40 pl-3 mb-6 max-w-3xl leading-relaxed">
      {children}
    </p>
  );
}

// ---------------------------------------------------------------- sample data

const UNIVERSITIES_RAW: TopItem[] = [
  { label: "Polytechnic University of the Philippines", count: 2 },
  { label: "Not specified", count: 2 },
  { label: "University of Science and Technology of Southern Philippines", count: 2 },
  { label: "Catanduanes State University", count: 1 },
  { label: "Pamantasan ng Lungsod ng Maynila", count: 1 },
  { label: "University of Eastern Pangasinan", count: 1 },
  { label: "Colegio De Montalban", count: 1 },
  { label: "Westmead International School", count: 1 },
  { label: "President Ramon Magsaysay State University", count: 1 },
];

const MAJORS_SPLIT: TopItem[] = [
  { label: "BS Information Technology", count: 9 },
  { label: "BS INFORMATION TECHNOLOGY", count: 1 },
  { label: "BSIT", count: 1 },
  { label: "BS Information technology", count: 1 },
];

const MAJORS_NORMALISED: TopItem[] = [{ label: "BS Information Technology", count: 12 }];

const EXIT_MODULES: TopItem[] = [
  { label: "Introduction to Networking — Module 1", count: 412 },
  { label: "Data Structures — Module 1", count: 288 },
  { label: "Programming Fundamentals — Module 2", count: 173 },
  { label: "Discrete Mathematics — Module 1", count: 141 },
  { label: "Web Development — Module 3", count: 96 },
];

const EXIT_SUBJECTS: TopItem[] = [
  { label: "Introduction to Networking", count: 620 },
  { label: "Data Structures and Algorithms", count: 401 },
  { label: "Discrete Mathematics", count: 233 },
  { label: "Programming Fundamentals", count: 188 },
];

const SUBSCRIBER_SUBJECTS: TopItem[] = [
  { label: "Data Structures and Algorithms", count: 7 },
  { label: "Introduction to Networking", count: 5 },
  { label: "Web Development", count: 4 },
];

export default async function DashboardPreview() {
  const authed = await getAdminSession();
  if (!authed) redirect("/admin/login");
  return (
    <main className="min-h-screen bg-paper text-ink px-6 py-10">
      <div className="max-w-wide mx-auto mb-12">
        <div className="border-2 border-accent bg-accent/5 px-5 py-4 mb-8">
          <p className="font-serif text-2xl text-accent mb-1">Mockup — every number here is invented</p>
          <p className="font-sans text-xs text-ink-muted leading-relaxed">
            Nothing on this page queries the database. The aggregates it depicts do not exist yet;
            they are Tasks 5 and 6 of the dashboard v2 plan. Shown so the shape can be judged before
            it gets built. Real figures from your screenshots are reused only where they help you
            recognise the view — devices, active today, profile count.
          </p>
        </div>
        <h1 className="font-serif text-4xl text-ink mb-2">Admin Dashboard v2</h1>
        <p className="font-sans text-sm text-ink-muted">What changes, and why.</p>
      </div>

      {/* ---------------------------------------------------------------- 02 */}
      <SectionBand eyebrow="02" title="Activity" summary="1 active now" />
      <Note>
        <strong>Three tiles are gone.</strong> &ldquo;Total Users&rdquo; counted devices, not people, and came
        from an RPC with no migration — that figure is unauditable today. &ldquo;Recurring Users&rdquo; was
        literally total minus new-in-3-days, so a device that visited once in March counted as
        recurring. &ldquo;Approved Unlocks&rdquo; reads a dead event type and shows 0 forever. In their place:
        the device-to-account gap, which is the onboarding problem stated plainly.
      </Note>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 max-w-wide mx-auto">
        <Stat value="5,668" label="Devices reached (all time)" />
        <Stat value="47" label="Accounts created" />
        <Stat value="0.83%" label="Device → account" accent subValue="the funnel's real bottleneck" />
        <Stat value="12" label="Profiles completed" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12 max-w-wide mx-auto">
        <Stat value="1" label="Active now (15 min)" dot />
        <Stat value="73" label="Active today (PH)" />
        <Stat value="66" label="New devices (3 days)" />
        <Stat value="624" label="Active device-days (7d)" subValue="volume, not people" />
      </div>

      {/* ---------------------------------------------------------------- 03 */}
      <SectionBand eyebrow="03" title="Where students stop" summary="churn, by your definition" />
      <Note>
        <strong>New section.</strong> Not subscription lapse — where people exit the content and do not
        continue. The left tiles say how deep devices get before stopping; the lists say exactly
        which module and subject they stopped on. This is the section that tells you what to fix
        next, and it is the one your current dashboard cannot answer at all.
      </Note>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-wide mx-auto">
        <Stat value="1,204" label="Stopped after 1 module" accent subValue="21% of devices" />
        <Stat value="1,876" label="Stopped after 1 subject" />
        <Stat value="392" label="Reached 4+ modules" />
        <Stat value="2.1" label="Median modules opened" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-wide mx-auto mb-12">
        <BarChartNew data={EXIT_MODULES} label="Exit point — module" totalGroups={47} />
        <BarChartNew data={EXIT_SUBJECTS} label="Exit point — subject" totalGroups={31} />
      </div>

      {/* ---------------------------------------------------------------- 04 */}
      <SectionBand eyebrow="04" title="Paid subscriber engagement" summary="retention, by your definition" />
      <Note>
        <strong>New section.</strong> How the people who already pay behave <em>while</em> subscribed.
        The window starts at <code className="font-mono text-[11px]">payments.paid_at</code>, not
        <code className="font-mono text-[11px]"> subscriptions.created_at</code> — subscription rows are
        upserted on renewal, so their created date can predate the current paid period by months.
      </Note>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-wide mx-auto">
        <Stat value="18" label="Active subscribers" accent />
        <Stat value="11" label="Engaged (7 days)" />
        <Stat value="15" label="Engaged (28 days)" />
        <Stat value="3" label="Dormant while paying" subValue="churn risk" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-wide mx-auto mb-12">
        <BarChartNew data={SUBSCRIBER_SUBJECTS} label="What subscribers actually study" totalGroups={9} />
        <div>
          <p className="label mb-4">Weekly activity while subscribed</p>
          <div className="flex items-end gap-2 h-32">
            {[6, 9, 7, 11, 8, 12, 10, 11].map((v, i) => (
              <div key={i} className="flex-1 bg-accent/70" style={{ height: `${(v / 12) * 100}%` }} title={`${v} active`} />
            ))}
          </div>
          <p className="font-mono text-[10px] text-ink-faint mt-2">
            trailing 8 complete PH weeks — the in-progress week is excluded on purpose
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------------------- 07 */}
      <SectionBand eyebrow="07" title="Student Profiles" summary="12 profiles completed" />
      <Note>
        <strong>Two fixes.</strong> University names are no longer clipped — the label column is wider
        and wraps to two lines, keeping bars aligned. And your majors were one program split four ways
        by spelling; normalising merges them. Compare the two panels below.
      </Note>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-wide mx-auto mb-8">
        <div className="border border-ink-faint/30 p-5">
          <p className="font-mono text-[10px] text-ink-faint mb-4">CURRENT — clipped at a fixed width</p>
          <BarChartOld data={UNIVERSITIES_RAW} label="Universities" />
        </div>
        <div className="border border-accent/40 bg-accent/5 p-5">
          <p className="font-mono text-[10px] text-accent mb-4">PROPOSED — full names, bars still aligned</p>
          <BarChartNew data={UNIVERSITIES_RAW} label="Universities" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-wide mx-auto mb-12">
        <div className="border border-ink-faint/30 p-5">
          <p className="font-mono text-[10px] text-ink-faint mb-4">CURRENT — one program, four rows</p>
          <BarChartOld data={MAJORS_SPLIT} label="Majors / Programs" />
        </div>
        <div className="border border-accent/40 bg-accent/5 p-5">
          <p className="font-mono text-[10px] text-accent mb-4">PROPOSED — normalised</p>
          <BarChartNew data={MAJORS_NORMALISED} label="Majors / Programs" />
        </div>
      </div>

      {/* ---------------------------------------------------------------- 08 */}
      <SectionBand eyebrow="08" title="Feedback" summary="moved onto the dashboard" />
      <Note>
        <strong>Surfaced, not moved.</strong> Feedback already exists at <code className="font-mono text-[11px]">/admin/feedback</code> —
        it just was not visible from here. The full table stays where it is.
      </Note>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 max-w-wide mx-auto">
        <Stat value="31" label="Responses (all time)" />
        <Stat value="4.3" label="Avg app rating" />
        <Stat value="4.0" label="Avg module rating" />
        <Stat value="₱180" label="Median price ceiling" accent subValue="from the new survey" />
      </div>
      <div className="max-w-wide mx-auto mb-12 space-y-2">
        {[
          "The networking module was clear but I got lost at subnetting.",
          "Would pay if more subjects were covered for my year.",
          "Loads slow on my phone during class.",
        ].map((q) => (
          <p key={q} className="font-sans text-sm text-ink-muted border-l-2 border-ink-faint/30 pl-3 italic">
            &ldquo;{q}&rdquo;
          </p>
        ))}
        <p className="font-mono text-[10px] text-ink-faint pt-2">
          never attributed — no device id, no user id, no coupon code
        </p>
      </div>

      {/* --------------------------------------------------------------- out */}
      <div className="max-w-wide mx-auto border-t border-ink-faint/30 pt-6">
        <p className="label-sm text-ink-muted mb-3">Also changed</p>
        <ul className="font-sans text-sm text-ink-muted space-y-2 leading-relaxed">
          <li>
            <strong>Waitlist section removed.</strong> Revenue replaced it as the demand signal.
            Willingness-to-pay and device type move to the survey and to{" "}
            <code className="font-mono text-[11px]">events.device_type</code>, so no signal is lost.
          </li>
          <li>
            <strong>Device mix becomes segmentable.</strong> Once{" "}
            <code className="font-mono text-[11px]">events.device_type</code> exists, every tile above
            can split laptop vs phone — including the exit points, which is how you learn whether
            phone students drop out earlier.
          </li>
          <li>
            <strong>Profiles become joinable to behaviour.</strong> Today they cannot be: profiles key
            on <code className="font-mono text-[11px]">user_id</code>, events key on{" "}
            <code className="font-mono text-[11px]">device_id</code>, and nothing bridges them. That is
            why this section is thin, and it is the one change that unlocks &ldquo;which university
            converts best&rdquo;.
          </li>
        </ul>
      </div>
    </main>
  );
}
