/**
 * Life at Acmedix Gallery Service
 * Handles all gallery operations with Supabase database
 */

import { supabase } from './supabase';

// Type definitions for gallery items
export interface LifeAtAcmedixGalleryItem {
  id?: number;
  title: string;
  description?: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryCreateData {
  title: string;
  description?: string;
  image_url: string;
  alt_text: string;
  display_order?: number;
}

export interface GalleryUpdateData {
  title?: string;
  description?: string;
  alt_text?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface GalleryServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch all active gallery items ordered by display_order
 * @returns Promise with gallery items or error
 */
export const fetchGalleryItems = async (): Promise<GalleryServiceResponse<LifeAtAcmedixGalleryItem[]>> => {
  try {
    const { data, error } = await supabase
      .from('life_at_acmedix_gallery')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching gallery items:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Unexpected error fetching gallery items:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching gallery items'
    };
  }
};

/**
 * Fetch all gallery items (including inactive) for admin management
 * @returns Promise with all gallery items or error
 */
export const fetchAllGalleryItems = async (): Promise<GalleryServiceResponse<LifeAtAcmedixGalleryItem[]>> => {
  try {
    const { data, error } = await supabase
      .from('life_at_acmedix_gallery')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all gallery items:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Unexpected error fetching all gallery items:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching gallery items'
    };
  }
};

/**
 * Create a new gallery item
 * @param galleryData - The gallery item data to create
 * @returns Promise with created item or error
 */
export const createGalleryItem = async (galleryData: GalleryCreateData): Promise<GalleryServiceResponse<LifeAtAcmedixGalleryItem>> => {
  try {
    // Get the next display order if not provided
    let displayOrder = galleryData.display_order;
    if (displayOrder === undefined) {
      const { data: maxOrderResult } = await supabase
        .from('life_at_acmedix_gallery')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);
      
      displayOrder = (maxOrderResult && maxOrderResult[0]?.display_order ? maxOrderResult[0].display_order : 0) + 1;
    }

    const { data, error } = await supabase
      .from('life_at_acmedix_gallery')
      .insert([
        {
          title: galleryData.title,
          description: galleryData.description || null,
          image_url: galleryData.image_url,
          alt_text: galleryData.alt_text,
          display_order: displayOrder,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating gallery item:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Unexpected error creating gallery item:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while creating the gallery item'
    };
  }
};

/**
 * Update an existing gallery item
 * @param id - The ID of the item to update
 * @param updateData - The data to update
 * @returns Promise with updated item or error
 */
export const updateGalleryItem = async (id: number, updateData: GalleryUpdateData): Promise<GalleryServiceResponse<LifeAtAcmedixGalleryItem>> => {
  try {
    const { data, error } = await supabase
      .from('life_at_acmedix_gallery')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating gallery item:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Unexpected error updating gallery item:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating the gallery item'
    };
  }
};

/**
 * Delete a gallery item (soft delete by setting is_active to false)
 * @param id - The ID of the item to delete
 * @returns Promise with success status or error
 */
export const deleteGalleryItem = async (id: number): Promise<GalleryServiceResponse<boolean>> => {
  try {
    const { error } = await supabase
      .from('life_at_acmedix_gallery')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting gallery item:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error('Unexpected error deleting gallery item:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while deleting the gallery item'
    };
  }
};

/**
 * Permanently delete a gallery item from database
 * @param id - The ID of the item to permanently delete
 * @returns Promise with success status or error
 */
export const permanentlyDeleteGalleryItem = async (id: number): Promise<GalleryServiceResponse<boolean>> => {
  try {
    const { error } = await supabase
      .from('life_at_acmedix_gallery')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error permanently deleting gallery item:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error('Unexpected error permanently deleting gallery item:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while permanently deleting the gallery item'
    };
  }
};

/**
 * Reorder gallery items by updating display_order
 * @param itemOrders - Array of {id, display_order} objects
 * @returns Promise with success status or error
 */
export const reorderGalleryItems = async (itemOrders: { id: number; display_order: number }[]): Promise<GalleryServiceResponse<boolean>> => {
  try {
    // Update each item's display_order
    const updatePromises = itemOrders.map(item =>
      supabase
        .from('life_at_acmedix_gallery')
        .update({
          display_order: item.display_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
    );

    const results = await Promise.all(updatePromises);

    // Check if any update failed
    const hasError = results.some(result => result.error);
    if (hasError) {
      const errors = results.filter(result => result.error).map(result => result.error?.message);
      console.error('Error reordering gallery items:', errors);
      return {
        success: false,
        error: `Failed to reorder some items: ${errors.join(', ')}`
      };
    }

    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error('Unexpected error reordering gallery items:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while reordering gallery items'
    };
  }
};

/**
 * Toggle active status of a gallery item
 * @param id - The ID of the item to toggle
 * @param isActive - New active status
 * @returns Promise with updated item or error
 */
export const toggleGalleryItemStatus = async (id: number, isActive: boolean): Promise<GalleryServiceResponse<LifeAtAcmedixGalleryItem>> => {
  return updateGalleryItem(id, { is_active: isActive });
};

/**
 * Get gallery item by ID
 * @param id - The ID of the item to fetch
 * @returns Promise with gallery item or error
 */
export const getGalleryItemById = async (id: number): Promise<GalleryServiceResponse<LifeAtAcmedixGalleryItem>> => {
  try {
    const { data, error } = await supabase
      .from('life_at_acmedix_gallery')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching gallery item by ID:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Unexpected error fetching gallery item by ID:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching the gallery item'
    };
  }
};