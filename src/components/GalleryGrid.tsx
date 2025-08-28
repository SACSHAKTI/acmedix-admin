/**
 * Gallery Grid Component
 * Displays Life at Acmedix gallery images in a responsive grid layout
 */

import React, { useState } from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Move,
  Calendar,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { LifeAtAcmedixGalleryItem } from '@/lib/galleryService';

interface GalleryGridProps {
  items: LifeAtAcmedixGalleryItem[];
  loading?: boolean;
  onEdit?: (item: LifeAtAcmedixGalleryItem) => void;
  onDelete?: (id: number) => void;
  onToggleStatus?: (id: number, isActive: boolean) => void;
  onReorder?: (items: LifeAtAcmedixGalleryItem[]) => void;
  showAdminControls?: boolean;
}

interface ImageModalProps {
  item: LifeAtAcmedixGalleryItem | null;
  onClose: () => void;
}

// Image preview modal component
const ImageModal: React.FC<ImageModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              {item.description && (
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              )}
            </div>
            <Button onClick={onClose} variant="outline" size="sm">
              ×
            </Button>
          </div>
        </div>
        <div className="p-4">
          <img
            src={item.image_url}
            alt={item.alt_text}
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
          />
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {item.created_at && new Date(item.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <Badge variant={item.is_active ? "default" : "secondary"}>
              {item.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

const GalleryGrid: React.FC<GalleryGridProps> = ({
  items,
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  onReorder,
  showAdminControls = false
}) => {
  const [selectedImage, setSelectedImage] = useState<LifeAtAcmedixGalleryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<LifeAtAcmedixGalleryItem | null>(null);

  // Handle drag and drop for reordering
  const handleDragStart = (e: React.DragEvent, item: LifeAtAcmedixGalleryItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetItem: LifeAtAcmedixGalleryItem) => {
    e.preventDefault();
    
    if (!draggedItem || !onReorder || draggedItem.id === targetItem.id) {
      setDraggedItem(null);
      return;
    }

    const reorderedItems = [...items];
    const draggedIndex = reorderedItems.findIndex(item => item.id === draggedItem.id);
    const targetIndex = reorderedItems.findIndex(item => item.id === targetItem.id);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remove dragged item
      const [removed] = reorderedItems.splice(draggedIndex, 1);
      
      // Insert at target position
      reorderedItems.splice(targetIndex, 0, removed);
      
      // Update display_order for all items
      const updatedItems = reorderedItems.map((item, index) => ({
        ...item,
        display_order: index + 1
      }));

      onReorder(updatedItems);
    }

    setDraggedItem(null);
  };

  const handleDeleteConfirm = (id: number) => {
    if (onDelete) {
      onDelete(id);
    }
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No images found</h3>
        <p className="text-gray-500">Start by adding some images to your gallery.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <Card
            key={item.id}
            className={`overflow-hidden group hover:shadow-lg transition-shadow duration-200 ${
              showAdminControls && onReorder ? 'cursor-move' : ''
            } ${!item.is_active ? 'opacity-60' : ''}`}
            draggable={showAdminControls && onReorder}
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, item)}
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={item.image_url}
                alt={item.alt_text}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
              
              {showAdminControls && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => setSelectedImage(item)}
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {onEdit && (
                    <Button
                      onClick={() => onEdit(item)}
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {showAdminControls && onReorder && (
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 rounded p-1">
                    <Move className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
              )}

              {!item.is_active && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Badge variant="secondary" className="bg-white text-gray-700">
                    Inactive
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 line-clamp-2 flex-1">
                  {item.title}
                </h3>
                {showAdminControls && (
                  <div className="flex items-center ml-2 text-xs text-gray-500">
                    #{item.display_order}
                  </div>
                )}
              </div>

              {item.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {item.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {item.created_at && new Date(item.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>

                {showAdminControls && (
                  <div className="flex gap-1">
                    {onToggleStatus && (
                      <Button
                        onClick={() => onToggleStatus(item.id!, !item.is_active)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        title={item.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {item.is_active ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        onClick={() => setDeleteConfirm(item.id!)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image Preview Modal */}
      <ImageModal
        item={selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Gallery Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this gallery item? This action cannot be undone.
              The item will be permanently removed from the gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteConfirm(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GalleryGrid;