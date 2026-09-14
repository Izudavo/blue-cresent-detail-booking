import { useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

import type { AddOnItem, PackageItem } from "@/types/catalog";

import type {
  AvailableBookingTime,
  BookingStep,
  CustomerDetails,
  VehicleImage,
  VehicleType,
} from "./useBookingDrawer";
import { customer_contact_schema } from "@/lib/validation/contact";

interface BookingDrawerStepsProps {
  currentStep: BookingStep;
  selectedPackage: PackageItem;
  addOns: AddOnItem[];
  selectedVehicleType: VehicleType;
  selectedAddOns: AddOnItem[];
  selectedDate: string;
  selectedTime: string;
  selectedEndTime: string;
  availableTimes: AvailableBookingTime[];
  isLoadingAvailability: boolean;
  availabilityError: string;
  today: string;
  customer: CustomerDetails;
  vehicleImages: VehicleImage[];
  estimatedTotal: number;
  bookingError: string;
  toggleAddOn: (addon: AddOnItem) => void;
  handleDateInputClick: (
    event:
      | React.MouseEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement>,
  ) => void;
  handleTimeSelection: (time: AvailableBookingTime) => void;
  updateCustomer: (field: keyof CustomerDetails, value: string) => void;
  handleVehicleImages: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeVehicleImage: (previewUrl: string) => void;
  setSelectedVehicleType: (value: VehicleType) => void;
  setSelectedDate: (value: string) => void;
}

const MAX_VEHICLE_IMAGES = 5;

type ContactField = "email" | "phone";

type ContactErrors = Partial<Record<ContactField, string>>;

function format_time(time: string): string {
  const [hours_string, minutes] = time.split(":");
  const hours = Number(hours_string);
  const period = hours >= 12 ? "PM" : "AM";
  const display_hours = hours % 12 || 12;
  return `${display_hours}:${minutes} ${period}`;
}

export function BookingDrawerSteps({
  currentStep,
  selectedPackage,
  addOns,
  selectedVehicleType,
  selectedAddOns,
  selectedDate,
  selectedTime,
  selectedEndTime,
  availableTimes,
  isLoadingAvailability,
  availabilityError,
  today,
  customer,
  vehicleImages,
  estimatedTotal,
  bookingError,
  toggleAddOn,
  handleDateInputClick,
  handleTimeSelection,
  updateCustomer,
  handleVehicleImages,
  removeVehicleImage,
  setSelectedVehicleType,
  setSelectedDate,
}: BookingDrawerStepsProps) {
  const [contact_errors, setContactErrors] = useState<ContactErrors>({});

  const validate_contact_field = (field: ContactField, value: string) => {
    const result = customer_contact_schema.shape[field].safeParse(value);

    setContactErrors((current) => ({
      ...current,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }));
  };

  const handle_contact_change = (field: ContactField, value: string) => {
    updateCustomer(field, value);

    if (contact_errors[field]) {
      validate_contact_field(field, value);
    }
  };

  return (
    <>
      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Select Vehicle Size</h3>
          <div className="space-y-3">
            {selectedPackage.prices?.map((price) => {
              const vehicle_type =
                price.label === "Cars"
                  ? "CARS"
                  : price.label === "SUVs/Trucks"
                    ? "SUVS_TRUCKS"
                    : null;
              if (!vehicle_type) return null;
              return (
                <button
                  type="button"
                  key={price.label}
                  onClick={() => setSelectedVehicleType(vehicle_type)}
                  className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${selectedVehicleType === vehicle_type ? "border-primary bg-primary text-ink" : "border-border bg-background text-white hover:border-primary/50"}`}
                >
                  <span className="font-semibold">{price.label}</span>
                  <span className="font-bold">{price.displayPrice}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">
            Select Add-On Upgrades
          </h3>
          {addOns.length === 0 ? (
            <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
              No add-on upgrades are currently available.
            </div>
          ) : (
            <div className="space-y-3">
              {addOns.map((addon) => {
                const selected = selectedAddOns.some(
                  (item) => item.id === addon.id,
                );
                return (
                  <button
                    type="button"
                    key={addon.id}
                    onClick={() => toggleAddOn(addon)}
                    className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${selected ? "border-primary bg-primary text-ink" : "border-border bg-background text-white hover:border-primary/50"}`}
                  >
                    <div>
                      <p className="text-sm font-semibold">{addon.name}</p>
                      {addon.additionalMinutes !== undefined &&
                        addon.additionalMinutes > 0 && (
                          <p
                            className={`text-xs ${selected ? "text-ink/80" : "text-muted-foreground"}`}
                          >
                            +{addon.additionalMinutes} min
                          </p>
                        )}
                    </div>
                    <span className="font-bold">{addon.displayPrice}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Choose Date & Time</h3>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-primary">
              Select Date
            </label>
            <input
              type="date"
              required
              min={today}
              value={selectedDate}
              onClick={handleDateInputClick}
              onFocus={handleDateInputClick}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full cursor-pointer rounded-xl border border-border bg-background px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-1 focus:ring-primary scheme-dark"
            />
          </div>
          {selectedDate && (
            <div className="pt-2">
              <label className="mb-2 block text-xs font-semibold uppercase text-primary">
                Available Times
              </label>
              {isLoadingAvailability ? (
                <div className="rounded-xl border border-border bg-background p-5 text-center text-sm text-muted-foreground">
                  Checking available times...
                </div>
              ) : availabilityError ? (
                <div className="rounded-xl border border-border bg-background p-5 text-sm text-muted-foreground">
                  {availabilityError}
                </div>
              ) : availableTimes.length === 0 ? (
                <div className="rounded-xl border border-border bg-background p-5 text-center text-sm text-muted-foreground">
                  No appointments are available on this date.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {availableTimes.map((time) => (
                    <button
                      type="button"
                      key={time.start_time}
                      onClick={() => handleTimeSelection(time)}
                      className={`rounded-xl border py-3 text-sm font-semibold transition ${selectedTime === time.start_time ? "border-primary bg-primary text-ink" : "border-border bg-background text-white hover:border-primary/50"}`}
                    >
                      {format_time(time.start_time)}
                    </button>
                  ))}
                </div>
              )}
              {selectedTime && selectedEndTime && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Appointment duration: {format_time(selectedTime)} –{" "}
                  {format_time(selectedEndTime)}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Your Information</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="First Name"
              required
              value={customer.firstName}
              onChange={(event) =>
                updateCustomer("firstName", event.target.value)
              }
              className="rounded-xl border border-border bg-background p-3 text-sm text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Last Name"
              required
              value={customer.lastName}
              onChange={(event) =>
                updateCustomer("lastName", event.target.value)
              }
              className="rounded-xl border border-border bg-background p-3 text-sm text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <input
            type="tel"
            placeholder="+1 (203) 232 1548"
              inputMode="tel"
              autoComplete="tel"
            required
            value={customer.phone}
              onBlur={(event) =>
                validate_contact_field("phone", event.target.value)
              }
              onChange={(event) =>
                handle_contact_change("phone", event.target.value)
              }
              aria-invalid={Boolean(contact_errors.phone)}
              aria-describedby={contact_errors.phone ? "phone-error" : undefined}
              className="w-full rounded-xl border border-border bg-background p-3 text-sm text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {contact_errors.phone && (
            <p id="phone-error" className="text-xs text-red-300">
              {contact_errors.phone}
            </p>
          )}
          <input
            type="email"
            placeholder="Email Address"
            autoComplete="email"
            required
            value={customer.email}
            onBlur={(event) =>
              validate_contact_field("email", event.target.value)
            }
            onChange={(event) =>
              handle_contact_change("email", event.target.value)
            }
            aria-invalid={Boolean(contact_errors.email)}
            aria-describedby={contact_errors.email ? "email-error" : undefined}
            className="w-full rounded-xl border border-border bg-background p-3 text-sm text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {contact_errors.email && (
            <p id="email-error" className="text-xs text-red-300">
              {contact_errors.email}
            </p>
          )}
          <input
            type="text"
            placeholder="Vehicle Make, Model & Year"
            required
            value={customer.vehicle}
            onChange={(event) => updateCustomer("vehicle", event.target.value)}
            className="w-full rounded-xl border border-border bg-background p-3 text-sm text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-start gap-3">
              <ImagePlus className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <label
                  htmlFor="vehicle-images"
                  className="cursor-pointer text-sm font-semibold text-white hover:text-primary"
                >
                  Add vehicle photos
                </label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Required. Add 1–5 photos of the interior or exterior so we can
                  better understand the vehicle&apos;s condition.
                </p>
              </div>
            </div>
            <input
              id="vehicle-images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleVehicleImages}
              disabled={vehicleImages.length >= MAX_VEHICLE_IMAGES}
              className="mt-3 block w-full cursor-pointer text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:font-semibold file:text-ink file:transition hover:file:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {vehicleImages.length}/{MAX_VEHICLE_IMAGES} photos selected.
              Maximum 10 MB per image.
            </p>
            {vehicleImages.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {vehicleImages.map((image) => (
                  <div
                    key={image.previewUrl}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-border"
                  >
                    <Image
                      src={image.previewUrl}
                      alt={`Selected vehicle photo: ${image.file.name}`}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 33vw, 150px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      aria-label={`Remove ${image.file.name}`}
                      onClick={() => removeVehicleImage(image.previewUrl)}
                      className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/75 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {currentStep === 5 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Review Booking</h3>
          <div className="space-y-3 rounded-xl border border-border bg-background p-4 text-xs">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Service</span>
              <span className="font-semibold text-white">
                {selectedPackage.name}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Vehicle Size</span>
              <span className="font-semibold text-white">
                {selectedVehicleType === "CARS" ? "Cars" : "SUVs/Trucks"}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Vehicle</span>
              <span className="max-w-[60%] text-right font-semibold text-white">
                {customer.vehicle}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Date</span>
              <span className="font-semibold text-white">{selectedDate}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Time</span>
              <span className="font-semibold text-white">
                {format_time(selectedTime)} – {format_time(selectedEndTime)}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Add-ons</span>
              <span className="text-right font-semibold text-white">
                {selectedAddOns.length > 0
                  ? selectedAddOns.map((addon) => addon.name).join(", ")
                  : "None"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Total</span>
              <span className="font-bold text-primary">
                ${estimatedTotal.toFixed(2)}
              </span>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Your request will be submitted for review. The final booking is
            subject to availability at the time of submission.
          </p>
        </div>
      )}

      {bookingError && (
        <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
          {bookingError}
        </div>
      )}
    </>
  );
}
