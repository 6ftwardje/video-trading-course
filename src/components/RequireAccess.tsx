"use client";

import { ReactNode } from "react";
import { LockedOverlay } from "./LockedOverlay";

interface RequireAccessProps {
  requiredLevel: number;
  accessLevel: number;
  children: ReactNode;
}

export function RequireAccess({
  requiredLevel,
  accessLevel,
  children,
}: RequireAccessProps) {
  if (accessLevel >= requiredLevel) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[200px]">
      <LockedOverlay />
    </div>
  );
}

