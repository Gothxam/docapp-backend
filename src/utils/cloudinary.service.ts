import { Injectable, BadRequestException } from '@nestjs/common';
import cloudinary from '../config/cloudinary.config';

@Injectable()
export class CloudinaryService {
  /**
   * Upload profile picture to Cloudinary
   * @param file - Express Multer file object
   * @param folder - Cloudinary folder path (e.g., 'doctors/profile')
   * @returns Upload result with secure_url and public_id
   */
  async uploadProfilePicture(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ secure_url: string; public_id: string }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      // Convert buffer to base64
      const base64 = file.buffer.toString('base64');
      const dataUri = `data:${file.mimetype};base64,${base64}`;

      // Upload to Cloudinary with transformations
      const result = await cloudinary.uploader.upload(dataUri, {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      });

      return {
        secure_url: result.secure_url,
        public_id: result.public_id,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new BadRequestException(
        `Failed to upload file: ${error.message}`,
      );
    }
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - Cloudinary public ID of the image
   * @returns Success indicator
   */
  async deleteImage(publicId: string): Promise<boolean> {
    if (!publicId) {
      return false;
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.warn(`Warning: Failed to delete image ${publicId}: ${error.message}`);
      // Don't throw error, just warn and continue
      return false;
    }
  }

  /**
   * Upload multiple images
   * @param files - Array of Express Multer file objects
   * @param folder - Cloudinary folder path
   * @returns Array of upload results
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<Array<{ secure_url: string; public_id: string }>> {
    const uploadPromises = files.map((file) =>
      this.uploadProfilePicture(file, folder),
    );
    return Promise.all(uploadPromises);
  }

  /**
   * Delete multiple images
   * @param publicIds - Array of Cloudinary public IDs
   * @returns Number of successfully deleted images
   */
  async deleteMultipleImages(publicIds: string[]): Promise<number> {
    const deletePromises = publicIds.map((id) => this.deleteImage(id));
    const results = await Promise.all(deletePromises);
    return results.filter((success) => success).length;
  }
}
