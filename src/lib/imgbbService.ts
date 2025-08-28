/**
 * ImgBB API Service for uploading images
 * Used for uploading Life at Acmedix gallery images
 */

const IMGBB_API_KEY = '587745490bcdd448ecf18b947191d0a4';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export interface ImgBBUploadResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: string;
    height: string;
    size: string;
    time: string;
    expiration: string;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  data?: ImgBBUploadResponse['data'];
}

/**
 * Upload an image file to ImgBB
 * @param file - The image file to upload
 * @returns Promise with upload result containing URL or error
 */
export const uploadImageToImgBB = async (file: File): Promise<UploadResult> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Please select a valid image file (PNG, JPEG, GIF, etc.)'
      };
    }

    // Validate file size (max 32MB as per ImgBB limits)
    const maxSize = 32 * 1024 * 1024; // 32MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Image size must be less than 32MB'
      };
    }

    // Convert file to base64
    const base64String = await fileToBase64(file);

    // Prepare form data
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64String);
    formData.append('name', file.name);

    // Upload to ImgBB
    const response = await fetch(IMGBB_API_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ImgBBUploadResponse = await response.json();

    if (result.success && result.data) {
      return {
        success: true,
        url: result.data.url,
        data: result.data
      };
    } else {
      return {
        success: false,
        error: 'Failed to upload image to ImgBB'
      };
    }

  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred during upload'
    };
  }
};

/**
 * Convert file to base64 string
 * @param file - The file to convert
 * @returns Promise resolving to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove data:image/jpeg;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Validate image file
 * @param file - The file to validate
 * @returns Validation result with boolean and error message
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Please select a valid image file (PNG, JPEG, GIF, etc.)'
    };
  }

  // Check file size (max 32MB)
  const maxSize = 32 * 1024 * 1024; // 32MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 32MB'
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'The selected file appears to be empty'
    };
  }

  return { valid: true };
};

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};