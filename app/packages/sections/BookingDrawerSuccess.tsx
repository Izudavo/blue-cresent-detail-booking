import type { CustomerDetails } from "./useBookingDrawer";

interface BookingDrawerSuccessProps {
  customer: CustomerDetails;
  selectedDate: string;
  selectedTime: string;
  selectedEndTime: string;
  estimatedTotal: number;
  bookingReference: string;
  onClose: () => void;
}

function format_time(time: string): string {
  const [hours_string, minutes] = time.split(":");
  const hours = Number(hours_string);
  const period = hours >= 12 ? "PM" : "AM";
  const display_hours = hours % 12 || 12;

  return `${display_hours}:${minutes} ${period}`;
}

export function BookingDrawerSuccess({
  customer,
  selectedDate,
  selectedTime,
  selectedEndTime,
  estimatedTotal,
  bookingReference,
  onClose,
}: BookingDrawerSuccessProps) {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-ink">
        ✓
      </div>
      <h3 className="mt-6 text-2xl font-bold text-white">
        Appointment Requested
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Thanks, {customer.firstName}. We received your request for{" "}
        {selectedDate} at {format_time(selectedTime)}.
      </p>
      {bookingReference && (
        <div className="mt-4 rounded-xl border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Booking Reference</p>
          <p className="mt-1 font-mono text-sm font-bold text-white">
            {bookingReference}
          </p>
        </div>
      )}
      <div className="mt-6 space-y-2 rounded-xl border border-border bg-background p-4 text-left text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Vehicle</span>
          <span className="font-semibold text-white">{customer.vehicle}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Appointment</span>
          <span className="font-semibold text-white">
            {format_time(selectedTime)} – {format_time(selectedEndTime)}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Estimated Total</span>
          <span className="font-bold text-primary">
            ${estimatedTotal.toFixed(2)}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="btn-base btn-primary mt-8 w-full"
      >
        Done
      </button>
    </div>
  );
}
