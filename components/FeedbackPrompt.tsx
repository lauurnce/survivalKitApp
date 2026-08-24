'use client';

import { useEffect, useRef, useState } from 'react';
import { getDeviceId } from '@/lib/device';

interface FeedbackResponse {
  id: string;
  coupon_code: string | null;
  coupon_expires_at: string | null;
  is_quality_approved: boolean;
  message: string;
}

interface FeedbackPromptProps {
  isOpen: boolean;
  moduleId: string | null;
  moduleTitle?: string;
  onClose: () => void;
  onSubmit?: (data: FeedbackResponse) => void;
  userId?: string | null;
}

const CARD_CLASS = 'border border-accent/40 bg-accent/[0.03] p-6';
const LABEL_CLASS =
  'font-mono text-label-sm uppercase tracking-[0.12em] text-accent mb-3.5';
const QUESTION_CLASS = 'font-sans text-sm text-ink-muted mt-4 mb-2';

export function FeedbackPrompt({
  isOpen,
  moduleId,
  moduleTitle,
  onClose,
  onSubmit,
  userId,
}: FeedbackPromptProps) {
  const [appRating, setAppRating] = useState(0);
  const [moduleRating, setModuleRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(!userId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The reader usually taps "Up next" long before the thank-you card times out.
  // An uncleared timer would then close a component that no longer exists.
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  if (!isOpen || !moduleId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const deviceId = getDeviceId();
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          user_id: isAnonymous ? undefined : userId,
          module_id: moduleId,
          app_rating: appRating,
          module_rating: moduleRating,
          feedback_text: feedback,
          is_anonymous: isAnonymous,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCouponCode(data.coupon_code);
        setSubmitMessage(data.message);
        setSubmitted(true);
        onSubmit?.(data);

        // Reset form and close after 3 seconds
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => {
          closeTimer.current = null;
          setAppRating(0);
          setModuleRating(0);
          setFeedback('');
          setCouponCode(null);
          setSubmitMessage('');
          setSubmitted(false);
          setErrorMessage('');
          onClose();
        }, 3000);
      } else {
        setErrorMessage(data.message || data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      setErrorMessage('Error submitting feedback — please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className={CARD_CLASS}>
        <p className={LABEL_CLASS}>Help us improve</p>
        <p className="font-serif text-xl text-ink">✓ {submitMessage}</p>
        {couponCode && (
          <div className="mt-4 border border-accent bg-accent/10 p-4">
            <div className="font-sans text-sm text-ink-muted mb-2">Your coupon code:</div>
            <div className="font-mono text-xl font-bold text-ink mb-3">{couponCode}</div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(couponCode);
                alert('Copied!');
              }}
              className="w-full bg-accent text-paper px-4 py-3 font-sans text-sm hover:bg-ink transition-colors duration-150"
            >
              Copy Code
            </button>
          </div>
        )}
        {isAnonymous && (
          <p className="font-sans text-sm text-ink-muted mt-4">
            Sign in and submit non-anonymously next time to earn a discount code worth up to ₱100.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={CARD_CLASS}>
      <p className={LABEL_CLASS}>Help us improve</p>
      <p className="font-sans text-sm text-ink-muted">
        You just finished{' '}
        {moduleTitle ? <span className="text-ink font-medium">{moduleTitle}</span> : 'this module'}.
        {' '}How was it?
      </p>

      <form onSubmit={handleSubmit}>
        {/* Module Rating */}
        <p className={QUESTION_CLASS}>How would you rate this module?</p>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setModuleRating(star)}
              className={`text-2xl leading-none transition-colors duration-150 hover:text-accent ${
                star <= moduleRating ? 'text-accent' : 'text-ink-faint'
              }`}
            >
              ★
            </button>
          ))}
        </div>

        {/* App Rating */}
        <p className={QUESTION_CLASS}>How would you rate the app overall?</p>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setAppRating(star)}
              className={`text-2xl leading-none transition-colors duration-150 hover:text-accent ${
                star <= appRating ? 'text-accent' : 'text-ink-faint'
              }`}
            >
              ★
            </button>
          ))}
        </div>

        {/* Feedback Text */}
        <p className={QUESTION_CLASS}>Any feedback? (optional)</p>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
          placeholder="Share your thoughts..."
          aria-label="Any feedback? (optional)"
          className="w-full border border-ink-faint/40 bg-transparent px-3 py-2.5 font-sans text-sm text-ink resize-y min-h-[5rem]"
          rows={4}
        />
        <div className="font-sans text-xs text-ink-faint mt-1">
          {feedback.length}/500
        </div>

        {/* Anonymous Checkbox */}
        {userId && (
          <label className="flex items-center gap-2 mt-3 font-sans text-[0.8125rem] text-ink-muted cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="accent-accent"
            />
            <span>Submit anonymously</span>
          </label>
        )}

        {/* Inline error (409 duplicate, 429 rate limit, network) */}
        {errorMessage && (
          <p role="alert" className="font-sans text-sm text-red-600 dark:text-red-400 mt-3">
            {errorMessage}
          </p>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button
            type="submit"
            disabled={isSubmitting || appRating === 0 || moduleRating === 0}
            className="bg-accent text-paper px-4 py-3 font-sans text-sm hover:bg-ink transition-colors duration-150 disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-1 py-3 font-sans text-sm text-ink-muted underline underline-offset-[3px] hover:text-ink transition-colors duration-150"
          >
            Not now
          </button>
        </div>
      </form>
    </div>
  );
}
