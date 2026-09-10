"use client";

import { Check, Clock3, Info, X } from "lucide-react";
import { useState } from "react";

import type { AvailabilityOverride, BusinessHours } from "@/types/availability";

import { DateOverridesSection } from "./DateOverridesSection";
import { OverrideFormSection, type OverrideForm } from "./OverrideFormSection";
import { WeeklyScheduleSection } from "./WeeklyScheduleSection";

interface AvailabilityProps {
  businessHours: BusinessHours[];
  availabilityOverrides: AvailabilityOverride[];
}

export function Availability({
  businessHours,
  availabilityOverrides,
}: AvailabilityProps) {
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>(
    availabilityOverrides,
  );

  const [showOverrideForm, setShowOverrideForm] = useState(false);

  const [editingOverrideId, setEditingOverrideId] = useState<string | null>(
    null,
  );

  const [overrideForm, setOverrideForm] = useState<OverrideForm>({
    date: "",
    is_open: true,
    open_time: "08:00",
    close_time: "18:00",
    reason: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const showMessage = (value: string) => {
    setMessage(value);
    setError("");

    window.setTimeout(() => {
      setMessage("");
    }, 2400);
  };

  const showError = (value: string) => {
    setError(value);
    setMessage("");

    window.setTimeout(() => {
      setError("");
    }, 3000);
  };

  const resetOverrideForm = () => {
    setOverrideForm({
      date: "",
      is_open: true,
      open_time: "08:00",
      close_time: "18:00",
      reason: "",
    });

    setEditingOverrideId(null);
    setShowOverrideForm(false);
  };

  const openCreateOverride = () => {
    setEditingOverrideId(null);

    setOverrideForm({
      date: "",
      is_open: true,
      open_time: "08:00",
      close_time: "18:00",
      reason: "",
    });

    setError("");
    setMessage("");
    setShowOverrideForm(true);
  };

  const openEditOverride = (override: AvailabilityOverride) => {
    setOverrideForm({
      date: format_date_for_input(override.date),
      is_open: override.is_open,
      open_time: override.open_time ?? "08:00",
      close_time: override.close_time ?? "18:00",
      reason: override.reason ?? "",
    });

    setEditingOverrideId(override.id);

    setShowOverrideForm(true);
    setError("");
  };

  return (
    <div className="mt-9 space-y-6">
      {message && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="flex items-center gap-2.5 rounded-full bg-black px-4 py-2.5 text-xs font-medium text-white shadow-xl">
            <Check className="size-4" />
            {message}
          </div>
        </div>
      )}

      {error && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="flex items-center gap-2.5 rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-medium text-black shadow-xl">
            <X className="size-4" />
            {error}
          </div>
        </div>
      )}

      {/* Page introduction */}
      <section className="rounded-2xl border border-black/10 bg-black/[0.02] p-5 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
              Availability settings
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Manage when customers can book
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-black/55">
              Set your normal weekly business hours below. If a specific date
              needs different hours or needs to be closed, add a date override.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3">
            <div className="grid size-9 place-items-center rounded-lg bg-black text-white">
              <Clock3 className="size-4" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">
                Business timezone
              </p>

              <p className="mt-0.5 text-xs font-semibold text-black">
                America/New_York
              </p>

              <p className="mt-0.5 text-[10px] text-black/40">South Carolina</p>
            </div>
          </div>
        </div>
      </section>

      {/* How availability works */}
      <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-black text-white">
            <Info className="size-4" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/45">
              How this works
            </p>

            <h2 className="mt-1 text-lg font-bold">
              Your weekly schedule is the default
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-black/50">
              Customers will normally be able to book within your weekly
              business hours. A date override takes priority over the weekly
              schedule for that specific date.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <InfoStep
            number="01"
            title="Regular hours"
            description="Set the hours you normally operate each week."
          />

          <InfoStep
            number="02"
            title="Date exceptions"
            description="Close a date or set different hours when needed."
          />

          <InfoStep
            number="03"
            title="Customer bookings"
            description="The booking system will use these settings when showing available times."
          />
        </div>
      </section>

      {/* Weekly schedule component */}
      <WeeklyScheduleSection
        businessHours={businessHours}
        showMessage={showMessage}
        showError={showError}
      />

      {/* Date overrides list component */}
      <DateOverridesSection
        overrides={overrides}
        setOverrides={setOverrides}
        editingOverrideId={editingOverrideId}
        openCreateOverride={openCreateOverride}
        openEditOverride={openEditOverride}
        resetOverrideForm={resetOverrideForm}
        showMessage={showMessage}
        showError={showError}
      />

      {/* Override creation/editing modal component */}
      {showOverrideForm && (
        <OverrideFormSection
          overrideForm={overrideForm}
          setOverrideForm={setOverrideForm}
          editingOverrideId={editingOverrideId}
          resetOverrideForm={resetOverrideForm}
          setOverrides={setOverrides}
          showMessage={showMessage}
          showError={showError}
        />
      )}
    </div>
  );
}

function InfoStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-black/[0.025] p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-7 place-items-center rounded-md bg-black text-[10px] font-bold text-white">
          {number}
        </span>
        <p className="text-xs font-bold">{title}</p>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-black/45">
        {description}
      </p>
    </div>
  );
}

function format_date_for_input(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}