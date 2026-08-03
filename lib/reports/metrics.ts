/**
 * Metric diffing for department reports.
 *
 * A scan is a diff, not a snapshot: the value is in what changed since last
 * time. The row set must stay identical between runs, so a row present in the
 * current run always appears even when the previous run had no equivalent.
 *
 * A null value means "not read". It renders as such and is never given a
 * computed delta — an estimate that hardens into a baseline poisons every
 * future comparison.
 */

export interface Metric {
  label: string;
  value: string | number | null;
  unit?: string;
}

export interface MetricDelta {
  label: string;
  now: string;
  previous: string;
  delta: string;
  direction: "up" | "down" | "flat" | "unknown";
}

const NOT_READ = "not read";
const NONE = "—";

function render(metric: Metric | undefined): string {
  if (!metric) return NONE;
  if (metric.value === null) return NOT_READ;
  return `${metric.value}${metric.unit ?? ""}`;
}

function compare(current: Metric, previous: Metric | undefined): Pick<MetricDelta, "delta" | "direction"> {
  if (!previous || current.value === null || previous.value === null) {
    return { delta: NONE, direction: "unknown" };
  }

  if (typeof current.value === "number" && typeof previous.value === "number") {
    const change = current.value - previous.value;
    if (change === 0) return { delta: NONE, direction: "flat" };
    return {
      delta: `${change > 0 ? "+" : ""}${change}`,
      direction: change > 0 ? "up" : "down",
    };
  }

  // Non-numeric values are compared for equality only. "changed" is honest
  // where arithmetic would be meaningless — HIT to MISS has no magnitude.
  if (String(current.value) === String(previous.value)) {
    return { delta: NONE, direction: "flat" };
  }
  return { delta: "changed", direction: "up" };
}

export function diffMetrics(current: Metric[], previous: Metric[] | null): MetricDelta[] {
  const lookup = new Map((previous ?? []).map((m) => [m.label, m]));

  return current.map((metric) => {
    const before = lookup.get(metric.label);
    return {
      label: metric.label,
      now: render(metric),
      previous: render(before),
      ...compare(metric, before),
    };
  });
}

const LABEL_WIDTH = 30;
const COL_WIDTH = 11;
const RULE_WIDTH = 69;

export function renderMetricsTable(rows: MetricDelta[], heading: string): string {
  const header =
    heading.padEnd(LABEL_WIDTH) +
    "NOW".padStart(COL_WIDTH) +
    "LAST RUN".padStart(COL_WIDTH + 4) +
    "Δ".padStart(COL_WIDTH);

  const rule = "─".repeat(RULE_WIDTH);

  const body = rows.map(
    (row) =>
      row.label.padEnd(LABEL_WIDTH) +
      row.now.padStart(COL_WIDTH) +
      row.previous.padStart(COL_WIDTH + 4) +
      row.delta.padStart(COL_WIDTH)
  );

  return [header, rule, ...body].join("\n");
}
