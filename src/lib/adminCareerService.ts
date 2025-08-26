import { supabase } from './supabase';
import { CareerPosition } from './careersService';

export interface CareerPositionFormData {
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
}

// Fetch all career positions (including closed ones) for admin
export async function fetchAllCareerPositions(): Promise<CareerPosition[]> {
  try {
    const { data, error } = await supabase
      .from('career_positions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all career positions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching all career positions:', error);
    return [];
  }
}

// Create new career position
export async function createCareerPosition(positionData: CareerPositionFormData): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    const { data, error } = await supabase
      .from('career_positions')
      .insert([positionData])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating career position:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error('Unexpected error creating career position:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Update existing career position
export async function updateCareerPosition(id: number, positionData: Partial<CareerPositionFormData>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('career_positions')
      .update(positionData)
      .eq('id', id);

    if (error) {
      console.error('Error updating career position:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating career position:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Delete career position
export async function deleteCareerPosition(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('career_positions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting career position:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting career position:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get career position by ID for editing
export async function getCareerPositionById(id: number): Promise<CareerPosition | null> {
  try {
    const { data, error } = await supabase
      .from('career_positions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching career position by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching career position by ID:', error);
    return null;
  }
}

// Update position status
export async function updatePositionStatus(id: number, status: 'open' | 'closed' | 'filled'): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('career_positions')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating position status:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating position status:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Bulk operations
export async function bulkUpdatePositionStatus(ids: number[], status: 'open' | 'closed' | 'filled'): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('career_positions')
      .update({ status })
      .in('id', ids);

    if (error) {
      console.error('Error bulk updating position status:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error bulk updating position status:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get career position statistics
export async function getCareerStats(): Promise<{
  total: number;
  open: number;
  closed: number;
  filled: number;
  departments: number;
}> {
  try {
    const { data, error } = await supabase
      .from('career_positions')
      .select('status, department');

    if (error) {
      console.error('Error fetching career stats:', error);
      return { total: 0, open: 0, closed: 0, filled: 0, departments: 0 };
    }

    const stats = data.reduce((acc, position) => {
      acc.total++;
      if (position.status === 'open') acc.open++;
      else if (position.status === 'closed') acc.closed++;
      else if (position.status === 'filled') acc.filled++;
      return acc;
    }, { total: 0, open: 0, closed: 0, filled: 0, departments: 0 });

    // Count unique departments
    const uniqueDepartments = new Set(data.map(p => p.department));
    stats.departments = uniqueDepartments.size;

    return stats;
  } catch (error) {
    console.error('Unexpected error fetching career stats:', error);
    return { total: 0, open: 0, closed: 0, filled: 0, departments: 0 };
  }
}

// Get applications count for each position
export async function getPositionsWithApplications(): Promise<CareerPosition[]> {
  try {
    const { data, error } = await supabase
      .from('career_positions')
      .select(`
        *,
        applications:career_applications(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching positions with applications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching positions with applications:', error);
    return [];
  }
}