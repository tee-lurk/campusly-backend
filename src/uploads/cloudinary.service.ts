import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(private config: ConfigService) {
    const cloud_name = this.config.get<string>('CLOUDINARY_CLOUD_NAME') || 'ubbrsl6p';
    const api_key = this.config.get<string>('CLOUDINARY_API_KEY') || '215657939274437';
    const api_secret = this.config.get<string>('CLOUDINARY_API_SECRET') || 'IZEd1bkaPShadWiuY1gkWV1w6JM';
    cloudinary.config({ cloud_name, api_key, api_secret });
  }

  /**
   * Upload a buffer to Cloudinary.
   * @param buffer  Raw file bytes (from multer MemoryStorage).
   * @param folder  Cloudinary folder to organise uploads.
   * @returns       The secure HTTPS URL of the uploaded resource.
   */
  async uploadBuffer(buffer: Buffer, folder = 'campusly'): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(
              new BadRequestException(
                `Cloudinary upload failed: ${error.message}`,
              ),
            );
            return;
          }
          if (!result) {
            reject(new BadRequestException('Cloudinary returned no result.'));
            return;
          }
          resolve(result.secure_url);
        },
      );

      // Pipe the buffer into Cloudinary's upload stream
      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }
}
