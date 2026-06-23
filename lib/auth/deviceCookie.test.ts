import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { signDeviceCookie, verifyDeviceCookie } from "./deviceCookie";

const UUID = "11111111-2222-4333-8444-555555555555";

describe("deviceCookie", () => {
  beforeEach(() => {
    process.env.DEVICE_COOKIE_SECRET = "test-device-secret";
  });
  afterEach(() => {
    delete process.env.DEVICE_COOKIE_SECRET;
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
    process.env.DEVICE_COOKIE_SECRET = "different-secret";
    expect(verifyDeviceCookie(signed)).toBeNull();
  });

  it("rejects a non-uuid payload even if signed", () => {
    process.env.DEVICE_COOKIE_SECRET = "test-device-secret";
    // Sign a non-uuid then confirm verify still refuses it.
    const notUuid = signDeviceCookie("not-a-uuid");
    expect(verifyDeviceCookie(notUuid)).toBeNull();
  });

  it("returns null for undefined / empty", () => {
    expect(verifyDeviceCookie(undefined)).toBeNull();
    expect(verifyDeviceCookie("")).toBeNull();
  });
});
