import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with Environment Variables
// You can get these from your Cloudinary Dashboard: https://cloudinary.com/console
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a base64 image string to Cloudinary
 * @param fileStr - Base64 encoded image
 * @param folder - Destination folder in Cloudinary
 */
export const uploadImage = async (fileStr: string, folder: string = 'stayunikl') => {
  try {
    console.log('Starting Cloudinary Upload to folder:', folder);
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: folder,
      resource_type: 'auto',
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Failed to upload image to cloud storage');
  }
};

/**
 * Deletes an image from Cloudinary
 * @param publicId - The public ID of the image
 */
export const deleteImage = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
  }
};

export default cloudinary;
