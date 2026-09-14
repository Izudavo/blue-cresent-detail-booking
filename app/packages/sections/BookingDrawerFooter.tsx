import { LoaderCircle } from "lucide-react";

import type { BookingStep } from "./useBookingDrawer";

interface BookingDrawerFooterProps {
  currentStep: BookingStep;
  totalSteps: number;
  isSubmitting: boolean;
  canContinue: () => boolean;
  goBack: () => void;
  goNext: () => void;
}

export function BookingDrawerFooter({
  currentStep,
  totalSteps,
  isSubmitting,
  canContinue,
  goBack,
  goNext,
}: BookingDrawerFooterProps) {
  return (
    <div className="flex items-center justify-between border-t border-border bg-ink p-6 shadow-lg">
      {currentStep > 1 ? (
        <button
          type="button"
          onClick={goBack}
          disabled={isSubmitting}
          className="rounded-xl border border-border px-5 py-2.5 text-xs font-semibold text-white hover:bg-background disabled:opacity-30"
        >
          Back
        </button>
      ) : (
        <div />
      )}
      {currentStep < totalSteps ? (
        <button
          type="button"
          onClick={goNext}
          disabled={!canContinue() || isSubmitting}
          className="btn-base btn-primary text-xs disabled:opacity-30"
        >
          Continue
        </button>
      ) : (
        <button
          type="submit"
          form="booking-drawer-form"
          disabled={isSubmitting}
          className="btn-base btn-primary text-xs disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <LoaderCircle className="size-4 animate-spin" />
              Submitting...
            </span>
          ) : "Confirm Request"}
        </button>
      )}
    </div>
  );
}
