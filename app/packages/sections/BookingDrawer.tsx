"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import type { AddOnItem, PackageItem } from "@/types/catalog";

import { BookingDrawerFooter } from "./BookingDrawerFooter";
import { BookingDrawerSteps } from "./BookingDrawerSteps";
import { BookingDrawerSuccess } from "./BookingDrawerSuccess";
import { BookingConfirmDialog } from "./BookingConfirmDialog";
import { useBookingDrawer } from "./useBookingDrawer";

interface BookingDrawerProps {
  isOpen: boolean;
  selectedPackage: PackageItem | null;
  addOns: AddOnItem[];
  onClose: () => void;
}

export function BookingDrawer({
  isOpen,
  selectedPackage,
  addOns,
  onClose,
}: BookingDrawerProps) {
  const booking = useBookingDrawer(selectedPackage);

  if (!isOpen || !selectedPackage) return null;

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
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
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
          {booking.bookingSuccess ? (
            <BookingDrawerSuccess
              customer={booking.customer}
              selectedDate={booking.selectedDate}
              selectedTime={booking.selectedTime}
              selectedEndTime={booking.selectedEndTime}
              estimatedTotal={booking.estimatedTotal}
              bookingReference={booking.bookingReference}
              onClose={onClose}
            />
          ) : (
            <form
              id="booking-drawer-form"
              onSubmit={booking.handleSubmit}
              className="space-y-6"
            >
              {!booking.hasVehiclePricing && (
                <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  This service is currently unavailable for online booking
                  because vehicle pricing has not been configured.
                </div>
              )}

              <BookingDrawerSteps
                currentStep={booking.currentStep}
                selectedPackage={selectedPackage}
                addOns={addOns}
                selectedVehicleType={booking.selectedVehicleType}
                selectedAddOns={booking.selectedAddOns}
                selectedDate={booking.selectedDate}
                selectedTime={booking.selectedTime}
                selectedEndTime={booking.selectedEndTime}
                availableTimes={booking.availableTimes}
                isLoadingAvailability={booking.isLoadingAvailability}
                availabilityError={booking.availabilityError}
                today={booking.today}
                customer={booking.customer}
                vehicleImages={booking.vehicleImages}
                estimatedTotal={booking.estimatedTotal}
                bookingError={booking.bookingError}
                toggleAddOn={booking.toggleAddOn}
                handleDateInputClick={booking.handleDateInputClick}
                handleTimeSelection={booking.handleTimeSelection}
                updateCustomer={booking.updateCustomer}
                handleVehicleImages={booking.handleVehicleImages}
                removeVehicleImage={booking.removeVehicleImage}
                setSelectedVehicleType={booking.setSelectedVehicleType}
                setSelectedDate={booking.setSelectedDate}
              />
            </form>
          )}
        </div>

        {!booking.bookingSuccess && (
          <BookingDrawerFooter
            currentStep={booking.currentStep}
            totalSteps={booking.totalSteps}
            isSubmitting={booking.isSubmitting}
            canContinue={booking.canContinue}
            goBack={booking.goBack}
            goNext={booking.goNext}
          />
        )}

        <BookingConfirmDialog
          isOpen={booking.isConfirmOpen}
          isSubmitting={booking.isSubmitting}
          onCancel={booking.cancelConfirmation}
          onConfirm={booking.confirmBooking}
        />
      </motion.div>
    </AnimatePresence>
  );
}
