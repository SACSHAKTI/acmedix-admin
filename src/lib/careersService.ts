import { supabase } from './supabase';

// Types for career data
export interface CareerApplication {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position_applied: string;
  cover_letter?: string;
  resume_file_name?: string;
  resume_file_path?: string;
  resume_file_size?: number;
  resume_file_type?: string;
  application_status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CareerPosition {
  id: number;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  status: 'open' | 'closed' | 'filled';
  description: string;
  requirements: string;
  responsibilities: string;
  salary_range: string;
  experience_required: string;
  created_at: string;
  updated_at: string;
}

// Fetch all open career positions
export async function fetchOpenPositions(): Promise<CareerPosition[]> {
  try {
    const { data, error } = await supabase
      .from('career_positions')
      .select('*')
      .eq('status', 'open')
      .order('department', { ascending: true })
      .order('title', { ascending: true });

    if (error) {
      console.error('Error fetching career positions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching career positions:', error);
    return [];
  }
}

// Fetch a single career position by ID
export async function fetchPositionById(id: number): Promise<CareerPosition | null> {
  try {
    const { data, error } = await supabase
      .from('career_positions')
      .select('*')
      .eq('id', id)
      .eq('status', 'open')
      .single();

    if (error) {
      console.error('Error fetching career position:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching career position:', error);
    return null;
  }
}

// Fetch positions by department
export async function fetchPositionsByDepartment(department: string): Promise<CareerPosition[]> {
  try {
    const { data, error } = await supabase
      .from('career_positions')
      .select('*')
      .eq('department', department)
      .eq('status', 'open')
      .order('title', { ascending: true });

    if (error) {
      console.error('Error fetching positions by department:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching positions by department:', error);
    return [];
  }
}

// Get list of all departments with open positions
export async function fetchDepartments(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('career_positions')
      .select('department')
      .eq('status', 'open');

    if (error) {
      console.error('Error fetching departments:', error);
      return [];
    }

    // Get unique departments
    const departments = [...new Set(data?.map(item => item.department) || [])];
    return departments.sort();
  } catch (error) {
    console.error('Unexpected error fetching departments:', error);
    return [];
  }
}

// Submit career application with resume upload
export async function submitCareerApplication(
  applicationData: CareerApplication,
  resumeFile?: File
): Promise<{ success: boolean; error?: string; applicationId?: number }> {
  try {
    let resumeFilePath = '';
    let resumeFileName = '';
    let resumeFileSize = 0;
    let resumeFileType = '';

    // Upload resume file if provided
    if (resumeFile) {
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, resumeFile, {
          contentType: resumeFile.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading resume:', uploadError);
        return { success: false, error: 'Failed to upload resume file' };
      }

      resumeFilePath = filePath;
      resumeFileName = resumeFile.name;
      resumeFileSize = resumeFile.size;
      resumeFileType = resumeFile.type;
    }

    // Insert application data
    const { data, error } = await supabase
      .from('career_applications')
      .insert([
        {
          ...applicationData,
          resume_file_name: resumeFileName || null,
          resume_file_path: resumeFilePath || null,
          resume_file_size: resumeFileSize || null,
          resume_file_type: resumeFileType || null,
        }
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Error submitting application:', error);
      return { success: false, error: error.message };
    }

    return { success: true, applicationId: data.id };
  } catch (error) {
    console.error('Unexpected error submitting application:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get signed URL for resume download (for HR use)
export async function getResumeDownloadUrl(filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('resumes')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Unexpected error creating signed URL:', error);
    return null;
  }
}