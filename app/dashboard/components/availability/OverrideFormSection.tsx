"use client";

import { CalendarDays, Check, Loader2, X } from "lucide-react";
import { useState } from "react";

import {
  create_availability_override,
  update_availability_override,
} from "@/app/actions/admin/availability.actions";
import type { AvailabilityOverride } from "@/types/availability";

export interface OverrideForm {
  date: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
  reason: string;
}

interface OverrideFormSectionProps {
  overrideForm: OverrideForm;
  setOverrideForm: React.Dispatch<React.SetStateAction<OverrideForm>>;
  editingOverrideId: string | null;
  resetOverrideForm: () => void;
  setOverrides: React.Dispatch<React.SetStateAction<AvailabilityOverride[]>>;
  showMessage: (value: string) => void;
  showError: (value: string) => void;
}

export function OverrideFormSection({
  overrideForm,
  setOverrideForm,
  editingOverrideId,
  resetOverrideForm,
  setOverrides,
  showMessage,
  showError,
}: OverrideFormSectionProps) {
  const [isSavingOverride, setIsSavingOverride] = useState(false);

  const saveOverride = async () => {
    if (!overrideForm.date) {
      showError("Please select a date.");
      return;
    }

    setIsSavingOverride(true);

    try {
      const input = {
        date: overrideForm.date,
        is_open: overrideForm.is_open,
        open_time: overrideForm.is_open ? overrideForm.open_time : null,
        close_time: overrideForm.is_open ? overrideForm.close_time : null,
        reason: overrideForm.reason.trim() || null,
      };

      if (editingOverrideId) {
        await update_availability_override(editingOverrideId, input);

        setOverrides((current) =>
          current.map((override) =>
            override.id === editingOverrideId
              ? {
                  ...override,
                  date: new Date(`${input.date}T00:00:00.000Z`),
                  is_open: input.is_open,
                  open_time: input.open_time,
                  close_time: input.close_time,
                  reason: input.reason,
                }
              : override,
          ),
        );

        showMessage("Date override updated successfully.");
      } else {
        await create_availability_override(input);
        window.location.reload();
        return;
      }

      resetOverrideForm();
    } catch (error) {
      console.error("Failed to save availability override:", error);

      showError(
        error instanceof Error
          ? error.message
          : "Failed to save availability override.",
      );
    } finally {
      setIsSavingOverride(false);
    }
  };

  const today = get_today_string();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4">
      <section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-black p-4 text-white shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid size-7 place-items-center rounded-lg bg-white/10 text-white sm:size-8">
                <CalendarDays className="size-3.5 sm:size-4" />
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 sm:text-xs">
                {editingOverrideId ? "Edit exception" : "New exception"}
              </p>
            </div>

            <h2 className="mt-2 text-lg font-bold text-white sm:mt-3 sm:text-xl">
              Change availability for one date
            </h2>

            <p className="mt-1 text-xs leading-relaxed text-white/60 sm:mt-2 sm:text-sm">
              Choose whether the business will be open or closed. If open, set
              the special hours for this date.
            </p>
          </div>

          <button
            type="button"
            onClick={resetOverrideForm}
            className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Close date exception form"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:mt-6 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
              Date
            </span>

            <input
              type="date"
              min={today}
              value={overrideForm.date}
              onChange={(event) =>
                setOverrideForm((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white outline-none transition focus:border-white sm:text-sm"
            />

            <span className="mt-1 block text-[10px] text-white/40">
              Today and future dates can be selected.
            </span>
          </label>

          <div>
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
              What happens on this date?
            </span>

            <div className="flex rounded-lg border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() =>
                  setOverrideForm((current) => ({
                    ...current,
                    is_open: true,
                  }))
                }
                className={`flex-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition sm:text-xs ${
                  overrideForm.is_open
                    ? "bg-black text-white shadow-sm ring-1 ring-white/20"
                    : "text-white/50 hover:text-white"
                }`}
              >
                Open with special hours
              </button>

              <button
                type="button"
                onClick={() =>
                  setOverrideForm((current) => ({
                    ...current,
                    is_open: false,
                  }))
                }
                className={`flex-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition sm:text-xs ${
                  !overrideForm.is_open
                    ? "bg-black text-white shadow-sm ring-1 ring-white/20"
                    : "text-white/50 hover:text-white"
                }`}
              >
                Closed
              </button>
            </div>
          </div>

          {overrideForm.is_open && (
            <>
              <ModalTimeField
                label="Special opening time"
                value={overrideForm.open_time}
                onChange={(value) =>
                  setOverrideForm((current) => ({
                    ...current,
                    open_time: value,
                  }))
                }
              />

              <ModalTimeField
                label="Special closing time"
                value={overrideForm.close_time}
                onChange={(value) =>
                  setOverrideForm((current) => ({
                    ...current,
                    close_time: value,
                  }))
                }
              />
            </>
          )}

          <label className="block sm:col-span-2">
            <div className="flex items-center justify-between">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
                Reason
              </span>

              <span className="text-[10px] text-white/40">
                {overrideForm.reason.length}/255
              </span>
            </div>

            <input
              type="text"
              maxLength={255}
              value={overrideForm.reason}
              onChange={(event) =>
                setOverrideForm((current) => ({
                  ...current,
                  reason: event.target.value,
                }))
              }
              placeholder="e.g. Holiday, staff unavailable, special hours"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none transition placeholder:text-white/30 focus:border-white sm:text-sm"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 border-t border-white/10 pt-4 sm:mt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={resetOverrideForm}
            className="w-full rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={saveOverride}
            disabled={isSavingOverride}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-black px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-neutral-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isSavingOverride ? (
              <>
                <Loader2 className="size-3.5 animate-spin text-white" />
                Saving...
              </>
            ) : (
              <>
                <Check className="size-3.5 text-white" />
                {editingOverrideId ? "Save exception" : "Add exception"}
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

function ModalTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
        {label}
      </span>
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white outline-none transition focus:border-white sm:text-sm"
      />
    </label>
  );
}

function get_today_string(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}