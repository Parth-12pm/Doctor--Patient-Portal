import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000, // Set timeout to 120 seconds
});

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: any[];
  resource_type?: "image" | "video" | "raw" | "auto";
}

export interface UploadApiResponse {
  success: true;
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface UploadApiErrorResponse {
  success: false;
  error: string;
}

export function uploadToCloudinary(
  fileBuffer: Buffer,
  options: UploadOptions = {}
): Promise<UploadApiResponse | UploadApiErrorResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "doctor-patient-portal",
        resource_type: "auto",
        quality: "auto",
        fetch_format: "auto",
        ...options,
      },
      (error, result) => {
        if (error) {
          console.error("  Cloudinary upload failed:", error);
          return reject({ success: false, error: error.message });
        }
        if (result) {
          console.log("  File uploaded to Cloudinary:", result.public_id);
          resolve({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        }
      }
    );
    Readable.from(fileBuffer).pipe(uploadStream);
  });
}

export async function deleteFromCloudinary(public_id: string) {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    console.log("  File deleted from Cloudinary:", public_id);
    return { success: true, result };
  } catch (error: any) {
    console.error("  Cloudinary deletion failed:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred",
    };
  }
}

// Predefined transformations for profile photos
export const profilePhotoTransformation = [
  { width: 400, height: 400, crop: "fill", gravity: "face" },
  { quality: "auto", fetch_format: "auto" },
];
