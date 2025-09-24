import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: any[];
  resource_type?: "image" | "video" | "raw" | "auto";
}

export async function uploadToCloudinary(
  file: Buffer | string,
  options: UploadOptions = {}
) {
  try {
    const defaultOptions = {
      folder: "doctor-patient-portal",
      resource_type: "auto" as const,
      quality: "auto",
      fetch_format: "auto",
    };

    const uploadOptions = { ...defaultOptions, ...options };

    const result = await cloudinary.uploader.upload(file, uploadOptions);

    console.log("  File uploaded to Cloudinary:", result.public_id);

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("  Cloudinary upload failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function deleteFromCloudinary(public_id: string) {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    console.log("  File deleted from Cloudinary:", public_id);
    return { success: true, result };
  } catch (error) {
    console.error("  Cloudinary deletion failed:", error);
    return { success: false, error: error.message };
  }
}

// Predefined transformations for profile photos
export const profilePhotoTransformation = [
  { width: 400, height: 400, crop: "fill", gravity: "face" },
  { quality: "auto", fetch_format: "auto" },
];
