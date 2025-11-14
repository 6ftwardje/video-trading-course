"use client";

import { LucideIcon } from "lucide-react";

interface UserDropdownItemProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  hidden?: boolean;
}

export default function UserDropdownItem({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  hidden = false,
}: UserDropdownItemProps) {
  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
        disabled
          ? "cursor-not-allowed opacity-50 text-[var(--text-dim)]"
          : "text-white hover:bg-white/10 hover:text-[var(--accent)]"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

