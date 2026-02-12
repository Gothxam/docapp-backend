export interface UploadedFileType {
  buffer: Buffer;
  mimetype: string;
  originalname?: string;
  size?: number;
}
