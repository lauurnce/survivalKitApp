import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  MIN_SECRET_LENGTH,
  signingSecretCandidates,
} from "./signingSecrets";

const PRIMARY_NAME = "DEVICE_COOKIE_SECRET";
const PREVIOUS_NAME = "DEVICE_COOKIE_SECRET_PREVIOUS";

const SHORT = "legacy-short-secret"; // < MIN_SECRET_LENGTH
const LONG = "primary-secret-that-is-long-enough!!"; // >= MIN_SECRET_LENGTH
const OLD = "previous-secret-also-long-enough!!"; // >= MIN_SECRET_LENGTH

describe("signingSecretCandidates", () => {
  beforeEach(() => {
    process.env[PRIMARY_NAME] = LONG;
    delete process.env[PREVIOUS_NAME];
  });
  afterEach(() => {
    delete process.env[PRIMARY_NAME];
    delete process.env[PREVIOUS_NAME];
  });

  it("returns only the primary when no previous secret is set", () => {
    expect(signingSecretCandidates(PRIMARY_NAME, PREVIOUS_NAME)).toEqual([LONG]);
  });

  it("lists the previous secret after the primary during a rotation window", () => {
    process.env[PRIMARY_NAME] = LONG;
    process.env[PREVIOUS_NAME] = OLD;
    expect(signingSecretCandidates(PRIMARY_NAME, PREVIOUS_NAME)).toEqual([
      LONG,
      OLD,
    ]);
  });

  it("treats an empty-string previous as unset", () => {
    process.env[PREVIOUS_NAME] = "";
    expect(signingSecretCandidates(PRIMARY_NAME, PREVIOUS_NAME)).toEqual([LONG]);
  });

  it("throws when the primary env var is not set", () => {
    delete process.env[PRIMARY_NAME];
    expect(() => signingSecretCandidates(PRIMARY_NAME, PREVIOUS_NAME)).toThrow(
      /DEVICE_COOKIE_SECRET env var is not set/,
    );
  });

  it("enforces the 32-character floor on every candidate", () => {
    expect(MIN_SECRET_LENGTH).toBe(32);
  });

  it("refuses a below-floor primary once the rotation window is open", () => {
    process.env[PRIMARY_NAME] = SHORT;
    process.env[PREVIOUS_NAME] = OLD;
    expect(() => signingSecretCandidates(PRIMARY_NAME, PREVIOUS_NAME)).toThrow(
      /DEVICE_COOKIE_SECRET must be at least 32 characters/,
    );
  });

  it("refuses a below-floor primary even with no rotation window open", () => {
    // The floor is unconditional on the primary. If it only applied while
    // *_PREVIOUS was set, deleting *_PREVIOUS at the end of the grace window
    // would silently switch enforcement back off — exactly when the operator
    // believes the rotation is finished.
    process.env[PRIMARY_NAME] = SHORT;
    expect(() => signingSecretCandidates(PRIMARY_NAME, PREVIOUS_NAME)).toThrow(
      /must be at least 32 characters/,
    );
  });

  it("refuses a below-floor primary when previous is set but empty", () => {
    process.env[PRIMARY_NAME] = SHORT;
    process.env[PREVIOUS_NAME] = "";
    expect(() => signingSecretCandidates(PRIMARY_NAME, PREVIOUS_NAME)).toThrow(
      /must be at least 32 characters/,
    );
  });

  it("refuses a below-floor previous secret (PR #14 reconciliation)", () => {
    // The pre-rebase design exempted *_PREVIOUS so a short legacy secret
    // could bridge a rotation. A key that can verify signatures is as
    // exploitable as one that can create them, so #14's invariant wins:
    // nothing below the floor participates in signing, ever.
    process.env[PRIMARY_NAME] = LONG;
    process.env[PREVIOUS_NAME] = SHORT;
    expect(() => signingSecretCandidates(PRIMARY_NAME, PREVIOUS_NAME)).toThrow(
      /DEVICE_COOKIE_SECRET_PREVIOUS must be at least 32 characters/,
    );
  });
});
