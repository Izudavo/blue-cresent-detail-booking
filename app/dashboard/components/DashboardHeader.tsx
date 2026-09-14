"use client";

import { Bell, LogOut, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { logout_admin_action } from "@/app/actions/admin/auth.actions";

import { get_business_current_date } from "@/lib/utils/date";

interface DashboardHeaderProps {
  adminUsername: string;
  pendingBookingCount: number;
  onMenu: () => void;
}

export function DashboardHeader({
  adminUsername,
  pendingBookingCount,
  onMenu,
}: DashboardHeaderProps) {
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [show_logout_modal, setShowLogoutModal] = useState(false);

  const currentDate = get_business_current_date();

  const has_pending_bookings = pendingBookingCount > 0;

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

  const handleLogoutClick = () => {
    if (isLoggingOut) {
      return;
    }

    setShowLogoutModal(true);
  };

  const handleCancelLogout = () => {
    if (isLoggingOut) {
      return;
    }

    setShowLogoutModal(false);
  };

  return (
    <>
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
            aria-label={
              has_pending_bookings
                ? `${pendingBookingCount} pending booking${
                    pendingBookingCount === 1 ? "" : "s"
                  }`
                : "No new notifications"
            }
            title={
              has_pending_bookings
                ? `${pendingBookingCount} pending booking${
                    pendingBookingCount === 1 ? "" : "s"
                  }`
                : "No new notifications"
            }
            className="relative rounded-lg p-1.5 text-black/45 transition hover:bg-black/[0.05] hover:text-black active:scale-95"
          >
            <Bell className="size-4" />

            {has_pending_bookings && (
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-red-500 ring-2 ring-white" />
            )}
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
              onClick={handleLogoutClick}
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

      {/* Logout Confirmation Modal */}
      {show_logout_modal && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={handleCancelLogout}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            aria-describedby="logout-modal-description"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-black/15 bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-black/10 bg-black/[0.02] px-5 py-4">
              <div>
                <h2
                  id="logout-modal-title"
                  className="text-sm font-bold text-black"
                >
                  Log out?
                </h2>

                <p
                  id="logout-modal-description"
                  className="mt-1 text-xs leading-relaxed text-black/50"
                >
                  Are you sure you want to log out of the admin dashboard?
                </p>
              </div>

              <button
                type="button"
                aria-label="Close logout confirmation"
                onClick={handleCancelLogout}
                disabled={isLoggingOut}
                className="grid size-7 shrink-0 place-items-center rounded-lg border border-black/10 bg-white text-black/45 transition hover:border-black/20 hover:bg-black/[0.04] hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 border-t border-black/10 bg-black/[0.02] px-5 py-3">
              <button
                type="button"
                onClick={handleCancelLogout}
                disabled={isLoggingOut}
                className="rounded-lg border border-black/15 bg-white px-4 py-2 text-xs font-semibold text-black/60 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-black/80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
