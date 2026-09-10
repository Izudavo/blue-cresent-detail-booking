"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, X } from "lucide-react";

import type { AddOnItem, PackageItem } from "@/types/catalog";

import { get_booking_availability } from "@/lib/server/booking/booking.availability.actions";
import { submit_booking } from "@/lib/server/booking/booking.actions";
import { create_vehicle_image_upload_urls } from "@/lib/server/storage/storage.actions";

type VehicleType = "CARS" | "SUVS_TRUCKS" | "";

type BookingStep = 1 | 2 | 3 | 4 | 5;

interface CustomerDetails {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  vehicle: string;
}

interface VehicleImage {
  file: File;
  previewUrl: string;
}

interface AvailableBookingTime {
  start_time: string;
  end_time: string;
}

interface BookingDrawerProps {
  isOpen: boolean;
  selectedPackage: PackageItem | null;
  addOns: AddOnItem[];
  onClose: () => void;
}

const MAX_VEHICLE_IMAGES = 5;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function get_today_date(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function format_time(time: string): string {
  const [hours_string, minutes] = time.split(":");

  const hours = Number(hours_string);

  const period = hours >= 12 ? "PM" : "AM";
  const display_hours = hours % 12 || 12;

  return `${display_hours}:${minutes} ${period}`;
}

export function BookingDrawer({
  isOpen,
  selectedPackage,
  addOns,
  onClose,
}: BookingDrawerProps) {
  const [selectedVehicleType, setSelectedVehicleType] =
    useState<VehicleType>("");

  const [selectedAddOns, setSelectedAddOns] = useState<AddOnItem[]>([]);

  const [selectedDate, setSelectedDate] = useState("");

  const [selectedTime, setSelectedTime] = useState("");

  const [selectedEndTime, setSelectedEndTime] = useState("");

  const [availableTimes, setAvailableTimes] = useState<AvailableBookingTime[]>(
    [],
  );

  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  const [availabilityError, setAvailabilityError] = useState("");

  const [currentStep, setCurrentStep] = useState<BookingStep>(1);

  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [bookingReference, setBookingReference] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bookingError, setBookingError] = useState("");

  const [vehicleImages, setVehicleImages] = useState<VehicleImage[]>([]);

  const vehicleImagesRef = useRef<VehicleImage[]>([]);

  const availabilityRequestRef = useRef(0);

  const [customer, setCustomer] = useState<CustomerDetails>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    vehicle: "",
  });

  const today = useMemo(() => get_today_date(), []);

  /*
   * Booking requires a vehicle-specific price.
   * Therefore every bookable package must expose
   * its vehicle prices.
   */
  const hasVehiclePricing = Boolean(
    selectedPackage?.prices && selectedPackage.prices.length > 0,
  );

  const totalSteps = 5;

  /*
   * Reset booking state whenever the selected
   * package changes.
   */
  useEffect(() => {
    setSelectedVehicleType("");
    setSelectedAddOns([]);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedEndTime("");
    setAvailableTimes([]);
    setAvailabilityError("");
    setCurrentStep(1);
    setBookingSuccess(false);
    setBookingReference("");
    setIsSubmitting(false);
    setBookingError("");

    setCustomer({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      vehicle: "",
    });

    setVehicleImages((current) => {
      current.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });

      return [];
    });
  }, [selectedPackage]);

  /*
   * Keep the ref synchronized so the cleanup
   * function always has the latest images.
   */
  useEffect(() => {
    vehicleImagesRef.current = vehicleImages;
  }, [vehicleImages]);

  /*
   * Clean up object URLs when the component
   * unmounts.
   */
  useEffect(() => {
    return () => {
      vehicleImagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, []);

  /*
   * Fetch availability whenever the date,
   * vehicle type, package, or add-ons change.
   */
  useEffect(() => {
    if (
      !selectedPackage ||
      !hasVehiclePricing ||
      !selectedVehicleType ||
      !selectedDate
    ) {
      setAvailableTimes([]);
      setSelectedTime("");
      setSelectedEndTime("");
      setAvailabilityError("");
      return;
    }

    const request_id = ++availabilityRequestRef.current;

    setIsLoadingAvailability(true);
    setAvailabilityError("");
    setAvailableTimes([]);
    setSelectedTime("");
    setSelectedEndTime("");

    get_booking_availability({
      date: selectedDate,
      service_package_id: selectedPackage.id,
      vehicle_type: selectedVehicleType,
      add_on_ids: selectedAddOns.map((addon) => addon.id),
    })
      .then((result) => {
        if (request_id !== availabilityRequestRef.current) {
          return;
        }

        setAvailableTimes(result.available_times);
      })
      .catch((error) => {
        if (request_id !== availabilityRequestRef.current) {
          return;
        }

        setAvailableTimes([]);

        setAvailabilityError(
          error instanceof Error
            ? error.message
            : "Unable to load available appointment times.",
        );
      })
      .finally(() => {
        if (request_id === availabilityRequestRef.current) {
          setIsLoadingAvailability(false);
        }
      });
  }, [
    selectedDate,
    selectedVehicleType,
    selectedAddOns,
    selectedPackage,
    hasVehiclePricing,
  ]);

  const toggleAddOn = (addon: AddOnItem) => {
    setSelectedAddOns((current) =>
      current.some((item) => item.id === addon.id)
        ? current.filter((item) => item.id !== addon.id)
        : [...current, addon],
    );
  };

  const basePrice = useMemo(() => {
    if (!selectedPackage || !selectedVehicleType || !selectedPackage.prices) {
      return 0;
    }

    return (
      selectedPackage.prices.find(
        (price) =>
          (selectedVehicleType === "CARS" && price.label === "Cars") ||
          (selectedVehicleType === "SUVS_TRUCKS" &&
            price.label === "SUVs/Trucks"),
      )?.price ?? 0
    );
  }, [selectedPackage, selectedVehicleType]);

  const addOnsTotal = useMemo(() => {
    return selectedAddOns.reduce((total, addon) => total + addon.price, 0);
  }, [selectedAddOns]);

  const estimatedTotal = basePrice + addOnsTotal;

  const updateCustomer = (field: keyof CustomerDetails, value: string) => {
    setCustomer((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleVehicleImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    event.target.value = "";

    const remainingSlots = MAX_VEHICLE_IMAGES - vehicleImages.length;

    if (remainingSlots <= 0) {
      setBookingError(
        `A maximum of ${MAX_VEHICLE_IMAGES} vehicle images is allowed.`,
      );
      return;
    }

    const files = selectedFiles.slice(0, remainingSlots);

    const invalidType = files.find(
      (file) => !ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase()),
    );

    if (invalidType) {
      setBookingError("Vehicle images must be JPEG, PNG, or WebP.");
      return;
    }

    const oversizedFile = files.find((file) => file.size > MAX_IMAGE_SIZE);

    if (oversizedFile) {
      setBookingError("Vehicle images must not exceed 10 MB each.");
      return;
    }

    if (selectedFiles.length > remainingSlots) {
      setBookingError(
        `You can add up to ${MAX_VEHICLE_IMAGES} vehicle images.`,
      );
    } else {
      setBookingError("");
    }

    const newImages = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setVehicleImages((current) => [...current, ...newImages]);
  };

  const removeVehicleImage = (previewUrl: string) => {
    setVehicleImages((current) => {
      const image = current.find((item) => item.previewUrl === previewUrl);

      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }

      return current.filter((item) => item.previewUrl !== previewUrl);
    });
  };

  const canContinue = () => {
    if (!selectedPackage) {
      return false;
    }

    if (currentStep === 1) {
      return hasVehiclePricing && Boolean(selectedVehicleType);
    }

    if (currentStep === 2) {
      return true;
    }

    if (currentStep === 3) {
      return Boolean(selectedDate && selectedTime && selectedEndTime);
    }

    if (currentStep === 4) {
      return Boolean(
        customer.firstName.trim() &&
        customer.lastName.trim() &&
        customer.phone.trim() &&
        customer.email.trim() &&
        customer.vehicle.trim() &&
        vehicleImages.length >= 1 &&
        vehicleImages.length <= MAX_VEHICLE_IMAGES,
      );
    }

    return true;
  };

  const goNext = () => {
    if (!canContinue()) {
      return;
    }

    setBookingError("");

    setCurrentStep((step) => Math.min(step + 1, totalSteps) as BookingStep);
  };

  const goBack = () => {
    setBookingError("");

    setCurrentStep((step) => Math.max(step - 1, 1) as BookingStep);
  };

  const handleTimeSelection = (time: AvailableBookingTime) => {
    setSelectedTime(time.start_time);

    setSelectedEndTime(time.end_time);

    setBookingError("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedPackage) {
      return;
    }

    if (!canContinue()) {
      setBookingError("Please complete all required booking information.");
      return;
    }

    setIsSubmitting(true);
    setBookingError("");

    try {
      /*
       * Request one presigned S3 upload URL
       * for each selected image.
       */
      const upload_result = await create_vehicle_image_upload_urls(
        vehicleImages.map((image) => image.file.type),
      );

      /*
       * Upload the files directly from the
       * browser to private S3.
       */
      const uploaded_images = await Promise.all(
        upload_result.uploads.map(async (upload, index) => {
          const image = vehicleImages[index];

          const response = await fetch(upload.upload_url, {
            method: "PUT",
            headers: {
              "Content-Type": image.file.type,
            },
            body: image.file,
          });

          if (!response.ok) {
            throw new Error("One or more vehicle images failed to upload.");
          }

          return {
            storage_key: upload.storage_key,
            original_name: image.file.name,
            content_type: image.file.type,
            file_size: image.file.size,
          };
        }),
      );

      /*
       * Submit the actual booking.
       *
       * The backend re-fetches pricing,
       * add-ons, availability, and verifies
       * the uploaded S3 objects.
       */
      const booking = await submit_booking({
        customer_name: `${customer.firstName.trim()} ${customer.lastName.trim()}`,

        customer_email: customer.email.trim(),

        customer_phone: customer.phone.trim(),

        vehicle_details: customer.vehicle.trim(),

        appointment_date: selectedDate,

        appointment_start_time: selectedTime,

        vehicle_type: selectedVehicleType as "CARS" | "SUVS_TRUCKS",

        service_package_id: selectedPackage.id,

        add_on_ids: selectedAddOns.map((addon) => addon.id),

        vehicle_images: uploaded_images,

        customer_notes: null,
      });

      setBookingReference(booking.booking_reference);

      setBookingSuccess(true);
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : "Unable to submit your booking request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateInputClick = (
    event:
      | React.MouseEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement>,
  ) => {
    try {
      if ("showPicker" in event.currentTarget) {
        event.currentTarget.showPicker();
      }
    } catch {
      // Browser fallback.
    }
  };

  if (!isOpen || !selectedPackage) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        key="booking-drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs"
      />

      <motion.div
        key="booking-drawer-panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{
          type: "spring",
          damping: 28,
          stiffness: 220,
        }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-border bg-ink text-white shadow-2xl"
      >
        <div className="border-b border-border bg-ink p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Book Service
              </span>

              <h2 className="mt-1 text-xl font-bold text-white">
                {selectedPackage.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close booking drawer"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-background hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {bookingSuccess ? (
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
                  <p className="text-xs text-muted-foreground">
                    Booking Reference
                  </p>

                  <p className="mt-1 font-mono text-sm font-bold text-white">
                    {bookingReference}
                  </p>
                </div>
              )}

              <div className="mt-6 space-y-2 rounded-xl border border-border bg-background p-4 text-left text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Vehicle</span>

                  <span className="font-semibold text-white">
                    {customer.vehicle}
                  </span>
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
          ) : (
            <form
              id="booking-drawer-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {!hasVehiclePricing && (
                <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  This service is currently unavailable for online booking
                  because vehicle pricing has not been configured.
                </div>
              )}

              {/* STEP 1: VEHICLE TYPE */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">
                    Select Vehicle Size
                  </h3>

                  <div className="space-y-3">
                    {selectedPackage.prices?.map((price) => {
                      const vehicle_type =
                        price.label === "Cars"
                          ? "CARS"
                          : price.label === "SUVs/Trucks"
                            ? "SUVS_TRUCKS"
                            : null;

                      if (!vehicle_type) {
                        return null;
                      }

                      return (
                        <button
                          type="button"
                          key={price.label}
                          onClick={() => setSelectedVehicleType(vehicle_type)}
                          className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                            selectedVehicleType === vehicle_type
                              ? "border-primary bg-primary text-ink"
                              : "border-border bg-background text-white hover:border-primary/50"
                          }`}
                        >
                          <span className="font-semibold">{price.label}</span>

                          <span className="font-bold">
                            {price.displayPrice}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: ADD ONS */}
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
                            className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                              selected
                                ? "border-primary bg-primary text-ink"
                                : "border-border bg-background text-white hover:border-primary/50"
                            }`}
                          >
                            <div>
                              <p className="text-sm font-semibold">
                                {addon.name}
                              </p>

                              {addon.additionalMinutes !== undefined &&
                                addon.additionalMinutes > 0 && (
                                  <p
                                    className={`text-xs ${
                                      selected
                                        ? "text-ink/80"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    +{addon.additionalMinutes} min
                                  </p>
                                )}
                            </div>

                            <span className="font-bold">
                              {addon.displayPrice}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: DATE & TIME */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">
                    Choose Date & Time
                  </h3>

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
                              className={`rounded-xl border py-3 text-sm font-semibold transition ${
                                selectedTime === time.start_time
                                  ? "border-primary bg-primary text-ink"
                                  : "border-border bg-background text-white hover:border-primary/50"
                              }`}
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

              {/* STEP 4: CUSTOMER DETAILS */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">
                    Your Information
                  </h3>

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
                    placeholder="Phone Number"
                    required
                    value={customer.phone}
                    onChange={(event) =>
                      updateCustomer("phone", event.target.value)
                    }
                    className="w-full rounded-xl border border-border bg-background p-3 text-sm text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />

                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={customer.email}
                    onChange={(event) =>
                      updateCustomer("email", event.target.value)
                    }
                    className="w-full rounded-xl border border-border bg-background p-3 text-sm text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />

                  <input
                    type="text"
                    placeholder="Vehicle Make, Model & Year"
                    required
                    value={customer.vehicle}
                    onChange={(event) =>
                      updateCustomer("vehicle", event.target.value)
                    }
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
                          Required. Add 1–5 photos of the interior or exterior
                          so we can better understand the vehicle&apos;s
                          condition.
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
                      {vehicleImages.length}/{MAX_VEHICLE_IMAGES} photos
                      selected. Maximum 10 MB per image.
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
                              onClick={() =>
                                removeVehicleImage(image.previewUrl)
                              }
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

              {/* STEP 5: REVIEW */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">
                    Review Booking
                  </h3>

                  <div className="space-y-3 rounded-xl border border-border bg-background p-4 text-xs">
                    <div className="flex justify-between border-b border-border pb-2">
                      <span className="text-muted-foreground">Service</span>

                      <span className="font-semibold text-white">
                        {selectedPackage.name}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                      <span className="text-muted-foreground">
                        Vehicle Size
                      </span>

                      <span className="font-semibold text-white">
                        {selectedVehicleType === "CARS"
                          ? "Cars"
                          : "SUVs/Trucks"}
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

                      <span className="font-semibold text-white">
                        {selectedDate}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-border pb-2">
                      <span className="text-muted-foreground">Time</span>

                      <span className="font-semibold text-white">
                        {format_time(selectedTime)} –{" "}
                        {format_time(selectedEndTime)}
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
                      <span className="text-muted-foreground">
                        Estimated Total
                      </span>

                      <span className="font-bold text-primary">
                        ${estimatedTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Your request will be submitted for review. The final booking
                    is subject to availability at the time of submission.
                  </p>
                </div>
              )}

              {bookingError && (
                <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  {bookingError}
                </div>
              )}
            </form>
          )}
        </div>

        {!bookingSuccess && (
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
                {isSubmitting ? "Submitting..." : "Confirm Request"}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
