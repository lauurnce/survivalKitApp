import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { DiscountCodesSection } from './DiscountCodesSection';

const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

let mockCodes: Array<{ coupon_code: string; coupon_expires_at: string }> = [];
vi.mock('@/hooks/useDiscountCodes', () => ({
  useDiscountCodes: () => ({ codes: mockCodes, loading: false, error: null }),
}));

const FEEDBACK_HREF = '/year/y1/subjects/s1/modules/m1?feedback=1';

function renderSection() {
  return render(<DiscountCodesSection userToken="token" feedbackHref={FEEDBACK_HREF} />);
}

describe('DiscountCodesSection', () => {
  const writeText = vi.fn(async () => {});

  beforeEach(() => {
    mockCodes = [{ coupon_code: 'FEEDBACK-ABC12345', coupon_expires_at: futureDate }];
    writeText.mockClear();
    Object.assign(navigator, { clipboard: { writeText } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('copies the code and shows an inline Copied! state instead of alerting', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderSection();

    fireEvent.click(screen.getByRole('button', { name: /copy code/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument()
    );
    expect(writeText).toHaveBeenCalledWith('FEEDBACK-ABC12345');
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('reverts the button label after the copied state times out', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderSection();

    fireEvent.click(screen.getByRole('button', { name: /copy code/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument()
    );

    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(screen.getByRole('button', { name: /copy code/i })).toBeInTheDocument();
  });

  // The coupon became flexible: it covers either subject plan IN FULL and
  // takes ₱100 off the year pass. Copy must not promise a flat ₱100-off-any-
  // module discount (the old wording was wrong in both directions).
  it('describes the flexible discount instead of promising flat ₱100 off any module', () => {
    renderSection();

    expect(
      screen.getByText(/covers a single-subject unlock in full/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/₱100 discount on any module unlock/i)
    ).not.toBeInTheDocument();
  });

  it('keeps the empty state free of a flat-amount promise too', () => {
    mockCodes = [];
    renderSection();

    expect(screen.getByText(/up to ₱100 off/i)).toBeInTheDocument();
    expect(screen.queryByText(/earn ₱100 discount codes/i)).not.toBeInTheDocument();
  });

  // The empty state's "Submit quality feedback" is the only way a fresh
  // account discovers how to earn a code, so it must be a real link — and
  // only that phrase, not the whole sentence.
  it('links exactly "Submit quality feedback" to the feedback form in the empty state', () => {
    mockCodes = [];
    renderSection();

    const link = screen.getByRole('link', { name: 'Submit quality feedback' });
    expect(link).toHaveAttribute('href', FEEDBACK_HREF);
    // Nothing else in the sentence is linked — the surrounding text nodes stay plain.
    expect(link.textContent).toBe('Submit quality feedback');
    expect(screen.getByText(/to earn discount codes — up to ₱100 off/i)).toBeInTheDocument();
  });

  it('renders no feedback link once codes exist', () => {
    renderSection();

    expect(
      screen.queryByRole('link', { name: /submit quality feedback/i })
    ).not.toBeInTheDocument();
  });
});
