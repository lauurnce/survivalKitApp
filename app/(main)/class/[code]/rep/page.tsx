"use client";

import { use } from "react";
import { RepDashboard } from "./RepDashboard";

export default function RepDashboardPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  return <RepDashboard code={code} />;
}
