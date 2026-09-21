import axios from 'axios';

import api from '../axiosInstance';

export interface PresignedVideoUpload {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
}

export interface UploadVideoOptions {
  /** Called with 0-100 as the browser pushes the file to S3. */
  onProgress?: (percent: number) => void;
  /** Lets the caller cancel an upload that is already running. */
  signal?: AbortSignal;
}

export interface UploadedVideo {
  url: string;
  key: string;
}

export interface LibraryVideo {
  key: string;
  url: string;
  filename: string;
  displayName: string;
  size: number;
  lastModified?: string;
}

/** Video types the backend will sign an upload for. */
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-m4v',
  'video/x-msvideo',
  'video/x-matroska'
];

/** Same ceiling the backend enforces: 1 GB. */
export const MAX_VIDEO_SIZE = 1024 * 1024 * 1024;

export const videoService = {
  /**
   * List videos already uploaded to S3, newest first.
   */
  getAllVideos: async (): Promise<LibraryVideo[]> => {
    const response = await api.get<{
      success: boolean;
      data: LibraryVideo[];
    }>('/videos');

    return response.data.data || [];
  },

  /**
   * Ask the API for a short-lived S3 upload URL.
   */
  getUploadUrl: async (file: File): Promise<PresignedVideoUpload> => {
    const response = await api.post<{
      success: boolean;
      data: PresignedVideoUpload;
    }>('/videos/presign', {
      filename: file.name,
      contentType: file.type,
      size: file.size
    });

    return response.data.data;
  },

  /**
   * Upload a video straight from the browser to S3.
   *
   * The file never touches our API server, so big files are fine.
   * Returns the public URL to store on the walkthrough record.
   */
  uploadVideo: async (
    file: File,
    options: UploadVideoOptions = {}
  ): Promise<UploadedVideo> => {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      throw new Error(
        'That file type is not supported. Use MP4, WebM, MOV, OGG, AVI or MKV.'
      );
    }

    if (file.size > MAX_VIDEO_SIZE) {
      throw new Error('That video is larger than the 1 GB limit.');
    }

    const { uploadUrl, publicUrl, key } = await videoService.getUploadUrl(file);

    // A bare axios call: our instance adds auth cookies and JSON headers,
    // and S3 rejects the request if those are attached to a signed URL.
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type
      },
      signal: options.signal,
      timeout: 0,
      onUploadProgress: (event) => {
        if (!options.onProgress) return;

        const total = event.total || file.size;
        const percent = Math.round((event.loaded * 100) / total);

        options.onProgress(Math.min(percent, 100));
      }
    });

    return { url: publicUrl, key };
  },

  /**
   * Remove an uploaded video from S3 (used when the admin replaces one).
   */
  deleteVideo: async (key: string): Promise<void> => {
    await api.delete('/videos', { params: { key } });
  }
};
