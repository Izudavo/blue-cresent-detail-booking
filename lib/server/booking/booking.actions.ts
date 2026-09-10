"use server";

import { create_booking } from "./booking.service";

import {
  validate_create_booking_input,
} from "./booking.validation";

import type { CreateBookingInput } from "./booking.types";

export async function submit_booking(
  input: CreateBookingInput,
) {
  const validated_input =
    validate_create_booking_input(input);

  const booking =
    await create_booking(validated_input);

  return booking;
}

