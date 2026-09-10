"use client";

import { Bell, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { logout_admin_action } from "@/app/actions/admin/auth.actions";

import {
  get_business_current_date,
} from "@/lib/utils/date";

interface DashboardHeaderProps {
  adminUsername: string;
  onMenu: () => void;
}

export function DashboardHeader({
  adminUsername,
  onMenu,
}: DashboardHeaderProps) {
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const currentDate = get_business_current_date();

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);

      await logout_admin_action();

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Failed to log out:", error);

      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-black/10 bg-white/90 px-4 backdrop-blur-md sm:px-6">
      {/* Mobile Menu Button */}
      <button
        type="button"
        aria-label="Open navigation"
        onClick={onMenu}
        className="rounded-lg border border-black/10 bg-black/[0.03] p-1.5 text-black/50 transition hover:bg-black/10 hover:text-black active:scale-95 lg:hidden"
      >
        <Menu className="size-4" />
      </button>

      {/* Date Indicator */}
      <div className="hidden lg:block">
        <p className="text-[11px] font-medium uppercase tracking-wider text-black/45">
          {currentDate}
        </p>
      </div>

      {/* Header Actions & Profile */}
      <div className="ml-auto flex items-center gap-3">
        {/* Notification Button */}
        <button
          type="button"
          aria-label="View notifications"
          className="relative rounded-lg p-1.5 text-black/45 transition hover:bg-black/[0.05] hover:text-black active:scale-95"
        >
          <Bell className="size-4" />

          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-black ring-2 ring-white" />
        </button>

        <div className="hidden h-4 w-px bg-black/10 sm:block" />

        {/* User Profile */}
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full border border-black/15 bg-black text-[11px] font-semibold text-white">
            {adminUsername.slice(0, 2).toUpperCase()}
          </span>

          <span className="hidden text-xs font-medium text-black sm:block">
            {adminUsername}
          </span>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Log out"
            title="Log out"
            className="rounded-lg p-1.5 text-black/40 transition hover:bg-black/[0.05] hover:text-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
