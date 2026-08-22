import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { signDeviceCookie, verifyDeviceCookie } from "./deviceCookie";

const UUID = "11111111-2222-4333-8444-555555555555";

// A realistic rotation: the old production secret is short, its replacement
// meets the 32-character floor.
const OLD_SECRET = "old-device-secret";
const NEW_SECRET = "new-device-secret-at-least-32-characters";

describe("deviceCookie", () => {
  beforeEach(() => {
    process.env.DEVICE_COOKIE_SECRET = "test-device-secret-at-least-32-bytes";
    delete process.env.DEVICE_COOKIE_SECRET_PREVIOUS;
  });
  afterEach(() => {
    delete process.env.DEVICE_COOKIE_SECRET;
    delete process.env.DEVICE_COOKIE_SECRET_PREVIOUS;
  });

  it("round-trips a valid device id", () => {
    expect(verifyDeviceCookie(signDeviceCookie(UUID))).toBe(UUID);
  });

  it("rejects an unsigned (forged) value", () => {
    // A user copying just the raw UUID into the cookie must not verify.
    expect(verifyDeviceCookie(UUID)).toBeNull();
  });

  it("rejects a tampered signature", () => {
    const signed = signDeviceCookie(UUID);
    expect(verifyDeviceCookie(`${signed}tampered`)).toBeNull();
  });

  it("rejects a valid signature from a different secret", () => {
    const signed = signDeviceCookie(UUID);
    process.env.DEVICE_COOKIE_SECRET = "different-device-secret-at-least-32-bytes";
    expect(verifyDeviceCookie(signed)).toBeNull();
  });

  it("rejects a non-uuid payload even if signed", () => {
    process.env.DEVICE_COOKIE_SECRET = "test-device-secret-at-least-32-bytes";
    // Sign a non-uuid then confirm verify still refuses it.
    const notUuid = signDeviceCookie("not-a-uuid");
    expect(verifyDeviceCookie(notUuid)).toBeNull();
  });

  it("returns null for undefined / empty", () => {
    expect(verifyDeviceCookie(undefined)).toBeNull();
    expect(verifyDeviceCookie("")).toBeNull();
  });

  it("refuses to sign with a short secret once a rotation window is open", () => {
    process.env.DEVICE_COOKIE_SECRET = "too-short";
    process.env.DEVICE_COOKIE_SECRET_PREVIOUS = "legacy-old-secret";
    expect(() => signDeviceCookie(UUID)).toThrow(/at least 32/);
  });

  it("behaves exactly as before when no previous secret is configured", () => {
    // The whole suite above runs without *_PREVIOUS set; assert the pure
    // refactor property explicitly: sign + verify with a short legacy
    // primary, tampering still rejected.
    const signed = signDeviceCookie(UUID);
    expect(verifyDeviceCookie(signed)).toBe(UUID);
    expect(verifyDeviceCookie(`${signed}tampered`)).toBeNull();
    expect(verifyDeviceCookie("forged-value")).toBeNull();
  });
});

describe("deviceCookie rotation window", () => {
  beforeEach(() => {
    delete process.env.DEVICE_COOKIE_SECRET_PREVIOUS;
  });
  afterEach(() => {
    delete process.env.DEVICE_COOKIE_SECRET;
    delete process.env.DEVICE_COOKIE_SECRET_PREVIOUS;
  });

  it("verifies cookies minted with the previous secret during rotation", () => {
    // Pre-rotation: paying subscriber holds a cookie signed with the old,
    // short secret.
    process.env.DEVICE_COOKIE_SECRET = OLD_SECRET;
    const subscriberCookie = signDeviceCookie(UUID);

    // Rotation: new long primary, old secret demoted to previous.
    process.env.DEVICE_COOKIE_SECRET = NEW_SECRET;
    process.env.DEVICE_COOKIE_SECRET_PREVIOUS = OLD_SECRET;

    expect(verifyDeviceCookie(subscriberCookie)).toBe(UUID);
  });

  it("signs new cookies with the rotated primary, not the previous", () => {
    process.env.DEVICE_COOKIE_SECRET = NEW_SECRET;
    process.env.DEVICE_COOKIE_SECRET_PREVIOUS = OLD_SECRET;

    const fresh = signDeviceCookie(UUID);
    expect(verifyDeviceCookie(fresh)).toBe(UUID);

    // Closing the window must not invalidate cookies issued during it.
    delete process.env.DEVICE_COOKIE_SECRET_PREVIOUS;
    expect(verifyDeviceCookie(fresh)).toBe(UUID);
  });

  it("still rejects signatures from secrets outside the window", () => {
    process.env.DEVICE_COOKIE_SECRET = OLD_SECRET;
    const stale = signDeviceCookie(UUID);

    process.env.DEVICE_COOKIE_SECRET = NEW_SECRET;
    process.env.DEVICE_COOKIE_SECRET_PREVIOUS = "some-other-old-secret";
    expect(verifyDeviceCookie(stale)).toBeNull();
  });

  it("refuses to mint cookies with a short primary once rotating", () => {
    process.env.DEVICE_COOKIE_SECRET = OLD_SECRET;
    process.env.DEVICE_COOKIE_SECRET_PREVIOUS = OLD_SECRET;
    expect(() => signDeviceCookie(UUID)).toThrow(/at least 32/);
  });

  it("keeps verifying short-primary cookies while only the primary is configured", () => {
    // Step 1 of the runbook: code deployed, env vars untouched.
    process.env.DEVICE_COOKIE_SECRET = OLD_SECRET;
    expect(verifyDeviceCookie(signDeviceCookie(UUID))).toBe(UUID);
  });
});
