import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  Mail, 
  Phone, 
  Briefcase, 
  LogOut,
  Shield,
  Search,
  Filter,
  BookOpen,
  PenTool,
  UserCheck,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminLogout, getCurrentAdminUser, verifyAdminSession } from '@/lib/adminAuth';
import { supabase } from '@/lib/supabase';
import { getResumeDownloadUrl } from '@/lib/careersService';

interface CareerApplication {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position_applied: string;
  cover_letter?: string;
  resume_file_name?: string;
  resume_file_path?: string;
  resume_file_size?: number;
  application_status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<CareerApplication | null>(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const adminUser = getCurrentAdminUser();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await verifyAdminSession();
      if (!isValid) {
        navigate('/admin/login');
        return;
      }
      loadApplications();
    };
    checkAuth();
  }, [navigate]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('career_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading applications:', error);
      } else {
        setApplications(data || []);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const handleDownloadResume = async (application: CareerApplication) => {
    if (!application.resume_file_path) return;
    
    try {
      const downloadUrl = await getResumeDownloadUrl(application.resume_file_path);
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      } else {
        alert('Unable to download resume');
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Error downloading resume');
    }
  };

  const handleViewResume = async (application: CareerApplication) => {
    if (!application.resume_file_path) return;
    
    try {
      const downloadUrl = await getResumeDownloadUrl(application.resume_file_path);
      if (downloadUrl) {
        setPdfUrl(downloadUrl);
        setShowPDFModal(true);
      } else {
        alert('Unable to view resume');
      }
    } catch (error) {
      console.error('Error viewing resume:', error);
      alert('Error viewing resume');
    }
  };

  const updateApplicationStatus = async (applicationId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('career_applications')
        .update({ application_status: newStatus })
        .eq('id', applicationId);

      if (error) {
        console.error('Error updating status:', error);
        alert('Error updating status');
      } else {
        // Refresh applications
        loadApplications();
        alert('Status updated successfully');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = (
      app.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position_applied.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = statusFilter === 'all' || app.application_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'interviewed': return 'bg-purple-100 text-purple-800';
      case 'selected': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-primary mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-sm text-gray-500">Acmedix Pharma</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{adminUser?.username}</span>
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Button
            onClick={() => navigate('/admin/blog')}
            className="h-20 bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center justify-center"
          >
            <BookOpen className="h-6 w-6 mb-1" />
            <span className="font-semibold text-sm">Manage Blogs</span>
          </Button>
          
          <Button
            onClick={() => navigate('/admin/blog/create')}
            className="h-20 bg-green-600 hover:bg-green-700 text-white flex flex-col items-center justify-center"
          >
            <PenTool className="h-6 w-6 mb-1" />
            <span className="font-semibold text-sm">Create Blog</span>
          </Button>
          
          <Button
            onClick={() => navigate('/admin/career')}
            className="h-20 bg-purple-600 hover:bg-purple-700 text-white flex flex-col items-center justify-center"
          >
            <UserCheck className="h-6 w-6 mb-1" />
            <span className="font-semibold text-sm">Career Positions</span>
          </Button>
          
          <Button
            onClick={() => navigate('/admin/career/create')}
            className="h-20 bg-orange-600 hover:bg-orange-700 text-white flex flex-col items-center justify-center"
          >
            <Plus className="h-6 w-6 mb-1" />
            <span className="font-semibold text-sm">Add Position</span>
          </Button>
          
          <Button
            onClick={() => window.open('/blog', '_blank')}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center"
          >
            <Eye className="h-6 w-6 mb-1" />
            <span className="font-semibold text-sm">View Website</span>
          </Button>
          
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center"
          >
            <Users className="h-6 w-6 mb-1" />
            <span className="font-semibold text-sm">Refresh Data</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.application_status === 'reviewing').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.application_status === 'shortlisted').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Selected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.application_status === 'selected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="reviewing">Reviewing</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interviewed">Interviewed</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.first_name} {application.last_name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {application.email}
                          </div>
                          {application.phone && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {application.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.position_applied}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={application.application_status}
                        onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(application.application_status)}`}
                      >
                        <option value="submitted">Submitted</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interviewed">Interviewed</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.resume_file_name ? (
                        <div>
                          <div className="text-sm font-medium">{application.resume_file_name}</div>
                          <div className="text-xs text-gray-400">{formatFileSize(application.resume_file_size)}</div>
                        </div>
                      ) : (
                        'No resume'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        onClick={() => setSelectedApplication(application)}
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {application.resume_file_path && (
                        <>
                          <Button
                            onClick={() => handleViewResume(application)}
                            size="sm"
                            variant="outline"
                            className="mr-2"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View PDF
                          </Button>
                          <Button
                            onClick={() => handleDownloadResume(application)}
                            size="sm"
                            variant="outline"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No applications found</p>
            </div>
          )}
        </div>

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedApplication.first_name} {selectedApplication.last_name}
                    </h2>
                    <p className="text-gray-600">{selectedApplication.position_applied}</p>
                  </div>
                  <Button
                    onClick={() => setSelectedApplication(null)}
                    variant="outline"
                    size="sm"
                  >
                    ×
                  </Button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><Mail className="h-4 w-4 inline mr-2" />{selectedApplication.email}</p>
                    {selectedApplication.phone && (
                      <p><Phone className="h-4 w-4 inline mr-2" />{selectedApplication.phone}</p>
                    )}
                  </div>
                </div>
                
                {selectedApplication.cover_letter && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Cover Letter</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedApplication.cover_letter}
                      </p>
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Application Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Application ID</p>
                      <p className="font-medium">#{selectedApplication.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedApplication.application_status)}`}>
                        {selectedApplication.application_status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600">Applied Date</p>
                      <p className="font-medium">
                        {new Date(selectedApplication.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Resume File</p>
                      <p className="font-medium">
                        {selectedApplication.resume_file_name || 'No file uploaded'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {selectedApplication.resume_file_path && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewResume(selectedApplication)}
                      variant="outline"
                      className="flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View PDF
                    </Button>
                    <Button
                      onClick={() => handleDownloadResume(selectedApplication)}
                      className="flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer Modal */}
        {showPDFModal && pdfUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Resume Viewer</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.open(pdfUrl, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => {
                      setShowPDFModal(false);
                      setPdfUrl(null);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    ×
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 p-4">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border rounded-lg"
                  title="Resume PDF Viewer"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;