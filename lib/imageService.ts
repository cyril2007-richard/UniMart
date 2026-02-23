
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// Cloudinary Configuration
// TODO: Move these to a .env file or central config
const CLOUD_NAME = "dm63n4n11"; // Updated with user provided cloud name
const UPLOAD_PRESET = "unimart_unsigned"; // Ensure this matches your Unsigned Preset name

/**
 * Optimizes an image and uploads it to Cloudinary.
 * 
 * @param uri The local URI of the image to upload.
 * @returns A promise that resolves to the secure URL of the uploaded image.
 * @throws Error if optimization or upload fails.
 */
export async function uploadImage(uri: string): Promise<string> {
  try {
    // 1. Optimize the image (Resize and Compress)
    const manipulatedImage = await manipulateAsync(
      uri,
      [{ resize: { width: 1000 } }], // Resize to max 1000px width
      { compress: 0.7, format: SaveFormat.JPEG }
    );

    // 2. Prepare FormData
    const data = new FormData();
    
    // In React Native, we must provide a name and type for the file to be accepted
    const fileToUpload = {
      uri: manipulatedImage.uri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any;

    data.append('file', fileToUpload);
    data.append('upload_preset', UPLOAD_PRESET);

    // 3. POST to Cloudinary REST API
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Cloudinary Error:', result);
      throw new Error(result.error?.message || 'Cloudinary upload failed');
    }

    return result.secure_url;
  } catch (error: any) {
    console.error('[uploadImage Error]:', error.message);
    throw error;
  }
}
