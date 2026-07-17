"use client";

import { use } from "react";
import { ClassJoinRequest } from "./ClassJoinRequest";

export default function ClassJoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  return <ClassJoinRequest code={code} />;
}
