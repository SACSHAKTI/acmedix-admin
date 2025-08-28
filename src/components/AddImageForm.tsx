/**
 * Add Image Form Component
 * Form for uploading new images to the Life at Acmedix gallery
 */

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  uploadImageToImgBB, 
  validateImageFile, 
  formatFileSize 
} from '@/lib/imgbbService';
import { createGalleryItem, GalleryCreateData } from '@/lib/galleryService';

interface AddImageFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isOpen?: boolean;
}


interface UploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  uploadProgress: number;
  error: string | null;
  success: boolean;
}

const AddImageForm: React.FC<AddImageFormProps> = ({
  onSuccess,
  onCancel,
  isOpen = false
}) => {

  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    preview: null,
    uploading: false,
    uploadProgress: 0,
    error: null,
    success: false
  });

  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadState(prev => ({
        ...prev,
        error: validation.error || 'Invalid file',
        file: null,
        preview: null
      }));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadState(prev => ({
        ...prev,
        file,
        preview: e.target?.result as string,
        error: null
      }));

    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Create a mock event for handleFileSelect
      const mockEvent = {
        target: { files: [file] }
      } as React.ChangeEvent<HTMLInputElement>;
      
      handleFileSelect(mockEvent);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setUploadState({
      file: null,
      preview: null,
      uploading: false,
      uploadProgress: 0,
      error: null,
      success: false
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  // Validate form
  const validateForm = (): boolean => {
    if (!uploadState.file) {
      setFormError('Please select an image file');
      return false;
    }
    return true;
  };

  // Generate random mock data
  const generateMockData = () => {
    const titles = [
      'Team Collaboration Excellence',
      'Innovation in Action',
      'Professional Growth Journey',
      'Workplace Excellence',
      'Success Achievement Moment',
      'Dynamic Team Environment',
      'Creative Problem Solving',
      'Leadership in Progress',
      'Quality Excellence Focus',
      'Collaborative Success Story'
    ];
    
    const descriptions = [
      'Our team demonstrates exceptional collaboration and teamwork in achieving pharmaceutical excellence.',
      'Innovation drives our commitment to developing cutting-edge healthcare solutions.',
      'Professional development and growth opportunities empower our talented workforce.',
      'Excellence in workplace culture fosters creativity and productivity.',
      'Celebrating milestone achievements and recognizing outstanding performance.',
      'Dynamic work environment that encourages creativity and innovation.',
      'Problem-solving approach that delivers exceptional results for our clients.',
      'Leadership development initiatives that inspire and motivate our teams.',
      'Quality-focused processes ensure the highest standards in pharmaceutical services.',
      'Collaborative success stories that showcase our team\'s dedication and expertise.'
    ];

    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    return {
      title: randomTitle,
      description: randomDescription,
      alt_text: randomTitle
    };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setUploadState(prev => ({ ...prev, uploading: true, uploadProgress: 0 }));
    
    try {
      // Step 1: Upload image to ImgBB
      setUploadState(prev => ({ ...prev, uploadProgress: 30 }));
      
      const uploadResult = await uploadImageToImgBB(uploadState.file!);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload image');
      }

      setUploadState(prev => ({ ...prev, uploadProgress: 70 }));

      // Step 2: Generate mock data and save to Supabase
      const mockData = generateMockData();
      const galleryData: GalleryCreateData = {
        title: mockData.title,
        description: mockData.description,
        image_url: uploadResult.url!,
        alt_text: mockData.alt_text
      };

      const createResult = await createGalleryItem(galleryData);
      
      if (!createResult.success) {
        throw new Error(createResult.error || 'Failed to save gallery item');
      }

      setUploadState(prev => ({ 
        ...prev, 
        uploadProgress: 100, 
        success: true, 
        uploading: false 
      }));

      // Reset form after successful upload
      setTimeout(() => {
        resetForm();
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);

    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        uploadProgress: 0,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }));
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setUploadState({
      file: null,
      preview: null,
      uploading: false,
      uploadProgress: 0,
      error: null,
      success: false
    });
    setFormError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle cancel
  const handleCancel = () => {
    resetForm();
    if (onCancel) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Add New Image
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div className="space-y-2">
              <Label>Image File *</Label>
              
              {!uploadState.preview ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    Drop your image here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supports PNG, JPEG, GIF up to 32MB
                  </p>
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Select Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={uploadState.preview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      type="button"
                      onClick={handleRemoveFile}
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {uploadState.file?.name} ({formatFileSize(uploadState.file?.size || 0)})
                  </div>
                </div>
              )}
            </div>




            {/* Upload Progress */}
            {uploadState.uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uploading...</span>
                  <span className="text-sm text-gray-500">{uploadState.uploadProgress}%</span>
                </div>
                <Progress value={uploadState.uploadProgress} className="w-full" />
              </div>
            )}

            {/* Success Message */}
            {uploadState.success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Image uploaded successfully! The gallery will be updated shortly.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Messages */}
            {(uploadState.error || formError) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {uploadState.error || formError}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={uploadState.uploading || !uploadState.file || uploadState.success}
              >
                {uploadState.uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddImageForm;