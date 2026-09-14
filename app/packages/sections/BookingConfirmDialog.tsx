interface BookingConfirmDialogProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function BookingConfirmDialog({
  isOpen,
  isSubmitting,
  onCancel,
  onConfirm,
}: BookingConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-confirm-title"
        className="w-full max-w-sm rounded-xl border border-border bg-ink p-6 text-white shadow-2xl"
      >
        <h3 id="booking-confirm-title" className="text-lg font-bold">
          Confirm booking request
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Submit this booking request for review?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-white hover:bg-background disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="btn-base btn-primary text-xs disabled:opacity-50"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
