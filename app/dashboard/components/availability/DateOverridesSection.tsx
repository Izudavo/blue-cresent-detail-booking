"use client";

import {
  CalendarDays,
  Info,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

import { delete_availability_override } from "@/app/actions/admin/availability.actions";
import type { AvailabilityOverride } from "@/types/availability";

interface DateOverridesSectionProps {
  overrides: AvailabilityOverride[];
  setOverrides: React.Dispatch<React.SetStateAction<AvailabilityOverride[]>>;
  editingOverrideId: string | null;
  openCreateOverride: () => void;
  openEditOverride: (override: AvailabilityOverride) => void;
  resetOverrideForm: () => void;
  showMessage: (value: string) => void;
  showError: (value: string) => void;
}

export function DateOverridesSection({
  overrides,
  setOverrides,
  editingOverrideId,
  openCreateOverride,
  openEditOverride,
  resetOverrideForm,
  showMessage,
  showError,
}: DateOverridesSectionProps) {
  const [deletingOverrideId, setDeletingOverrideId] = useState<string | null>(
    null,
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const promptDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const executeDelete = async (id: string) => {
    if (deletingOverrideId) {
      return;
    }

    setDeletingOverrideId(id);
    setConfirmDeleteId(null);

    try {
      await delete_availability_override(id);

      setOverrides((current) =>
        current.filter((override) => override.id !== id),
      );

      if (editingOverrideId === id) {
        resetOverrideForm();
      }

      showMessage("Date override removed.");
    } catch (error) {
      console.error("Failed to delete availability override:", error);

      showError(
        error instanceof Error
          ? error.message
          : "Failed to delete availability override.",
      );
    } finally {
      setDeletingOverrideId(null);
    }
  };

  return (
    <section className="relative rounded-2xl border border-black/10 bg-black/[0.02] p-5 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-black text-white">
              <CalendarDays className="size-4" />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
              Step 2
            </p>
          </div>

          <h2 className="mt-3 text-2xl font-bold">Date overrides</h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/50">
            Use an override when a specific date is different from your normal
            weekly schedule. For example, a holiday closure or special opening
            hours.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateOverride}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-black/80 active:scale-95"
        >
          <Plus className="size-4" />
          Add date exception
        </button>
      </div>

      {/* Explanation */}
      <div className="mt-6 rounded-xl border border-black/10 bg-white p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-4 shrink-0 text-black/40" />

          <div>
            <p className="text-xs font-bold text-black">
              Overrides take priority
            </p>

            <p className="mt-1 text-[11px] leading-relaxed text-black/45">
              If Monday is normally open from 8:00 AM to 6:00 PM but you create
              a closed override for a particular Monday, that date will be
              treated as closed.
            </p>
          </div>
        </div>
      </div>

      {overrides.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-black/15 bg-white px-5 py-12 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-xl bg-black/[0.04]">
            <CalendarDays className="size-6 text-black/30" />
          </div>

          <p className="mt-4 text-sm font-bold">No date exceptions yet</p>

          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-black/45">
            Your weekly schedule will apply to all upcoming dates unless you add
            an exception.
          </p>

          <button
            type="button"
            onClick={openCreateOverride}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-black/10 bg-black/[0.03] px-4 py-2 text-xs font-semibold text-black transition hover:bg-black/10"
          >
            <Plus className="size-4" />
            Add your first exception
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {overrides.map((override) => (
            <div
              key={override.id}
              className="rounded-xl border border-black/10 bg-white p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-black text-white">
                    <CalendarDays className="size-4" />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      {format_display_date(override.date)}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          override.is_open
                            ? "bg-black text-white"
                            : "border border-black/10 bg-black/[0.04] text-black/45"
                        }`}
                      >
                        {override.is_open ? "Open" : "Closed"}
                      </span>

                      {override.is_open &&
                        override.open_time &&
                        override.close_time && (
                          <span className="text-xs font-medium text-black/55">
                            {override.open_time} – {override.close_time}
                          </span>
                        )}

                      {override.reason && (
                        <>
                          <span className="text-black/20">•</span>

                          <span className="text-xs text-black/45">
                            {override.reason}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 lg:pl-4">
                  <button
                    type="button"
                    onClick={() => openEditOverride(override)}
                    className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold text-black/55 transition hover:bg-black/[0.04] hover:text-black"
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => promptDelete(override.id)}
                    disabled={deletingOverrideId === override.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold text-black/55 transition hover:bg-black/[0.04] hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {deletingOverrideId === override.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Snack Bar Confirmation for Deletion (Mobile-Optimized) */}
      {confirmDeleteId && (
        <div className="fixed bottom-4 left-3 right-3 z-50 flex max-w-lg flex-col gap-3 rounded-xl border border-white/10 bg-black p-3.5 text-white shadow-2xl sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:flex-row sm:items-center sm:gap-4 sm:rounded-2xl sm:px-5 sm:py-3.5">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-amber-400" />
            <p className="text-xs font-medium text-white">
              Remove this date override?
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={cancelDelete}
              className="flex-1 rounded-lg border border-white/20 px-3 py-1.5 text-[11px] font-semibold text-white/80 transition hover:bg-white/10 hover:text-white sm:flex-initial sm:text-xs"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => executeDelete(confirmDeleteId)}
              className="flex-1 rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-red-500 sm:flex-initial sm:text-xs"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function format_display_date(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
