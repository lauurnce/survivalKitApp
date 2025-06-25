// PayMongo sends the reader back to the module with ?payment=success. Kept
// apart from hooks/useSubscriptionStatus so components can read it without
// pulling the store into tests that mock the hook.

export function hasPaymentMarker(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("payment") === "success";
}
