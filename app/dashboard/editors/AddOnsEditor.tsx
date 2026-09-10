"use client";

import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";

import type { AddOnItem } from "@/types/catalog";

interface AddOnsEditorProps {
  addOns: AddOnItem[];

  saveAddOn: (addOn: AddOnItem) => Promise<void>;

  createAddOn: () => Promise<void>;

  deleteAddOn: (id: string) => Promise<void>;
}

export function AddOnsEditor({
  addOns,
  saveAddOn,
  createAddOn,
  deleteAddOn,
}: AddOnsEditorProps) {
  const [editingAddOn, setEditingAddOn] = useState<AddOnItem | null>(null);

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/50">
            Optional services
          </p>

          <h2 className="mt-2 text-2xl font-bold">Add-ons</h2>

          <p className="mt-1 max-w-xl text-sm text-black/50">
            Manage the optional services customers can add to their detailing
            package.
          </p>
        </div>

        <button
          type="button"
          onClick={createAddOn}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition hover:bg-black hover:text-white"
        >
          <Plus className="size-3.5" />
          Add add-on
        </button>
      </div>

      <div className="space-y-3">
        {addOns.map((addOn) => (
          <div key={addOn.id}>
            <div
              className={`flex flex-col gap-4 rounded-2xl border p-5 transition sm:flex-row sm:items-center sm:justify-between ${
                editingAddOn?.id === addOn.id
                  ? "border-black bg-black/[0.05]"
                  : "border-black/10 bg-black/[0.02] hover:border-black/20"
              }`}
            >
              <div>
                <h3 className="font-bold">{addOn.name}</h3>

                <div className="mt-2 flex flex-wrap gap-4 text-xs text-black/55">
                  <span>{addOn.displayPrice}</span>

                  {addOn.additionalMinutes !== undefined && (
                    <span>+{addOn.additionalMinutes} min</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    editingAddOn?.id === addOn.id
                      ? setEditingAddOn(null)
                      : setEditingAddOn(addOn)
                  }
                  className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-black/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition hover:border-black"
                >
                  <Pencil className="size-3.5" />

                  {editingAddOn?.id === addOn.id ? "Close" : "Edit"}
                </button>

                <button
                  type="button"
                  onClick={() => deleteAddOn(addOn.id)}
                  className="flex shrink-0 items-center justify-center rounded-lg border border-black/15 p-2.5 text-black/50 transition hover:border-black hover:bg-black/[0.03] hover:text-black"
                  aria-label="Delete add-on"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            {editingAddOn?.id === addOn.id && (
              <AddOnForm
                addOn={editingAddOn}
                onCancel={() => setEditingAddOn(null)}
                onSave={(nextAddOn) => {
                  saveAddOn(nextAddOn);
                  setEditingAddOn(null);
                }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function AddOnForm({
  addOn,
  onCancel,
  onSave,
}: {
  addOn: AddOnItem;
  onCancel: () => void;
  onSave: (addOn: AddOnItem) => void;
}) {
  const [draft, setDraft] = useState<AddOnItem>(addOn);

  return (
    <section className="mb-3 -mt-2 rounded-b-2xl border border-t-0 border-black/15 bg-black/[0.02] p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/50">
            Editing add-on
          </p>

          <h3 className="mt-1 text-lg font-bold">{addOn.name}</h3>
        </div>

        <button
          type="button"
          aria-label="Close add-on editor"
          onClick={onCancel}
          className="rounded-lg p-1 text-black/50 transition hover:bg-black/10 hover:text-black"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="space-y-3">
        <Field label="Add-on name">
          <input
            value={draft.name}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price">
            <input
              type="number"
              min="0"
              step="0.01"
              value={draft.price}
              onChange={(event) => {
                const price = Number(event.target.value) || 0;

                setDraft((current) => ({
                  ...current,
                  price,
                  displayPrice: `$${price.toFixed(0)}+`,
                }));
              }}
            />
          </Field>

          <Field label="Additional minutes">
            <input
              type="number"
              min="0"
              value={draft.additionalMinutes ?? ""}
              onChange={(event) => {
                const value = event.target.value;

                setDraft((current) => ({
                  ...current,
                  additionalMinutes: value === "" ? undefined : Number(value),
                }));
              }}
            />
          </Field>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-black/15 bg-white px-3 py-2 text-xs font-semibold text-black/60 transition hover:border-black hover:text-black"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => onSave(draft)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white transition hover:bg-black/80"
        >
          <Save className="size-3.5" />
          Save
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
    <label className="editor-field block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">
        {label}
      </span>

      {children}
    </label>
  );
}
