import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

import { s3_client } from "./s3.client";

const bucket_name = process.env.AWS_S3_BUCKET_NAME;

if (!bucket_name) {
  throw new Error("AWS_S3_BUCKET_NAME is not configured.");
}

const UPLOAD_URL_EXPIRES_IN = 300;
const VIEW_URL_EXPIRES_IN = 300;

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const FILE_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const VEHICLE_IMAGE_KEY_PREFIX = "bookings/uploads/";

export interface PresignedVehicleImageUpload {
  storage_key: string;
  upload_url: string;
}

export interface VerifyVehicleImageInput {
  storage_key: string;
  content_type: string;
  file_size: number;
}

export async function create_vehicle_image_upload_url(
  content_type: string,
): Promise<PresignedVehicleImageUpload> {
  const normalized_content_type = content_type.trim().toLowerCase();

  if (!ALLOWED_CONTENT_TYPES.has(normalized_content_type)) {
    throw new Error("Vehicle images must be JPEG, PNG, or WebP.");
  }

  const extension = FILE_EXTENSION_MAP[normalized_content_type];

  const storage_key = `${VEHICLE_IMAGE_KEY_PREFIX}${randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: bucket_name,
    Key: storage_key,
    ContentType: normalized_content_type,
  });

  const upload_url = await getSignedUrl(s3_client, command, {
    expiresIn: UPLOAD_URL_EXPIRES_IN,
  });

  return {
    storage_key,
    upload_url,
  };
}

export async function verify_vehicle_image(image: VerifyVehicleImageInput) {
  const storage_key = image.storage_key.trim();

  if (!storage_key.startsWith(VEHICLE_IMAGE_KEY_PREFIX)) {
    throw new Error("Invalid vehicle image storage key.");
  }

  const content_type = image.content_type.trim().toLowerCase();

  if (!ALLOWED_CONTENT_TYPES.has(content_type)) {
    throw new Error("Invalid vehicle image content type.");
  }

  if (
    !Number.isInteger(image.file_size) ||
    image.file_size <= 0 ||
    image.file_size > MAX_IMAGE_SIZE
  ) {
    throw new Error("Invalid vehicle image file size.");
  }

  let object;

  try {
    object = await s3_client.send(
      new HeadObjectCommand({
        Bucket: bucket_name,
        Key: storage_key,
      }),
    );
  } catch {
    throw new Error("Vehicle image was not found.");
  }

  if (object.ContentLength !== image.file_size) {
    throw new Error("Vehicle image file size does not match.");
  }

  if (object.ContentType?.toLowerCase() !== content_type) {
    throw new Error("Vehicle image content type does not match.");
  }

  return {
    storage_key,
    content_type,
    file_size: object.ContentLength,
  };
}

export async function create_vehicle_image_view_url(
  storage_key: string,
): Promise<string> {
  const normalized_storage_key = storage_key.trim();

  if (!normalized_storage_key.startsWith(VEHICLE_IMAGE_KEY_PREFIX)) {
    throw new Error("Invalid vehicle image storage key.");
  }

  const command = new GetObjectCommand({
    Bucket: bucket_name,
    Key: normalized_storage_key,
  });

  return getSignedUrl(s3_client, command, {
    expiresIn: VIEW_URL_EXPIRES_IN,
  });
}
