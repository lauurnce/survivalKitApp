import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('FeedbackPrompt', () => {
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
});
