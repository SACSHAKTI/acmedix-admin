import { supabase } from './supabase';
import { BlogPost, BlogCategory } from './blogService';

// Extended BlogPost interface for admin operations
export interface AdminBlogPost extends BlogPost {
  // Add any additional admin-specific fields here
}

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category_id: number;
  author_id: number;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  read_time: number;
  meta_title?: string;
  meta_description?: string;
  published_at?: string;
}

// Fetch all blog posts (including drafts) for admin
export async function fetchAllBlogPosts(): Promise<AdminBlogPost[]> {
  try {
    const { data, error } = await supabase
      .from('blog_posts_with_details')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all blog posts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching all blog posts:', error);
    return [];
  }
}

// Create new blog post
export async function createBlogPost(postData: BlogFormData): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([postData])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error('Unexpected error creating blog post:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Update existing blog post
export async function updateBlogPost(id: number, postData: Partial<BlogFormData>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .update(postData)
      .eq('id', id);

    if (error) {
      console.error('Error updating blog post:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating blog post:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Delete blog post
export async function deleteBlogPost(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog post:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting blog post:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get blog post by ID for editing
export async function getBlogPostById(id: number): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase
      .from('blog_posts_with_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching blog post by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching blog post by ID:', error);
    return null;
  }
}

// Fetch all categories for dropdowns
export async function fetchAllCategories(): Promise<BlogCategory[]> {
  try {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching categories:', error);
    return [];
  }
}

// Fetch all authors for dropdowns
export async function fetchAllAuthors(): Promise<{ id: number; name: string; email?: string }[]> {
  try {
    const { data, error } = await supabase
      .from('blog_authors')
      .select('id, name, email')
      .order('name');

    if (error) {
      console.error('Error fetching authors:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching authors:', error);
    return [];
  }
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Update blog post status
export async function updateBlogStatus(id: number, status: 'draft' | 'published' | 'archived'): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = { status };
    
    // Set published_at when publishing
    if (status === 'published') {
      updateData.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating blog status:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating blog status:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Bulk operations
export async function bulkUpdateStatus(ids: number[], status: 'draft' | 'published' | 'archived'): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = { status };
    
    if (status === 'published') {
      updateData.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .in('id', ids);

    if (error) {
      console.error('Error bulk updating blog status:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error bulk updating blog status:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get blog statistics
export async function getBlogStats(): Promise<{
  total: number;
  published: number;
  draft: number;
  archived: number;
}> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('status');

    if (error) {
      console.error('Error fetching blog stats:', error);
      return { total: 0, published: 0, draft: 0, archived: 0 };
    }

    const stats = data.reduce((acc, post) => {
      acc.total++;
      if (post.status === 'published') acc.published++;
      else if (post.status === 'draft') acc.draft++;
      else if (post.status === 'archived') acc.archived++;
      return acc;
    }, { total: 0, published: 0, draft: 0, archived: 0 });

    return stats;
  } catch (error) {
    console.error('Unexpected error fetching blog stats:', error);
    return { total: 0, published: 0, draft: 0, archived: 0 };
  }
}