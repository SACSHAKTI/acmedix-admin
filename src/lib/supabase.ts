import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://reizphewyhtrezuxzwuf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlaXpwaGV3eWh0cmV6dXh6d3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MDk4NzEsImV4cCI6MjA1NjI4NTg3MX0.Ncl5y5N9Z_IDAnoa1H2ORMyPI5XdP7IZ3Qbrj_9XHVg';

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