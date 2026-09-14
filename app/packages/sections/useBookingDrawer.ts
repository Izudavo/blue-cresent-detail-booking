import { useEffect, useMemo, useRef, useState } from "react";

import type { AddOnItem, PackageItem } from "@/types/catalog";

import { get_booking_availability } from "@/lib/server/booking/booking.availability.actions";
import { submit_booking } from "@/lib/server/booking/booking.actions";
import { create_vehicle_image_upload_urls } from "@/lib/server/storage/storage.actions";
import { customer_contact_schema } from "@/lib/validation/contact";

export type VehicleType = "CARS" | "SUVS_TRUCKS" | "";
export type BookingStep = 1 | 2 | 3 | 4 | 5;

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  vehicle: string;
}

export interface VehicleImage {
  file: File;
  previewUrl: string;
}

export interface AvailableBookingTime {
  start_time: string;
  end_time: string;
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

const empty_customer: CustomerDetails = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  vehicle: "",
};

export function useBookingDrawer(selectedPackage: PackageItem | null) {
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType>("");
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnItem[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<AvailableBookingTime[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [vehicleImages, setVehicleImages] = useState<VehicleImage[]>([]);
  const [customer, setCustomer] = useState<CustomerDetails>(empty_customer);
  const vehicleImagesRef = useRef<VehicleImage[]>([]);
  const availabilityRequestRef = useRef(0);
  const today = useMemo(() => get_today_date(), []);
  const hasVehiclePricing = Boolean(selectedPackage?.prices?.length);
  const totalSteps = 5;

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
    setIsConfirmOpen(false);
    setBookingReference("");
    setIsSubmitting(false);
    setBookingError("");
    setCustomer(empty_customer);
    setVehicleImages((current) => {
      current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      return [];
    });
  }, [selectedPackage]);

  useEffect(() => {
    vehicleImagesRef.current = vehicleImages;
  }, [vehicleImages]);

  useEffect(() => () => {
    vehicleImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
  }, []);

  useEffect(() => {
    if (!selectedPackage || !hasVehiclePricing || !selectedVehicleType || !selectedDate) {
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
        if (request_id === availabilityRequestRef.current) setAvailableTimes(result.available_times);
      })
      .catch((error) => {
        if (request_id !== availabilityRequestRef.current) return;
        setAvailableTimes([]);
        setAvailabilityError(error instanceof Error ? error.message : "Unable to load available appointment times.");
      })
      .finally(() => {
        if (request_id === availabilityRequestRef.current) setIsLoadingAvailability(false);
      });
  }, [selectedDate, selectedVehicleType, selectedAddOns, selectedPackage, hasVehiclePricing]);

  const toggleAddOn = (addon: AddOnItem) => {
    setSelectedAddOns((current) => current.some((item) => item.id === addon.id)
      ? current.filter((item) => item.id !== addon.id)
      : [...current, addon]);
  };

  const basePrice = useMemo(() => {
    if (!selectedPackage?.prices || !selectedVehicleType) return 0;
    return selectedPackage.prices.find((price) =>
      (selectedVehicleType === "CARS" && price.label === "Cars") ||
      (selectedVehicleType === "SUVS_TRUCKS" && price.label === "SUVs/Trucks"),
    )?.price ?? 0;
  }, [selectedPackage, selectedVehicleType]);

  const estimatedTotal = basePrice + useMemo(
    () => selectedAddOns.reduce((total, addon) => total + addon.price, 0),
    [selectedAddOns],
  );

  const updateCustomer = (field: keyof CustomerDetails, value: string) => {
    setCustomer((current) => ({ ...current, [field]: value }));
  };

  const handleVehicleImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    const remainingSlots = MAX_VEHICLE_IMAGES - vehicleImages.length;
    if (remainingSlots <= 0) {
      setBookingError(`A maximum of ${MAX_VEHICLE_IMAGES} vehicle images is allowed.`);
      return;
    }
    const files = selectedFiles.slice(0, remainingSlots);
    if (files.some((file) => !ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase()))) {
      setBookingError("Vehicle images must be JPEG, PNG, or WebP.");
      return;
    }
    if (files.some((file) => file.size > MAX_IMAGE_SIZE)) {
      setBookingError("Vehicle images must not exceed 10 MB each.");
      return;
    }
    setBookingError(selectedFiles.length > remainingSlots ? `You can add up to ${MAX_VEHICLE_IMAGES} vehicle images.` : "");
    setVehicleImages((current) => [...current, ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))]);
  };

  const removeVehicleImage = (previewUrl: string) => {
    setVehicleImages((current) => {
      const image = current.find((item) => item.previewUrl === previewUrl);
      if (image) URL.revokeObjectURL(image.previewUrl);
      return current.filter((item) => item.previewUrl !== previewUrl);
    });
  };

  const canContinue = () => {
    if (!selectedPackage) return false;
    if (currentStep === 1) return hasVehiclePricing && Boolean(selectedVehicleType);
    if (currentStep === 2) return true;
    if (currentStep === 3) return Boolean(selectedDate && selectedTime && selectedEndTime);
    if (currentStep === 4) return Boolean(customer.firstName.trim() && customer.lastName.trim() && customer.phone.trim() && customer.email.trim() && customer.vehicle.trim() && vehicleImages.length >= 1 && vehicleImages.length <= MAX_VEHICLE_IMAGES);
    return true;
  };

  const goNext = () => {
    if (!canContinue()) return;
    if (currentStep === 4 && !validateCustomerContact()) return;
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

  const validateCustomerContact = () => {
    const result = customer_contact_schema.safeParse({
      email: customer.email,
      phone: customer.phone,
    });

    if (!result.success) {
      setBookingError(result.error.issues[0]?.message ?? "Enter valid contact information.");
      return false;
    }

    return true;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedPackage) return;
    if (!canContinue()) {
      setBookingError("Please complete all required booking information.");
      return;
    }
    if (!validateCustomerContact()) return;
    setIsConfirmOpen(true);
  };

  const cancelConfirmation = () => {
    if (!isSubmitting) setIsConfirmOpen(false);
  };

  const confirmBooking = async () => {
    if (!selectedPackage || isSubmitting) return;

    setIsSubmitting(true);
    setIsConfirmOpen(false);
    setBookingError("");
    try {
      const upload_result = await create_vehicle_image_upload_urls(vehicleImages.map((image) => image.file.type));
      const uploaded_images = await Promise.all(upload_result.uploads.map(async (upload, index) => {
        const image = vehicleImages[index];
        const response = await fetch(upload.upload_url, { method: "PUT", headers: { "Content-Type": image.file.type }, body: image.file });
        if (!response.ok) throw new Error("One or more vehicle images failed to upload.");
        return { storage_key: upload.storage_key, original_name: image.file.name, content_type: image.file.type, file_size: image.file.size };
      }));
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
      setBookingError(error instanceof Error ? error.message : "Unable to submit your booking request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateInputClick = (event: React.MouseEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    try {
      if ("showPicker" in event.currentTarget) event.currentTarget.showPicker();
    } catch {
      // Browser fallback.
    }
  };

  return {
    selectedVehicleType, selectedAddOns, selectedDate, selectedTime, selectedEndTime,
    availableTimes, isLoadingAvailability, availabilityError, currentStep, bookingSuccess,
    isConfirmOpen,
    bookingReference, isSubmitting, bookingError, vehicleImages, customer, today,
    hasVehiclePricing, totalSteps, estimatedTotal, toggleAddOn, updateCustomer,
    handleVehicleImages, removeVehicleImage, canContinue, goNext, goBack,
    handleTimeSelection, handleSubmit, confirmBooking, cancelConfirmation,
    handleDateInputClick, setSelectedVehicleType,
    setSelectedDate,
  };
}