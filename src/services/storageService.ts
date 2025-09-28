import { supabase } from '../lib/supabase';
import { 
  UploadResult, 
  FileValidationResult, 
  StorageConfig, 
  StorageFile, 
  ListFilesResult,
  STORAGE_BUCKETS,
  FILE_TYPES,
  StorageBucket,
  FileTypeCategory
} from '../types/storage';

// Default storage configurations for different use cases
export const STORAGE_CONFIGS: Record<string, StorageConfig> = {
  EVENT_IMAGES: {
    bucket: STORAGE_BUCKETS.EVENT_IMAGES,
    folder: 'events',
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedTypes: FILE_TYPES.IMAGES
  },
  PROFILE_PICTURES: {
    bucket: STORAGE_BUCKETS.PROFILE_PICTURES,
    folder: 'profiles',
    maxSizeBytes: 2 * 1024 * 1024, // 2MB
    allowedTypes: FILE_TYPES.IMAGES
  },
  BANNERS: {
    bucket: STORAGE_BUCKETS.BANNERS,
    folder: 'banners',
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedTypes: FILE_TYPES.IMAGES
  },
  DOCUMENTS: {
    bucket: STORAGE_BUCKETS.DOCUMENTS,
    folder: 'docs',
    maxSizeBytes: 20 * 1024 * 1024, // 20MB
    allowedTypes: FILE_TYPES.DOCUMENTS
  }
} as const;

/**
 * Validates a file against the provided configuration
 */
export const validateFile = (file: File, config: StorageConfig): FileValidationResult => {
  // Check file size
  if (config.maxSizeBytes && file.size > config.maxSizeBytes) {
    const maxSizeMB = (config.maxSizeBytes / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    };
  }

  // Check file type
  if (config.allowedTypes && !config.allowedTypes.includes(file.type)) {
    const allowedTypes = config.allowedTypes.join(', ');
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes}`
    };
  }

  return { isValid: true };
};

/**
 * Generates a unique filename with timestamp and random string
 */
const generateUniqueFilename = (originalName: string, folder?: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  
  // Sanitize filename
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
  const filename = `${sanitizedBaseName}_${timestamp}_${randomString}.${extension}`;
  
  return folder ? `${folder}/${filename}` : filename;
};

/**
 * Uploads a file to Supabase Storage
 */
export const uploadFile = async (
  file: File, 
  config: StorageConfig,
  customPath?: string
): Promise<UploadResult> => {
  try {
    // Validate file
    const validation = validateFile(file, config);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Generate file path
    const filePath = customPath || generateUniqueFilename(file.name, config.folder);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(config.bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(config.bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
};

/**
 * Deletes a file from Supabase Storage
 */
export const deleteFile = async (bucket: string, path: string): Promise<UploadResult> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Storage delete error:', error);
      return {
        success: false,
        error: `Delete failed: ${error.message}`
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown delete error'
    };
  }
};

/**
 * Gets a public URL for a file in storage
 */
export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

/**
 * Lists files in a storage bucket folder
 */
export const listFiles = async (bucket: string, folder?: string): Promise<ListFilesResult> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder);

    if (error) {
      console.error('Storage list error:', error);
      return { data: null, error: error.message };
    }

    return { data: data as StorageFile[], error: null };

  } catch (error) {
    console.error('List files error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown list error' 
    };
  }
};

/**
 * Convenience methods for common upload scenarios
 */
export const storageService: {
  uploadEventImage: (file: File, eventId?: string) => Promise<UploadResult>;
  uploadProfilePicture: (file: File, userId: string) => Promise<UploadResult>;
  uploadBanner: (file: File, customPath?: string) => Promise<UploadResult>;
  uploadDocument: (file: File, customPath?: string) => Promise<UploadResult>;
  deleteEventImage: (path: string) => Promise<UploadResult>;
  deleteProfilePicture: (path: string) => Promise<UploadResult>;
  getEventImageUrl: (path: string) => string;
  getProfilePictureUrl: (path: string) => string;
  getBannerUrl: (path: string) => string;
  getDocumentUrl: (path: string) => string;
} = {
  /**
   * Upload event image
   */
  uploadEventImage: async (file: File, eventId?: string): Promise<UploadResult> => {
    const customPath = eventId ? `events/${eventId}/${file.name}` : undefined;
    return uploadFile(file, STORAGE_CONFIGS.EVENT_IMAGES, customPath);
  },

  /**
   * Upload profile picture
   */
  uploadProfilePicture: async (file: File, userId: string): Promise<UploadResult> => {
    const customPath = `profiles/${userId}/${file.name}`;
    return uploadFile(file, STORAGE_CONFIGS.PROFILE_PICTURES, customPath);
  },

  /**
   * Upload banner image
   */
  uploadBanner: async (file: File, customPath?: string): Promise<UploadResult> => {
    return uploadFile(file, STORAGE_CONFIGS.BANNERS, customPath);
  },

  /**
   * Upload document
   */
  uploadDocument: async (file: File, customPath?: string): Promise<UploadResult> => {
    return uploadFile(file, STORAGE_CONFIGS.DOCUMENTS, customPath);
  },

  /**
   * Delete event image
   */
  deleteEventImage: async (path: string): Promise<UploadResult> => {
    return deleteFile(STORAGE_CONFIGS.EVENT_IMAGES.bucket, path);
  },

  /**
   * Delete profile picture
   */
  deleteProfilePicture: async (path: string): Promise<UploadResult> => {
    return deleteFile(STORAGE_CONFIGS.PROFILE_PICTURES.bucket, path);
  },

  /**
   * Get event image URL
   */
  getEventImageUrl: (path: string): string => {
    return getPublicUrl(STORAGE_CONFIGS.EVENT_IMAGES.bucket, path);
  },

  /**
   * Get profile picture URL
   */
  getProfilePictureUrl: (path: string): string => {
    return getPublicUrl(STORAGE_CONFIGS.PROFILE_PICTURES.bucket, path);
  },

  /**
   * Get banner URL
   */
  getBannerUrl: (path: string): string => {
    return getPublicUrl(STORAGE_CONFIGS.BANNERS.bucket, path);
  },

  /**
   * Get document URL
   */
  getDocumentUrl: (path: string): string => {
    return getPublicUrl(STORAGE_CONFIGS.DOCUMENTS.bucket, path);
  }
};

export default storageService;
