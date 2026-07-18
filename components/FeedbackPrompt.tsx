'use client';

import { useState } from 'react';
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
  onClose: () => void;
  onSubmit?: (data: FeedbackResponse) => void;
  userId?: string | null;
}

export function FeedbackPrompt({
  isOpen,
  moduleId,
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
        setTimeout(() => {
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-paper dark:bg-navy rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-serif text-ink mb-4">✓ {submitMessage}</h2>
          {couponCode && (
            <div className="bg-accent/10 border border-accent rounded p-4 mb-4">
              <div className="text-sm text-ink-muted mb-2">Your coupon code:</div>
              <div className="text-xl font-mono font-bold text-ink mb-2">{couponCode}</div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(couponCode);
                  alert('Copied!');
                }}
                className="w-full bg-accent text-paper px-4 py-2 rounded hover:bg-ink transition-colors"
              >
                Copy Code
              </button>
            </div>
          )}
          {isAnonymous && (
            <p className="text-sm text-ink-muted mb-4">
              Sign in and submit non-anonymously next time to earn a ₱100 discount code.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-paper dark:bg-navy rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-serif text-ink mb-6">Help us improve</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Module Rating */}
          <div>
            <label className="block text-sm font-sans text-ink-muted mb-2">
              How would you rate this module?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setModuleRating(star)}
                  className={`p-1 transition text-xl ${
                    star <= moduleRating
                      ? 'text-accent'
                      : 'text-taupe hover:text-ink-muted'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* App Rating */}
          <div>
            <label className="block text-sm font-sans text-ink-muted mb-2">
              How would you rate the app overall?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setAppRating(star)}
                  className={`p-1 transition text-xl ${
                    star <= appRating
                      ? 'text-accent'
                      : 'text-taupe hover:text-ink-muted'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <label className="block text-sm font-sans text-ink-muted mb-2">
              Any feedback? (optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
              placeholder="Share your thoughts..."
              className="w-full border border-taupe rounded px-3 py-2 bg-paper dark:bg-navy text-ink resize-none font-sans"
              rows={4}
            />
            <div className="text-xs text-ink-faint mt-1">
              {feedback.length}/500
            </div>
          </div>

          {/* Anonymous Checkbox */}
          {userId && (
            <div>
              <label className="flex items-center gap-2 text-sm font-sans">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded accent"
                />
                <span className="text-ink-muted">Submit anonymously</span>
              </label>
            </div>
          )}

          {/* Inline error (409 duplicate, 429 rate limit, network) */}
          {errorMessage && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || appRating === 0 || moduleRating === 0}
              className="flex-1 bg-accent text-paper px-4 py-2 rounded hover:bg-ink transition-colors disabled:opacity-60 font-sans font-medium text-sm"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-taupe text-ink px-4 py-2 rounded hover:bg-ink-muted transition-colors font-sans font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
