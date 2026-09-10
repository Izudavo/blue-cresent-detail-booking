# Blue Crescent Web App

Blue Crescent is a vehicle detailing website with a customer-facing package and booking flow and an admin dashboard for managing packages, prices, booking availability, and booking requests.

The current UI is a frontend prototype. Package data, booking requests, availability, authentication, and image submission still need to be connected to a database and API.

## Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS v4
- Framer Motion for booking drawer motion
- lucide-react for interface icons
- Planned backend: Prisma ORM with PostgreSQL
- Planned file storage: S3-compatible object storage or a managed image service

## Run Locally

The project uses pnpm. The current pnpm version requires Node.js 22.13 or newer.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

Useful commands:

```bash
pnpm type-check
pnpm lint
pnpm build
```

## Current User Experience

### Customer flow: `/packages`

1.  The page loads packages from `app/components/data/packages.ts`.
2.  It checks `localStorage` for the `blue-crescent-packages` override. This currently lets dashboard edits appear on the same browser.
3.  Each package is rendered with its description, duration, inclusions, and either one starting price or vehicle-specific prices.
4.  Selecting `Book Package` opens `BookingDrawer`.
5.  The drawer collects vehicle type when needed, date, time, customer details, vehicle information, add-ons, and optional vehicle images.
6.  Submit currently displays a local success state. It does not yet create a booking record or upload images.

### Admin flow: `/dashboard`

1.  The dashboard opens on a username/password screen. This is a temporary client-side gate: any non-empty username and password are accepted.
2.  The Overview tab shows seeded booking requests and lets an admin update their status in local React state.
3.  The Packages tab edits the customer-facing `PackageItem` shape and currently persists changes to `localStorage`.
4.  The Availability tab provides a weekly open/closed schedule, operating hours, and a visual list of booked slots. These values are currently local component state.

The backend should replace each local state or `localStorage` boundary without changing the customer-facing data shape more than necessary.

## Relevant File Structure

```text
app/
	 components/
		 data/
			 packages.ts          # PackageItem, PriceTier, AddOnItem, and seed data
	 packages/
		 page.tsx               # Customer package catalog and localStorage hydration
		 sections/
			 Header.tsx           # Public packages header
			 PackageCard.tsx      # One package card and select action
			 AddOnsList.tsx       # Customer-visible add-on catalog
			 BookingDrawer.tsx    # Multi-step booking form and image previews
			 FallingCrescents.tsx # Page decoration
	 dashboard/
		 page.tsx               # Dashboard route entry
		 DashboardClient.tsx    # Dashboard state, tabs, package save flow, auth gate
		 AuthScreen.tsx         # Temporary username/password UI
		 DashboardHeader.tsx    # Admin header and identity area
		 Sidebar.tsx            # Dashboard navigation
		 Overview.tsx           # Booking request overview
		 PackagesEditor.tsx     # Package list and editing form
		 Availability.tsx       # Weekly schedule and time-slot view
		 data.ts                # Current booking and dashboard seed data
		 dashboard.css          # Dashboard and auth-specific styles
	 api/                     # Recommended location for future Route Handlers
	 lib/site.ts              # Shared site configuration
public/images/             # Static assets; uploads should not be stored here
```

## Current Frontend Data Contracts

The package model in `app/components/data/packages.ts` currently contains:

```ts
type PackageItem = {
  id: string;
  name: string;
  badge?: string;
  featured?: boolean;
  startingPrice?: number;
  displayStartingPrice?: string;
  prices?: { label: string; price: number; displayPrice: string }[];
  description: string;
  estimatedTime: string;
  durationMinutes: number;
  items: string[];
  exteriorItems?: string[];
  interiorItems?: string[];
};

type AddOnItem = {
  id: string;
  name: string;
  price: number;
  displayPrice: string;
  additionalMinutes?: number;
};
```

For the database, numeric prices and durations should be authoritative. Display strings such as `$125+` should be derived by the API or UI rather than maintained as independent values.

## Recommended Prisma Schema

Create `prisma/schema.prisma` with PostgreSQL. This schema covers admins, packages, vehicle pricing, inclusions, add-ons, bookings, booking images, and availability rules.

```prisma
enum BookingStatus {
	 NEW
	 CONFIRMED
	 COMPLETED
	 CANCELLED
}

enum VehicleCategory {
	 CAR
	 SUV_TRUCK
}

model AdminUser {
	 id           String   @id @default(cuid())
	 username     String   @unique
	 passwordHash String
	 createdAt    DateTime @default(now())
	 updatedAt    DateTime @updatedAt
}

model ServicePackage {
	 id              String             @id @default(cuid())
	 slug            String             @unique
	 name            String
	 badge           String?
	 featured        Boolean            @default(false)
	 description     String
	 estimatedTime   String
	 durationMinutes Int
	 startingPrice   Decimal?           @db.Decimal(10, 2)
	 active          Boolean            @default(true)
	 sortOrder       Int                @default(0)
	 createdAt       DateTime           @default(now())
	 updatedAt       DateTime           @updatedAt
	 prices          PackagePrice[]
	 inclusions      PackageInclusion[]
	 bookings        Booking[]
}

model PackagePrice {
	 id          String          @id @default(cuid())
	 packageId   String
	 vehicleType VehicleCategory
	 price       Decimal         @db.Decimal(10, 2)
	 package     ServicePackage  @relation(fields: [packageId], references: [id], onDelete: Cascade)

	 @@unique([packageId, vehicleType])
}

model PackageInclusion {
	 id        String         @id @default(cuid())
	 packageId String
	 label     String
	 group     String?
	 sortOrder Int            @default(0)
	 package   ServicePackage @relation(fields: [packageId], references: [id], onDelete: Cascade)
}

model AddOn {
	 id                String        @id @default(cuid())
	 slug              String        @unique
	 name              String
	 price             Decimal       @db.Decimal(10, 2)
	 additionalMinutes Int?
	 active            Boolean       @default(true)
	 bookingItems      BookingAddOn[]
}

model Booking {
	 id             String         @id @default(cuid())
	 reference      String         @unique
	 status         BookingStatus   @default(NEW)
	 packageId      String
	 vehicleType    VehicleCategory?
	 scheduledDate  DateTime
	 scheduledTime  String
	 firstName      String
	 lastName       String
	 phone          String
	 email          String
	 vehicle        String
	 basePrice      Decimal        @db.Decimal(10, 2)
	 addOnsTotal    Decimal        @db.Decimal(10, 2)
	 estimatedTotal Decimal        @db.Decimal(10, 2)
	 notes          String?
	 createdAt      DateTime       @default(now())
	 updatedAt      DateTime       @updatedAt
	 package        ServicePackage @relation(fields: [packageId], references: [id])
	 addOns         BookingAddOn[]
	 images         BookingImage[]

	 @@index([scheduledDate, status])
}

model BookingAddOn {
	 bookingId String
	 addOnId   String
	 price     Decimal @db.Decimal(10, 2)
	 booking   Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)
	 addOn     AddOn   @relation(fields: [addOnId], references: [id])

	 @@id([bookingId, addOnId])
}

model BookingImage {
	 id          String   @id @default(cuid())
	 bookingId   String
	 objectKey   String   @unique
	 url         String
	 contentType String
	 sizeBytes   Int
	 createdAt   DateTime @default(now())
	 booking     Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
}

model AvailabilityRule {
	 id        String   @id @default(cuid())
	 dayOfWeek Int
	 enabled   Boolean  @default(true)
	 opensAt   String
	 closesAt  String
	 updatedAt DateTime @updatedAt

	 @@unique([dayOfWeek])
}
```

Install and migrate after adding the schema:

```bash
pnpm add @prisma/client
pnpm add -D prisma
pnpm prisma init
pnpm prisma migrate dev --name init
pnpm prisma generate
```

Add `DATABASE_URL` to `.env.local`. Use a production migration command against production; do not run `migrate dev` against the production database.

## Recommended API Routes

Use Next.js Route Handlers under `app/api`. Public catalog reads can be cached. Booking creation and all admin mutations must be validated on the server.

### Public catalog and booking

| Method | Route                               | Purpose                                 |
| ------ | ----------------------------------- | --------------------------------------- |
| `GET`  | `/api/packages`                     | Active packages, prices, and inclusions |
| `GET`  | `/api/add-ons`                      | Active add-ons                          |
| `GET`  | `/api/availability?from=...&to=...` | Available days and slots                |
| `POST` | `/api/bookings`                     | Validate and create a booking request   |
| `POST` | `/api/bookings/upload-intent`       | Return a signed image upload URL        |
| `POST` | `/api/bookings/:id/images/complete` | Verify and attach an uploaded image     |

`POST /api/bookings` should receive package ID, optional vehicle type, date, time, customer details, add-on IDs, and completed image object keys. Recalculate price and duration from the database; never trust totals sent by the browser.

### Admin

| Method   | Route                     | Purpose                                              |
| -------- | ------------------------- | ---------------------------------------------------- |
| `POST`   | `/api/admin/login`        | Validate credentials and set a secure session cookie |
| `POST`   | `/api/admin/logout`       | Clear the admin session                              |
| `GET`    | `/api/admin/me`           | Return the current admin identity                    |
| `GET`    | `/api/admin/bookings`     | List bookings with status/date filters               |
| `GET`    | `/api/admin/bookings/:id` | Booking details and image metadata                   |
| `PATCH`  | `/api/admin/bookings/:id` | Update status, notes, or appointment details         |
| `GET`    | `/api/admin/packages`     | List packages, including inactive ones               |
| `POST`   | `/api/admin/packages`     | Create a package                                     |
| `PATCH`  | `/api/admin/packages/:id` | Edit package content and pricing                     |
| `DELETE` | `/api/admin/packages/:id` | Soft-delete or deactivate a package                  |
| `GET`    | `/api/admin/availability` | Return schedule rules                                |
| `PUT`    | `/api/admin/availability` | Replace schedule rules and hours                     |

Create bookings inside a server-side transaction: re-check the selected slot, calculate the final amount, create the booking and add-on rows, and attach validated image records.

## Image Upload Plan

Do not save customer images in `public/images` or as base64 in the database. Store files in private object storage and keep only metadata in `BookingImage`.

1.  The browser requests an upload intent with file name, MIME type, and byte size.
2.  The server validates type and size, creates a random key such as `bookings/{bookingId}/{uuid}`, and returns a short-lived signed upload URL.
3.  The browser uploads directly to S3, Cloudflare R2, or another S3-compatible service.
4.  The browser calls the completion endpoint with the object key and upload token.
5.  The server verifies the object exists and creates `BookingImage`.
6.  Admin image URLs should be short-lived signed download URLs, not permanent public URLs.

Recommended limits: JPEG, PNG, and WebP only; 10 MB per image; a fixed maximum number of images per booking; and server-side verification of content type and size. Add malware scanning before exposing uploaded files to admins if the deployment requires it.

## Authentication Plan

`AuthScreen` is currently a UI placeholder. Replace its `onLogin` callback with a request to `/api/admin/login` once the API exists.

- Store only a strong password hash, never plaintext passwords.
- Use an HTTP-only, secure, same-site session cookie.
- Protect every `/api/admin/*` route on the server, not just the dashboard UI.
- Add rate limiting and generic login errors.
- Create the first admin through a server-only seed or one-time admin CLI command, not public signup.
- Add logout to the dashboard header or sidebar when sessions are connected.

## Suggested Build Order

1.  Add Prisma, PostgreSQL, environment configuration, and the initial migration.
2.  Seed packages and add-ons from `app/components/data/packages.ts`.
3.  Implement public package and add-on reads, then remove the public `localStorage` dependency.
4.  Implement server-side availability and slot generation.
5.  Implement booking creation with price, duration, and double-booking validation.
6.  Implement signed image uploads and booking image records.
7.  Implement admin login and session middleware.
8.  Replace dashboard seed data and `localStorage` writes with admin API calls.
9.  Add loading, error, empty, and save states around each API-backed dashboard section.
10. Add integration tests for booking creation, double-booking prevention, admin authorization, package edits, and upload validation.

## Current Limitations

- Dashboard login accepts any non-empty credentials and is not security.
- Package edits are browser-local and are not shared across users or devices.
- Booking submission shows a success state but does not persist a booking.
- Vehicle images are previewed with browser object URLs and are not uploaded.
- Dashboard bookings and availability are seeded in `app/dashboard/data.ts` and component state.
- Display strings such as `$125+` currently sit beside numeric prices; the API should make numeric values authoritative.
