"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Package,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import type { DashboardTab } from "../data";

import { logout_admin_action } from "@/app/actions/admin/auth.actions";

interface SidebarProps {
  adminUsername: string;
  activeTab: DashboardTab;
  open: boolean;
  onClose: () => void;
  onSelect: (tab: DashboardTab) => void;
}

export function Sidebar({
  adminUsername,
  activeTab,
  open,
  onClose,
  onSelect,
}: SidebarProps) {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 h-screen shrink-0 border-r border-black/10 bg-black transition-all duration-200 lg:sticky lg:top-0 lg:static ${
          collapsed ? "lg:w-16" : "lg:w-60"
        } w-60 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col px-3 py-4">
          {/* Header & Logo */}
          <div className="flex shrink-0 items-center justify-between px-1">
            <Link href="/" className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/15 bg-white/10 text-sm font-black text-white">
                ◒
              </span>

              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-sans text-xs font-bold uppercase tracking-wider text-white">
                    Blue Crescent
                  </span>

                  <span className="block truncate text-[9px] font-medium uppercase tracking-widest text-white/40">
                    Admin Console
                  </span>
                </div>
              )}
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              aria-label="Close navigation"
              onClick={onClose}
              className="rounded-md p-1 text-white/40 transition hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X className="size-4" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed(!collapsed)}
              className="hidden rounded-md p-1 text-white/40 transition hover:bg-white/10 hover:text-white lg:block"
            >
              {collapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronLeft className="size-4" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav
            className="mt-6 shrink-0 space-y-1"
            aria-label="Dashboard navigation"
          >
            {!collapsed && (
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                Workspace
              </p>
            )}

            <NavButton
              active={activeTab === "overview"}
              collapsed={collapsed}
              title="Overview"
              onClick={() => {
                onSelect("overview");
                onClose();
              }}
            >
              <LayoutDashboard className="size-4 shrink-0" />

              {!collapsed && <span>Overview</span>}
            </NavButton>

            <NavButton
              active={activeTab === "packages"}
              collapsed={collapsed}
              title="Packages & Pricing"
              onClick={() => {
                onSelect("packages");
                onClose();
              }}
            >
              <Package className="size-4 shrink-0" />

              {!collapsed && <span>Packages & Pricing</span>}
            </NavButton>

            <NavButton
              active={activeTab === "availability"}
              collapsed={collapsed}
              title="Availability"
              onClick={() => {
                onSelect("availability");
                onClose();
              }}
            >
              <CalendarClock className="size-4 shrink-0" />

              {!collapsed && <span>Availability</span>}
            </NavButton>
          </nav>

          {/* Footer Area */}
          <div className="mt-auto shrink-0 space-y-2 border-t border-white/10 pt-3">
            <Link
              href="/packages"
              title="View public site"
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-white/45 transition hover:bg-white/10 hover:text-white ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <ArrowUpRight className="size-3.5 shrink-0" />

              {!collapsed && <span>View public site</span>}
            </Link>

            {/* Profile Bar */}
            <div
              className={`flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.05] p-2 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-[10px] font-bold text-white">
                {adminUsername.slice(0, 2).toUpperCase()}
              </span>

              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-white">
                      {adminUsername}
                    </span>

                    <span className="block text-[10px] text-white/40">
                      Administrator
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    aria-label="Log out"
                    title="Log out"
                    className="rounded-md p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <LogOut className="size-3.5" />
                  </button>
                </>
              )}

              {collapsed && (
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  aria-label="Log out"
                  title="Log out"
                  className="hidden rounded-md p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 lg:block"
                >
                  <LogOut className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-xs lg:hidden"
        />
      )}
    </>
  );
}

function NavButton({
  active,
  collapsed,
  title,
  onClick,
  children,
}: {
  active: boolean;
  collapsed: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? title : undefined}
      className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs font-medium transition ${
        collapsed ? "justify-center" : ""
      } ${
        active
          ? "bg-white text-black font-semibold"
          : "text-white/45 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
