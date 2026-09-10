
import { redirect } from "next/navigation";
import { get_availability_settings } from "@/lib/server/availability/availability.service";
import { get_current_admin } from "@/lib/server/auth/auth.session";
import { get_admin_bookings } from "@/lib/server/booking/booking.service";
import { get_admin_catalog } from "@/lib/server/catalog/catalog.service";

import { DashboardClient } from "./components/DashboardClient";

export default async function DashboardPage() {
  const admin = await get_current_admin();

  if (!admin) {
    redirect("/admin/login");
  }

  const [catalog, availability, bookings] =
    await Promise.all([
      get_admin_catalog(),
      get_availability_settings(),
      get_admin_bookings(),
    ]);

  return (
    <DashboardClient
      adminUsername={admin.username}
      initialPackages={catalog.packages}
      initialAddOns={catalog.addOns}
      initialBusinessHours={availability.business_hours}
      initialAvailabilityOverrides={
        availability.overrides
      }
      initialBookings={bookings}
    />
  );
}

