"use client";

import {
  ChevronDown,
  Package,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

import type { AddOnItem, PackageItem } from "@/types/catalog";

import { AddOnsEditor } from "./AddOnsEditor";

interface PackagesEditorProps {
  activeSection: "packages" | "addons";
  packages: PackageItem[];
  addOns: AddOnItem[];
  editingPackage: PackageItem | null;
  setEditingPackage: (pkg: PackageItem | null) => void;

  savePackage: (pkg: PackageItem) => Promise<void>;

  saveAddOn: (addOn: AddOnItem) => Promise<void>;

  createPackage: () => Promise<void>;

  createAddOn: () => Promise<void>;

  deleteAddOn: (id: string) => Promise<void>;

  deletePackage: (id: string) => Promise<void>;
}

export function PackagesEditor({
  activeSection,
  packages,
  addOns,
  editingPackage,
  setEditingPackage,
  savePackage,
  saveAddOn,
  createPackage,
  createAddOn,
  deleteAddOn,
  deletePackage,
}: PackagesEditorProps) {
  if (activeSection === "addons") {
    return (
      <div className="mt-4">
        {" "}
        <AddOnsEditor
          addOns={addOns}
          saveAddOn={saveAddOn}
          createAddOn={createAddOn}
          deleteAddOn={deleteAddOn}
        />{" "}
      </div>
    );
  }

  return (
    <div className="mt-4">
      {" "}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        {" "}
        <section className="space-y-3">
          {packages.map((pkg) => {
            const isEditing = editingPackage?.id === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`flex flex-col gap-4 rounded-2xl border p-5 transition sm:flex-row sm:items-center sm:justify-between ${
                  isEditing
                    ? "border-black bg-black/[0.05]"
                    : "border-black/10 bg-black/[0.02] hover:border-black/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-xl border ${
                      isEditing
                        ? "border-black/20 bg-black text-white"
                        : "border-black/15 bg-white text-black/50"
                    }`}
                  >
                    <Package className="size-5" />
                  </span>

                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-black">
                      {pkg.name}
                    </h2>

                    <p className="mt-1 text-sm leading-relaxed text-black/50">
                      {pkg.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-black/55">
                      <span className="font-medium text-black/70">
                        {pkg.estimatedTime}
                      </span>

                      <span className="text-black/25">•</span>

                      <span>
                        {pkg.prices
                          ? pkg.prices
                              .map((price) => `${price.label}: $${price.price}`)
                              .join(" · ")
                          : `Starting at ${pkg.displayStartingPrice}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPackage(pkg)}
                    className={`flex shrink-0 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition active:scale-95 ${
                      isEditing
                        ? "border-black bg-black text-white hover:bg-black/80"
                        : "border-black/20 bg-white text-black/70 hover:border-black hover:text-black"
                    }`}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deletePackage(pkg.id)}
                    className="flex shrink-0 items-center justify-center rounded-lg border border-red-200 p-2.5 text-red-600 transition hover:border-red-400 hover:bg-red-50"
                    aria-label="Delete package"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={createPackage}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-black/25 py-5 text-xs font-bold uppercase tracking-wider text-black/50 transition hover:border-black hover:bg-black/[0.02] hover:text-black"
          >
            <Plus className="size-4" />
            Add another package
          </button>
        </section>
        {editingPackage ? (
          <PackageForm
            packageData={editingPackage}
            onCancel={() => setEditingPackage(null)}
            onSave={savePackage}
          />
        ) : (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-black/[0.015] p-8 text-center">
            <div className="grid size-12 place-items-center rounded-xl border border-black/15 bg-white text-black/50">
              <Pencil className="size-5" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-black">
              Select a package
            </h2>

            <p className="mt-2 max-w-xs text-sm leading-relaxed text-black/50">
              Choose a service package from the list to edit its details or
              pricing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PackageForm({
  packageData,
  onCancel,
  onSave,
}: {
  packageData: PackageItem;
  onCancel: () => void;
  onSave: (pkg: PackageItem) => void;
}) {
  const [draft, setDraft] = useState(packageData);

  const hasTiers = Boolean(draft.prices);

  const update = (field: keyof PackageItem, value: string | number) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updatePrice = (index: number, value: string) => {
    setDraft((current) => ({
      ...current,
      prices: current.prices?.map((price, priceIndex) =>
        priceIndex === index
          ? {
              ...price,
              price: Number(value) || 0,
              displayPrice: `$${value || "0"}+`,
            }
          : price,
      ),
    }));
  };

  const togglePricingMode = () => {
    setDraft((current) =>
      current.prices
        ? {
            ...current,
            prices: undefined,
            startingPrice: current.prices[0]?.price ?? 100,
            displayStartingPrice: `$${current.prices[0]?.price ?? 100}`,
          }
        : {
            ...current,
            prices: [
              {
                label: "Cars",
                price: current.startingPrice ?? 100,
                displayPrice: `$${current.startingPrice ?? 100}+`,
              },
              {
                label: "SUVs/Trucks",
                price: (current.startingPrice ?? 100) + 25,
                displayPrice: `$${(current.startingPrice ?? 100) + 25}+`,
              },
            ],
            startingPrice: undefined,
            displayStartingPrice: undefined,
          },
    );
  };

  return (
    <section className="rounded-2xl border border-black/15 bg-black/[0.02] p-6">
      {" "}
      <div className="flex items-start justify-between">
        {" "}
        <div>
          {" "}
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">
            Editing service{" "}
          </p>
          <h2 className="mt-2 text-xl font-bold text-black">Package details</h2>
          <p className="mt-2 text-xs leading-relaxed text-black/50">
            Click any field below to update customer details.
          </p>
        </div>
        <button
          type="button"
          aria-label="Close package editor"
          onClick={onCancel}
          className="rounded-lg p-1 text-black/40 transition hover:bg-black/10 hover:text-black"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="mt-6 space-y-4">
        <Field label="Package name">
          <input
            className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black placeholder-black/30 outline-none transition focus:border-black"
            value={draft.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={3}
            className="w-full resize-none rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black placeholder-black/30 outline-none transition focus:border-black"
            value={draft.description}
            onChange={(event) => update("description", event.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Est. duration">
            <input
              className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black"
              value={draft.estimatedTime}
              onChange={(event) => update("estimatedTime", event.target.value)}
            />
          </Field>

          <Field label="Minutes">
            <input
              type="number"
              min="0"
              className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black"
              value={draft.durationMinutes}
              onChange={(event) =>
                update("durationMinutes", Number(event.target.value))
              }
            />
          </Field>
        </div>

        <div className="border-t border-black/10 pt-4">
          <div className="flex items-center justify-between gap-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">
              Customer pricing
            </label>

            <button
              type="button"
              onClick={togglePricingMode}
              className="flex items-center gap-1 text-xs font-semibold text-black/60 transition hover:text-black"
            >
              {hasTiers ? "Use one price" : "Use vehicle pricing"}

              <ChevronDown className="size-3" />
            </button>
          </div>

          {hasTiers ? (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {draft.prices?.map((price, index) => (
                <Field key={price.label} label={price.label}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black"
                    value={price.price}
                    onChange={(event) => updatePrice(index, event.target.value)}
                  />
                </Field>
              ))}
            </div>
          ) : (
            <div className="mt-3">
              <Field label="Starting price ($)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black"
                  value={draft.startingPrice ?? 0}
                  onChange={(event) => {
                    const price = Number(event.target.value);

                    setDraft((current) => ({
                      ...current,
                      startingPrice: price,
                      displayStartingPrice: `$${price}`,
                    }));
                  }}
                />
              </Field>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-black/15 bg-white py-2 text-xs font-semibold text-black/60 transition hover:border-black hover:text-black"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => onSave(draft)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-black py-2 text-xs font-semibold text-white transition hover:bg-black/80"
        >
          <Save className="size-3.5" />
          Save changes
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      {" "}
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">
        {label}{" "}
      </span>
      {children}
    </label>
  );
}
