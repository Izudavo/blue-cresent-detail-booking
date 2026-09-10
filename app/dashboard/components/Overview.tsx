"use client";

import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  Clock3,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import type { BookingStatus } from "@prisma/client";

import { update_admin_booking_status } from "@/lib/server/booking/booking.admin.actions";
import { get_vehicle_image_view_url } from "@/lib/server/storage/storage.admin.actions";

import type { AdminBookingResult } from "@/lib/server/booking/booking.admin.types";

const statusStyles: Record<BookingStatus, string> = {
  PENDING: "border-black/20 bg-black/[0.04] text-black",
  CONFIRMED: "border-black bg-black text-white",
  COMPLETED: "border-black/15 bg-black/[0.03] text-black/50",
  CANCELLED: "border-black/15 bg-black/[0.06] text-black/40",
};

const statusLabels: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function format_date(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(date));
}

function format_time(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function get_initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function format_vehicle_type(vehicle_type: string) {
  if (vehicle_type === "SUVS_TRUCKS") {
    return "SUV / Truck";
  }

  return "Car";
}

export function Overview({
  initial_bookings,
}: {
  initial_bookings: AdminBookingResult[];
}) {
  const [bookings, setBookings] = useState(initial_bookings);

  const [selected_booking, setSelectedBooking] =
    useState<AdminBookingResult | null>(null);

  const [is_pending, startTransition] = useTransition();

  const new_bookings = useMemo(
    () => bookings.filter((booking) => booking.status === "PENDING").length,
    [bookings],
  );

  const upcoming_bookings = useMemo(() => {
    const now = new Date();

    const next_seven_days = new Date(now);

    next_seven_days.setDate(next_seven_days.getDate() + 7);

    return bookings.filter((booking) => {
      const appointment_date = new Date(booking.appointment_date);

      return (
        appointment_date >= now &&
        appointment_date <= next_seven_days &&
        booking.status !== "CANCELLED"
      );
    }).length;
  }, [bookings]);

  const average_service_time = useMemo(() => {
    if (bookings.length === 0) {
      return "0h";
    }

    const total_minutes = bookings.reduce((total, booking) => {
      const add_on_minutes = booking.add_ons.reduce(
        (add_on_total, add_on) => add_on_total + add_on.additional_minutes,
        0,
      );

      return total + booking.package_duration_minutes + add_on_minutes;
    }, 0);

    const average_hours = total_minutes / bookings.length / 60;

    return `${average_hours.toFixed(1)}h`;
  }, [bookings]);

  async function handle_status_change(
    booking_id: string,
    status: BookingStatus,
  ) {
    const previous_bookings = bookings;

    const previous_selected_booking = selected_booking;

    const optimistic_booking = bookings.find(
      (booking) => booking.id === booking_id,
    );

    if (!optimistic_booking) {
      return;
    }

    const updated_booking = {
      ...optimistic_booking,
      status,
    };

    setBookings((current_bookings) =>
      current_bookings.map((booking) =>
        booking.id === booking_id ? updated_booking : booking,
      ),
    );

    if (selected_booking?.id === booking_id) {
      setSelectedBooking(updated_booking);
    }

    startTransition(async () => {
      try {
        const saved_booking = await update_admin_booking_status(
          booking_id,
          status,
        );

        setBookings((current_bookings) =>
          current_bookings.map((booking) =>
            booking.id === saved_booking.id ? saved_booking : booking,
          ),
        );

        if (selected_booking?.id === saved_booking.id) {
          setSelectedBooking(saved_booking);
        }
      } catch (error) {
        setBookings(previous_bookings);

        setSelectedBooking(previous_selected_booking);

        console.error("Failed to update booking status:", error);
      }
    });
  }

  const displayed_bookings = bookings.slice(0, 7);

  return (
    <div className="space-y-4">
      {/* Compact Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="New requests"
          value={String(new_bookings).padStart(2, "0")}
          detail="Needs your attention"
          icon={Bell}
        />

        <Stat
          label="Upcoming bookings"
          value={String(upcoming_bookings).padStart(2, "0")}
          detail="Next 7 days"
          icon={CalendarDays}
        />

        <Stat
          label="Avg. service time"
          value={average_service_time}
          detail="Across all bookings"
          icon={Clock3}
        />
      </div>

      {/* Booking Requests Table */}
      <section className="overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02] shadow-sm">
        <div className="flex flex-col gap-2 border-b border-black/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-black">Booking Requests</h2>

            <p className="text-xs text-black/45">
              Your latest customer activity
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-semibold text-black/45 transition hover:text-black"
          >
            View all
            <ArrowUpRight className="size-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="border-b border-black/10 bg-black/[0.03] text-[10px] font-bold uppercase tracking-wider text-black/45">
              <tr>
                <th className="px-4 py-2.5">Customer</th>

                <th className="px-3 py-2.5">Service</th>

                <th className="px-3 py-2.5">Date & Time</th>

                <th className="px-3 py-2.5">Status</th>

                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/10 text-black/70">
              {displayed_bookings.map((booking) => (
                <tr
                  key={booking.id}
                  tabIndex={0}
                  role="button"
                  onClick={() => setSelectedBooking(booking)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();

                      setSelectedBooking(booking);
                    }
                  }}
                  className="cursor-pointer transition hover:bg-black/[0.03] focus:bg-black/[0.03] focus:outline-none"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full border border-black/15 bg-black text-[10px] font-bold text-white">
                        {get_initials(booking.customer_name)}
                      </span>

                      <div>
                        <p className="font-semibold leading-tight text-black">
                          {booking.customer_name}
                        </p>

                        <p className="text-[11px] text-black/45">
                          {booking.vehicle_details}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-2.5 font-medium text-black/70">
                    {booking.package_name}
                  </td>

                  <td className="px-3 py-2.5">
                    <p className="text-black/80">
                      {format_date(booking.appointment_date)}
                    </p>

                    <p className="text-[11px] text-black/45">
                      {format_time(booking.appointment_start_time)} –{" "}
                      {format_time(booking.appointment_end_time)}
                    </p>
                  </td>

                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-bold ${statusStyles[booking.status]}`}
                    >
                      {statusLabels[booking.status]}
                    </span>
                  </td>

                  <td className="px-4 py-2.5 text-right">
                    <select
                      aria-label={`Update status for ${booking.customer_name}`}
                      value={booking.status}
                      disabled={is_pending}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) =>
                        handle_status_change(
                          booking.id,
                          event.target.value as BookingStatus,
                        )
                      }
                      className="rounded-lg border border-black/15 bg-white px-2 py-1 text-xs font-medium text-black outline-none transition hover:border-black/30 focus:border-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="PENDING">Pending</option>

                      <option value="CONFIRMED">Confirmed</option>

                      <option value="COMPLETED">Completed</option>

                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}

              {displayed_bookings.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-xs text-black/40"
                  >
                    No bookings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detail Modal */}
      {selected_booking && (
        <BookingDetails
          booking={selected_booking}
          onClose={() => setSelectedBooking(null)}
          update_booking_status={handle_status_change}
          is_pending={is_pending}
        />
      )}
    </div>
  );
}

function BookingDetails({
  booking,
  onClose,
  update_booking_status,
  is_pending,
}: {
  booking: AdminBookingResult;
  onClose: () => void;
  update_booking_status: (id: string, status: BookingStatus) => void;
  is_pending: boolean;
}) {
  const [image_urls, setImageUrls] = useState<Record<string, string>>({});

  const [image_loading, setImageLoading] = useState(true);

  const [image_error, setImageError] = useState(false);

  const [active_preview_image, setActivePreviewImage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let is_mounted = true;

    async function load_image_urls() {
      if (booking.vehicle_images.length === 0) {
        if (is_mounted) {
          setImageLoading(false);
        }

        return;
      }

      setImageLoading(true);
      setImageError(false);

      try {
        const entries = await Promise.all(
          booking.vehicle_images.map(async (image) => {
            const url = await get_vehicle_image_view_url(image.storage_key);

            return [image.id, url] as const;
          }),
        );

        if (!is_mounted) {
          return;
        }

        setImageUrls(Object.fromEntries(entries));
      } catch (error) {
        if (!is_mounted) {
          return;
        }

        console.error("Failed to load vehicle images:", error);

        setImageError(true);
      } finally {
        if (is_mounted) {
          setImageLoading(false);
        }
      }
    }

    load_image_urls();

    return () => {
      is_mounted = false;
    };
  }, [booking.id, booking.vehicle_images]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-details-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-black/15 bg-white text-black shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-black/10 bg-black/[0.02] px-5 py-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-black/45">
              Booking {booking.booking_reference}
            </span>

            <h2
              id="booking-details-title"
              className="mt-1 text-base font-bold text-black"
            >
              {booking.customer_name}
            </h2>

            <p className="text-xs text-black/45">{booking.vehicle_details}</p>
          </div>

          <button
            type="button"
            aria-label="Close booking details"
            onClick={onClose}
            className="grid size-7 place-items-center rounded-lg border border-black/10 bg-white text-black/45 transition hover:border-black/20 hover:bg-black/[0.04] hover:text-black"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-5 px-5 py-5">
          {/* Customer Information */}
          <div className="grid gap-2.5 sm:grid-cols-2">
            <Info label="Customer" value={booking.customer_name} />

            <Info
              label="Vehicle"
              value={`${booking.vehicle_details} • ${format_vehicle_type(
                booking.vehicle_type,
              )}`}
            />

            <Info label="Email" value={booking.customer_email} />

            <Info label="Phone" value={booking.customer_phone} />
          </div>

          {/* Booking Information */}
          <div className="grid gap-2.5 sm:grid-cols-3">
            <Info label="Service" value={booking.package_name} />

            <Info label="Date" value={format_date(booking.appointment_date)} />

            <Info
              label="Time"
              value={`${format_time(
                booking.appointment_start_time,
              )} – ${format_time(booking.appointment_end_time)}`}
            />
          </div>

          {/* Price */}
          <div className="grid gap-2.5 sm:grid-cols-2">
            <Info
              label="Package"
              value={`$${booking.package_price.toFixed(2)}`}
            />

            <Info label="Total" value={`$${booking.total_price.toFixed(2)}`} />
          </div>

          {/* Add-ons */}
          {booking.add_ons.length > 0 && (
            <div className="border-t border-black/10 pt-4">
              <h3 className="mb-2 text-xs font-bold text-black">Add-ons</h3>

              <div className="space-y-1.5">
                {booking.add_ons.map((add_on) => (
                  <div
                    key={add_on.id}
                    className="flex items-center justify-between rounded-lg border border-black/10 bg-black/[0.02] px-3 py-2"
                  >
                    <span className="text-xs font-medium text-black/70">
                      {add_on.name}
                    </span>

                    <span className="text-xs font-semibold text-black">
                      ${add_on.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Notes */}
          {booking.customer_notes && (
            <div className="border-t border-black/10 pt-4">
              <h3 className="text-xs font-bold text-black">Customer Notes</h3>

              <p className="mt-2 whitespace-pre-wrap rounded-lg border border-black/10 bg-black/[0.02] p-3 text-xs leading-relaxed text-black/60">
                {booking.customer_notes}
              </p>
            </div>
          )}

          {/* Photos */}
          <div className="border-t border-black/10 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-black">Vehicle Photos</h3>

                <p className="text-[11px] text-black/45">
                  Images submitted with this booking request.
                </p>
              </div>

              <ImageIcon className="size-4 text-black/40" />
            </div>

            {booking.vehicle_images.length > 0 ? (
              <>
                {image_loading && (
                  <div className="mb-2.5 flex min-h-24 items-center justify-center rounded-lg border border-black/10 bg-black/[0.02]">
                    <p className="text-xs font-medium text-black/40">
                      Loading vehicle photos...
                    </p>
                  </div>
                )}

                {image_error && (
                  <div className="mb-2.5 flex min-h-24 items-center justify-center rounded-lg border border-black/10 bg-black/[0.02] p-4">
                    <div className="text-center">
                      <ImageIcon className="mx-auto size-5 text-black/30" />

                      <p className="mt-1 text-xs font-medium text-black/45">
                        Unable to load vehicle photos.
                      </p>
                    </div>
                  </div>
                )}

                {!image_loading && !image_error && (
                  <div className="grid grid-cols-2 gap-2.5">
                    {booking.vehicle_images.map((image, index) => (
                      <VehicleImage
                        key={image.id}
                        image_url={image_urls[image.id]}
                        customer_name={booking.customer_name}
                        index={index}
                        onImageClick={(url) => setActivePreviewImage(url)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-black/15 bg-black/[0.02] p-4">
                <div className="text-center">
                  <ImageIcon className="mx-auto size-5 text-black/30" />

                  <p className="mt-1 text-xs font-medium text-black/45">
                    No vehicle images uploaded
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Status Select */}
          <div className="flex flex-col gap-2 border-t border-black/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/45">
                Request Status
              </p>

              <p className="text-xs text-black/45">Update status below.</p>
            </div>

            <select
              aria-label={`Update status for ${booking.customer_name}`}
              value={booking.status}
              disabled={is_pending}
              onChange={(event) =>
                update_booking_status(
                  booking.id,
                  event.target.value as BookingStatus,
                )
              }
              className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold text-black outline-none transition hover:border-black/30 focus:border-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="PENDING">Pending</option>

              <option value="CONFIRMED">Confirmed</option>

              <option value="COMPLETED">Completed</option>

              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-black/10 bg-black/[0.02] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-black/15 bg-white px-4 py-2 text-xs font-semibold text-black/60 transition hover:border-black hover:text-black"
          >
            Close
          </button>
        </div>
      </div>

      {/* Full-Screen Image Preview Modal */}
      {active_preview_image && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={(e) => {
            e.stopPropagation();
            setActivePreviewImage(null);
          }}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              type="button"
              aria-label="Close image preview"
              onClick={(e) => {
                e.stopPropagation();
                setActivePreviewImage(null);
              }}
              className="absolute -right-3 -top-3 grid size-8 place-items-center rounded-full border border-white/20 bg-black text-white shadow-lg transition hover:scale-105 hover:bg-neutral-900"
            >
              <X className="size-4" />
            </button>

            <img
              src={active_preview_image}
              alt="Vehicle preview"
              className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function VehicleImage({
  image_url,
  customer_name,
  index,
  onImageClick,
}: {
  image_url: string | undefined;
  customer_name: string;
  index: number;
  onImageClick?: (url: string) => void;
}) {
  const [has_error, setHasError] = useState(false);

  return (
    <div className="group overflow-hidden rounded-lg border border-black/10 bg-black/[0.02]">
      {image_url && !has_error ? (
        <a
          href={image_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (onImageClick) {
              e.preventDefault();
              onImageClick(image_url);
            }
          }}
          className="relative block aspect-video w-full overflow-hidden bg-black/5"
        >
          <img
            src={image_url}
            alt={`Vehicle photo ${index + 1} submitted by ${customer_name}`}
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setHasError(true)}
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="rounded-md border border-white/20 bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm">
              Click to view
            </span>
          </div>
        </a>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-black/[0.04]">
          <div className="text-center">
            <ImageIcon className="mx-auto size-6 text-black/20" />

            <p className="mt-1 text-[10px] font-medium text-black/35">
              Image unavailable
            </p>
          </div>
        </div>
      )}

      <div className="border-t border-black/10 bg-black/[0.02] px-2.5 py-1">
        <p className="text-[10px] font-bold uppercase text-black/40">
          Photo {String(index + 1).padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-black/[0.02] p-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold text-black">{value}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Bell;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-black/45">
            {label}
          </p>

          <p className="mt-1.5 text-xl font-bold tracking-tight text-black">
            {value}
          </p>
        </div>

        <span className="grid size-8 place-items-center rounded-lg border border-black/10 bg-white text-black/45">
          <Icon className="size-3.5" />
        </span>
      </div>

      <p className="mt-1.5 text-[11px] text-black/45">{detail}</p>
    </div>
  );
}
