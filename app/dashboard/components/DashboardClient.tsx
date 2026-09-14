"use client";

import { Check, Layers, Loader2, Package, Plus, Tag } from "lucide-react";
import { useState } from "react";

import {
  create_add_on,
  delete_add_on,
  update_add_on,
} from "@/app/actions/admin/add-on.actions";

import {
  create_package,
  delete_package,
  update_package,
} from "@/app/actions/admin/package.actions";

import type { AvailabilityOverride, BusinessHours } from "@/types/availability";

import type { AddOnItem, PackageItem } from "@/types/catalog";

import { get_business_greeting } from "@/lib/utils/date";

import type { AdminBookingResult } from "@/lib/server/booking/booking.admin.types";

import { PackagesEditor } from "../editors/PackagesEditor";
import { Availability } from "./availability/Availability";
import { DashboardHeader } from "./DashboardHeader";
import { Overview } from "./Overview";
import { Sidebar } from "./Sidebar";

import { type DashboardTab } from "../data";

import "./dashboard.css";

interface DashboardClientProps {
  adminUsername: string;
  initialPackages: PackageItem[];
  initialAddOns: AddOnItem[];
  initialBusinessHours: BusinessHours[];
  initialAvailabilityOverrides: AvailabilityOverride[];
  initialBookings: AdminBookingResult[];
}

export function DashboardClient({
  adminUsername,
  initialPackages,
  initialAddOns,
  initialBusinessHours,
  initialAvailabilityOverrides,
  initialBookings,
}: DashboardClientProps) {
  const greeting = get_business_greeting();

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [packageSection, setPackageSection] = useState<"packages" | "addons">(
    "packages",
  );

  const [packages, setPackages] = useState<PackageItem[]>(initialPackages);

  const [addOns, setAddOns] = useState<AddOnItem[]>(initialAddOns);

  const [businessHours, setBusinessHours] =
    useState<BusinessHours[]>(initialBusinessHours);

  const [availabilityOverrides, setAvailabilityOverrides] = useState<
    AvailabilityOverride[]
  >(initialAvailabilityOverrides);

  const pending_booking_count = initialBookings.filter(
    (booking) => booking.status === "PENDING",
  ).length;

  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(
    null,
  );

  const [saveMessage, setSaveMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const showSaveMessage = (message: string) => {
    setSaveMessage(message);

    window.setTimeout(() => {
      setSaveMessage("");
    }, 2400);
  };

  const savePackage = async (nextPackage: PackageItem) => {
    setIsLoading(true);

    try {
      await update_package(nextPackage);

      setPackages((current) =>
        current.map((pkg) => (pkg.id === nextPackage.id ? nextPackage : pkg)),
      );

      setEditingPackage(null);

      showSaveMessage(`${nextPackage.name} updated`);
    } catch (error) {
      console.error("Failed to update package:", error);

      showSaveMessage(
        error instanceof Error ? error.message : "Failed to update package",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createPackage = async () => {
    setIsLoading(true);

    const timestamp = Date.now();

    const newPackageInput = {
      slug: `new-service-package-${timestamp}`,
      name: "New Service Package",
      description: "Add a description for this service.",
      estimated_time: "1 – 2 Hours",
      duration_minutes: 120,
      featured: false,
      starting_price: 100,
    };

    try {
      await create_package(newPackageInput);

      const createdPackage: PackageItem = {
        id: newPackageInput.slug,
        name: newPackageInput.name,
        description: newPackageInput.description,
        estimatedTime: newPackageInput.estimated_time,
        durationMinutes: newPackageInput.duration_minutes,
        startingPrice: newPackageInput.starting_price,
        displayStartingPrice: "$100+",
        items: [],
      };

      setPackages((current) => [...current, createdPackage]);

      setEditingPackage(createdPackage);

      setActiveTab("packages");
      setPackageSection("packages");

      showSaveMessage("Package created");
    } catch (error) {
      console.error("Failed to create package:", error);

      showSaveMessage(
        error instanceof Error ? error.message : "Failed to create package",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const saveAddOn = async (nextAddOn: AddOnItem) => {
    setIsLoading(true);

    try {
      await update_add_on(nextAddOn);

      setAddOns((current) =>
        current.map((addOn) => (addOn.id === nextAddOn.id ? nextAddOn : addOn)),
      );

      showSaveMessage(`${nextAddOn.name} updated`);
    } catch (error) {
      console.error("Failed to update add-on:", error);

      showSaveMessage(
        error instanceof Error ? error.message : "Failed to update add-on",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createAddOn = async () => {
    setIsLoading(true);

    const timestamp = Date.now();

    const newAddOnInput = {
      slug: `new-add-on-${timestamp}`,
      name: "New Add-on",
      price: 50,
      additional_minutes: undefined,
    };

    try {
      await create_add_on(newAddOnInput);

      const createdAddOn: AddOnItem = {
        id: newAddOnInput.slug,
        name: newAddOnInput.name,
        price: newAddOnInput.price,
        displayPrice: "$50+",
      };

      setAddOns((current) => [...current, createdAddOn]);

      setActiveTab("packages");
      setPackageSection("addons");

      showSaveMessage("Add-on created");
    } catch (error) {
      console.error("Failed to create add-on:", error);

      showSaveMessage(
        error instanceof Error ? error.message : "Failed to create add-on",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAddOn = async (id: string) => {
    setIsLoading(true);

    try {
      await delete_add_on(id);

      setAddOns((current) => current.filter((addOn) => addOn.id !== id));

      showSaveMessage("Add-on deleted");
    } catch (error) {
      console.error("Failed to delete add-on:", error);

      showSaveMessage(
        error instanceof Error ? error.message : "Failed to delete add-on",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deletePackage = async (id: string) => {
    setIsLoading(true);

    try {
      await delete_package(id);

      setPackages((current) => current.filter((pkg) => pkg.id !== id));

      if (editingPackage?.id === id) {
        setEditingPackage(null);
      }

      showSaveMessage("Package deleted");
    } catch (error) {
      console.error("Failed to delete package:", error);

      showSaveMessage(
        error instanceof Error ? error.message : "Failed to delete package",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="dashboard-surface relative min-h-screen bg-white font-sans text-black">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          {" "}
          <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-5 py-3.5 shadow-xl">
            {" "}
            <Loader2 className="size-5 animate-spin text-black" />
            <span className="text-sm font-medium text-black">
              Processing...
            </span>
          </div>
        </div>
      )}

      {saveMessage && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="flex items-center gap-2.5 rounded-full bg-black px-4 py-2.5 text-xs font-medium text-white shadow-xl">
            <Check className="size-4 shrink-0 text-white" />

            <span>{saveMessage}</span>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
        <Sidebar
          adminUsername={adminUsername}
          activeTab={activeTab}
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          onSelect={setActiveTab}
        />

        <section className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            adminUsername={adminUsername}
            pendingBookingCount={pending_booking_count}
            onMenu={() => setMobileNavOpen(true)}
          />

          <div className="mx-auto w-full max-w-7xl space-y-4 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-3 border-b border-black/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded border border-black/15 bg-black/[0.03] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-black/50">
                    Operations
                  </span>

                  <p className="hidden text-xs text-black/45 sm:inline">
                    {activeTab === "overview"
                      ? "Review incoming requests and confirm appointments."
                      : activeTab === "packages"
                        ? "Manage service packages and update pricing."
                        : "Set open schedule and track booked slots."}
                  </p>
                </div>

                <h1 className="mt-1 text-xl font-semibold tracking-tight text-black">
                  {activeTab === "overview"
                    ? `${greeting}, ${adminUsername}`
                    : activeTab === "packages"
                      ? "Packages & Pricing"
                      : "Availability"}
                </h1>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {activeTab === "overview" ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("packages")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-black/80 active:scale-95"
                  >
                    <Package className="size-3.5" />
                    Manage Packages
                  </button>
                ) : activeTab === "packages" ? (
                  <>
                    <div className="flex items-center rounded-lg border border-black/15 bg-black/[0.03] p-0.5">
                      <button
                        type="button"
                        onClick={() => setPackageSection("packages")}
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                          packageSection === "packages"
                            ? "bg-black font-semibold text-white"
                            : "text-black/45 hover:text-black"
                        }`}
                      >
                        <Layers className="size-3.5" />
                        Packages ({packages.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setPackageSection("addons")}
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                          packageSection === "addons"
                            ? "bg-black font-semibold text-white"
                            : "text-black/45 hover:text-black"
                        }`}
                      >
                        <Tag className="size-3.5" />
                        Add-ons ({addOns.length})
                      </button>
                    </div>

                    {packageSection === "packages" ? (
                      <button
                        type="button"
                        onClick={createPackage}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-black/80 active:scale-95 disabled:opacity-50"
                      >
                        <Plus className="size-3.5" />
                        Add Package
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={createAddOn}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-black/80 active:scale-95 disabled:opacity-50"
                      >
                        <Plus className="size-3.5" />
                        Add Add-on
                      </button>
                    )}
                  </>
                ) : null}
              </div>
            </div>

            <div className="pt-1">
              {activeTab === "overview" ? (
                <Overview initial_bookings={initialBookings} />
              ) : activeTab === "packages" ? (
                <PackagesEditor
                  activeSection={packageSection}
                  packages={packages}
                  addOns={addOns}
                  editingPackage={editingPackage}
                  setEditingPackage={setEditingPackage}
                  savePackage={savePackage}
                  saveAddOn={saveAddOn}
                  createPackage={createPackage}
                  createAddOn={createAddOn}
                  deleteAddOn={deleteAddOn}
                  deletePackage={deletePackage}
                />
              ) : (
                <Availability
                  businessHours={businessHours}
                  availabilityOverrides={availabilityOverrides}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
