import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for the contact_submissions table
export interface ContactSubmission {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  submission_date?: string;
  status?: 'new' | 'read' | 'replied' | 'archived';
  source?: string;
}

// Type definitions for the life_at_acmedix_gallery table
export interface LifeAtAcmedixGallery {
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

// Function to submit contact form data
export async function submitContactForm(data: Omit<ContactSubmission, 'id' | 'submission_date' | 'status'>) {
  try {
    console.log('Submitting to Supabase:', data);
    
    const { data: result, error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone || null,
          company: data.company || null,
          subject: data.subject,
          message: data.message,
          source: 'website',
          status: 'new',
          submission_date: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      return { success: false, error: error.message };
    }

    console.log('Successfully submitted to Supabase:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}