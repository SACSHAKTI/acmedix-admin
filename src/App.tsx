import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminBlogManagement from './pages/AdminBlogManagement';
import AdminBlogForm from './pages/AdminBlogForm';
import AdminCareerManagement from './pages/AdminCareerManagement';
import AdminCareerForm from './pages/AdminCareerForm';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Redirect root to admin login */}
            <Route path="/" element={<Navigate to="/admin/login" replace />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/blog" element={<AdminBlogManagement />} />
            <Route path="/admin/blog/create" element={<AdminBlogForm />} />
            <Route path="/admin/blog/edit/:id" element={<AdminBlogForm />} />
            <Route path="/admin/career" element={<AdminCareerManagement />} />
            <Route path="/admin/career/create" element={<AdminCareerForm />} />
            <Route path="/admin/career/edit/:id" element={<AdminCareerForm />} />
            
            {/* Catch all - redirect to admin login */}
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            expand={true}
            richColors
            closeButton
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;