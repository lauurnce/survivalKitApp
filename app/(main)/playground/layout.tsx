import type { Metadata } from "next";
import { RequestTimeLayout } from "@/lib/render/RequestTimeLayout";

// The page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Code Playground",
  description: "Write and run Python, SQL, Java, or C in your browser. Nothing to install.",
};

// Nonce-CSP route: must render per request (see lib/render/RequestTimeLayout).
export default RequestTimeLayout;
