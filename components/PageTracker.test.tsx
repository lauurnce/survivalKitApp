import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

const logEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({
  logEvent: (...args: unknown[]) => logEvent(...args),
}));

import { PageTracker } from "./PageTracker";

const YEAR = "00000000-0000-0000-0000-000000000001";
const SUBJECT = "11111111-1111-4111-8111-111111111111";
const LESSON_1 = "22222222-2222-4222-8222-222222222222";
const LESSON_2 = "44444444-4444-4444-8444-444444444444";

beforeEach(() => logEvent.mockClear());

describe("PageTracker", () => {
  it("logs module_open once when a lesson is opened directly", () => {
    render(<PageTracker event="module_open" yearId={YEAR} subjectId={SUBJECT} moduleId={LESSON_1} />);
    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith("module_open", {
      year_id: YEAR,
      subject_id: SUBJECT,
      module_id: LESSON_1,
    });
  });

  it("does not log again when the same lesson re-renders", () => {
    const { rerender } = render(
      <PageTracker event="module_open" yearId={YEAR} subjectId={SUBJECT} moduleId={LESSON_1} />,
    );
    rerender(<PageTracker event="module_open" yearId={YEAR} subjectId={SUBJECT} moduleId={LESSON_1} />);
    expect(logEvent).toHaveBeenCalledTimes(1);
  });

  it("logs the next lesson when client-side navigation reuses the instance", () => {
    const { rerender } = render(
      <PageTracker event="module_open" yearId={YEAR} subjectId={SUBJECT} moduleId={LESSON_1} />,
    );
    rerender(<PageTracker event="module_open" yearId={YEAR} subjectId={SUBJECT} moduleId={LESSON_2} />);
    expect(logEvent).toHaveBeenCalledTimes(2);
    expect(logEvent).toHaveBeenLastCalledWith("module_open", {
      year_id: YEAR,
      subject_id: SUBJECT,
      module_id: LESSON_2,
    });
  });
});
