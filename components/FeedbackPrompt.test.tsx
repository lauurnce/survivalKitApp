import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { FeedbackPrompt } from './FeedbackPrompt';

vi.mock('@/lib/device', () => ({
  getDeviceId: () => 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
}));

function fillAndSubmit() {
  // 10 star buttons: first 5 = module rating, last 5 = app rating.
  const stars = screen.getAllByRole('button', { name: '★' });
  fireEvent.click(stars[4]);
  fireEvent.click(stars[9]);
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));
}

function mockSuccess() {
  global.fetch = vi.fn(async () =>
    new Response(
      JSON.stringify({
        id: 'f1',
        coupon_code: null,
        coupon_expires_at: null,
        is_quality_approved: true,
        message: 'Thanks for your feedback!',
      }),
      { status: 200 }
    )
  ) as unknown as typeof fetch;
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('FeedbackPrompt', () => {
  it('renders as an inline card with no dimmed backdrop', () => {
    const { container } = render(
      <FeedbackPrompt isOpen moduleId="m1" moduleTitle="Lesson 1" onClose={() => {}} />
    );

    expect(container.querySelector('.fixed')).toBeNull();
    expect(screen.getByText(/you just finished/i)).toBeInTheDocument();
    expect(screen.getByText('Lesson 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /not now/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^cancel$/i })).not.toBeInTheDocument();
  });

  it('shows an inline error on 409 instead of alerting', async () => {
    global.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          error: 'already_submitted',
          message: "You've already shared feedback for this module — thank you!",
        }),
        { status: 409 }
      )
    ) as unknown as typeof fetch;

    render(<FeedbackPrompt isOpen moduleId="m1" onClose={() => {}} />);
    fillAndSubmit();

    await waitFor(() =>
      expect(screen.getByText(/already shared feedback/i)).toBeInTheDocument()
    );
  });

  it('shows the thank-you state even when no coupon is returned', async () => {
    global.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          id: 'f1',
          coupon_code: null,
          coupon_expires_at: null,
          is_quality_approved: true,
          message: 'Thanks for your feedback! Sign in next time to earn a ₱100 discount code.',
        }),
        { status: 200 }
      )
    ) as unknown as typeof fetch;

    render(<FeedbackPrompt isOpen moduleId="m1" onClose={() => {}} />);
    fillAndSubmit();

    await waitFor(() =>
      expect(screen.getByText(/Sign in next time/i)).toBeInTheDocument()
    );
  });

  it('closes itself three seconds after a successful submit', async () => {
    vi.useFakeTimers();
    mockSuccess();
    const onClose = vi.fn();

    render(<FeedbackPrompt isOpen moduleId="m1" onClose={onClose} />);
    fillAndSubmit();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByText(/thanks for your feedback/i)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not fire its auto-close after the reader leaves the page', async () => {
    vi.useFakeTimers();
    mockSuccess();
    const onClose = vi.fn();

    const view = render(<FeedbackPrompt isOpen moduleId="m1" onClose={onClose} />);
    fillAndSubmit();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByText(/thanks for your feedback/i)).toBeInTheDocument();

    // The reader taps "Up next" a second after submitting.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    view.unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
