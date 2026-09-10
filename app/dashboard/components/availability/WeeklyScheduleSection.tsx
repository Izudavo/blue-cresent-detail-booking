"use client";

import { Check, Clock3, Loader2, X } from "lucide-react";
import { useMemo, useState } from "react";

import { update_business_hours } from "@/app/actions/admin/availability.actions";
import type { BusinessHours } from "@/types/availability";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface WeeklyScheduleSectionProps {
  businessHours: BusinessHours[];
  showMessage: (value: string) => void;
  showError: (value: string) => void;
}

export function WeeklyScheduleSection({
  businessHours,
  showMessage,
  showError,
}: WeeklyScheduleSectionProps) {
  const [hours, setHours] = useState<BusinessHours[]>(businessHours);
  const [isSavingHours, setIsSavingHours] = useState(false);

  const openDays = useMemo(
    () => hours.filter((day) => day.is_open).length,
    [hours],
  );

  const updateDay = (dayOfWeek: number, updates: Partial<BusinessHours>) => {
    setHours((current) =>
      current.map((day) =>
        day.day_of_week === dayOfWeek
          ? {
              ...day,
              ...updates,
            }
          : day,
      ),
    );
  };

  const saveHours = async () => {
    setIsSavingHours(true);

    try {
      await update_business_hours(
        hours.map((day) => ({
          day_of_week: day.day_of_week,
          is_open: day.is_open,
          open_time: day.open_time,
          close_time: day.close_time,
        })),
      );

      showMessage("Weekly schedule saved successfully.");
    } catch (error) {
      console.error("Failed to save business hours:", error);

      showError(
        error instanceof Error
          ? error.message
          : "Failed to save weekly schedule.",
      );
    } finally {
      setIsSavingHours(false);
    }
  };

  return (
    <section className="rounded-2xl border border-black/10 bg-black/[0.02] p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-black text-white">
              <Clock3 className="size-4" />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
              Step 1
            </p>
          </div>

          <h2 className="mt-3 text-2xl font-bold">Weekly business hours</h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/50">
            These are your normal hours. Turn a day on or off, then choose when
            you open and close. Remember to save your changes when you're
            finished.
          </p>
        </div>

        <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black/55">
          <span className="font-bold text-black">{openDays}</span> of 7 days open
        </div>
      </div>

      <div className="mt-7 space-y-2">
        {DAY_NAMES.map((dayName, index) => {
          const day = hours.find((item) => item.day_of_week === index);

          if (!day) {
            return null;
          }

          return (
            <div
              key={dayName}
              className={`rounded-xl border p-4 transition ${
                day.is_open
                  ? "border-black/10 bg-white"
                  : "border-black/5 bg-black/[0.025]"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      updateDay(index, {
                        is_open: !day.is_open,
                        open_time: !day.is_open
                          ? (day.open_time ?? "08:00")
                          : null,
                        close_time: !day.is_open
                          ? (day.close_time ?? "18:00")
                          : null,
                      })
                    }
                    aria-pressed={day.is_open}
                    aria-label={`${dayName} ${
                      day.is_open ? "open" : "closed"
                    }. Click to change.`}
                    className={`relative flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition ${
                      day.is_open ? "bg-black" : "bg-black/15"
                    }`}
                  >
                    <span
                      className={`grid size-6 place-items-center rounded-full bg-white shadow-sm transition ${
                        day.is_open ? "translate-x-6" : "translate-x-0"
                      }`}
                    >
                      {day.is_open ? (
                        <Check className="size-3 text-black" />
                      ) : (
                        <X className="size-3 text-black/35" />
                      )}
                    </span>
                  </button>

                  <div>
                    <p className="text-sm font-bold">{dayName}</p>

                    <p className="mt-0.5 text-[11px] text-black/45">
                      {day.is_open
                        ? "Customers can book on this day."
                        : "Customers cannot book on this day."}
                    </p>
                  </div>
                </div>

                {day.is_open ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <TimeField
                      label="Opening time"
                      value={day.open_time ?? "08:00"}
                      onChange={(value) =>
                        updateDay(index, {
                          open_time: value,
                        })
                      }
                    />

                    <span className="hidden text-black/25 sm:block">to</span>

                    <TimeField
                      label="Closing time"
                      value={day.close_time ?? "18:00"}
                      onChange={(value) =>
                        updateDay(index, {
                          close_time: value,
                        })
                      }
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2">
                    <X className="size-3.5 text-black/35" />

                    <span className="text-xs font-semibold text-black/45">
                      Closed
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-black/60">
            Changes are not applied until you save.
          </p>

          <p className="mt-1 text-[11px] text-black/40">
            All times use South Carolina business time.
          </p>
        </div>

        <button
          type="button"
          onClick={saveHours}
          disabled={isSavingHours}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSavingHours ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving schedule...
            </>
          ) : (
            <>
              <Check className="size-4" />
              Save weekly hours
            </>
          )}
        </button>
      </div>
    </section>
  );
}

export function TimeField({
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
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">
        {label}
      </span>
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-black/10 bg-black/[0.03] px-3 py-2.5 text-sm font-medium text-black outline-none transition focus:border-black sm:min-w-36"
      />
    </label>
  );
}