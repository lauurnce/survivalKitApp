import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { DiscountCodesSection } from './DiscountCodesSection';

const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

let mockCodes: Array<{ coupon_code: string; coupon_expires_at: string }> = [];
vi.mock('@/hooks/useDiscountCodes', () => ({
  useDiscountCodes: () => ({ codes: mockCodes, loading: false, error: null }),
}));

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
    render(<DiscountCodesSection userToken="token" />);

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
    render(<DiscountCodesSection userToken="token" />);

    fireEvent.click(screen.getByRole('button', { name: /copy code/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument()
    );

    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(screen.getByRole('button', { name: /copy code/i })).toBeInTheDocument();
  });
});
