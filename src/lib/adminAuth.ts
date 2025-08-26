import { supabase } from './supabase';

// Types for admin authentication
export interface AdminUser {
  id: number;
  username: string;
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  loading: boolean;
}

// Admin login function
export async function adminLogin(username: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Store admin session in localStorage
    localStorage.setItem('adminUser', JSON.stringify(data));
    localStorage.setItem('adminAuth', 'true');

    return { success: true, user: data };
  } catch (error) {
    console.error('Admin login error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

// Admin logout function
export function adminLogout(): void {
  localStorage.removeItem('adminUser');
  localStorage.removeItem('adminAuth');
}

// Check if admin is authenticated
export function isAdminAuthenticated(): boolean {
  return localStorage.getItem('adminAuth') === 'true';
}

// Get current admin user
export function getCurrentAdminUser(): AdminUser | null {
  const userStr = localStorage.getItem('adminUser');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// Verify admin session (call this on protected routes)
export async function verifyAdminSession(): Promise<boolean> {
  const isAuth = isAdminAuthenticated();
  const user = getCurrentAdminUser();
  
  if (!isAuth || !user) {
    adminLogout();
    return false;
  }

  // Optional: Verify user still exists in database
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      adminLogout();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Session verification error:', error);
    adminLogout();
    return false;
  }
}