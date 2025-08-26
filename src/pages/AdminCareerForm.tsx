import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save,
  ArrowLeft,
  Briefcase,
  MapPin,
  Building,
  DollarSign,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyAdminSession } from '@/lib/adminAuth';
import { 
  createCareerPosition,
  updateCareerPosition,
  getCareerPositionById,
  CareerPositionFormData
} from '@/lib/adminCareerService';

const AdminCareerForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [formData, setFormData] = useState<CareerPositionFormData>({
    title: '',
    department: '',
    location: '',
    employment_type: 'Full-time',
    status: 'open',
    description: '',
    requirements: '',
    responsibilities: '',
    salary_range: '',
    experience_required: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const departmentOptions = [
    'Quality Assurance',
    'Sales & Marketing',
    'Research & Development',
    'Manufacturing',
    'Regulatory Affairs',
    'Business Development',
    'Information Technology',
    'Human Resources',
    'Finance & Accounts',
    'International Business'
  ];

  const locationOptions = [
    'Mumbai, India',
    'Delhi, India',
    'Bangalore, India',
    'Chennai, India',
    'Pune, India',
    'Ahmedabad, India',
    'Hyderabad, India',
    'Gurgaon, India'
  ];

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const isValid = await verifyAdminSession();
    if (!isValid) {
      navigate('/admin/login');
      return;
    }
    await loadFormData();
  };

  const loadFormData = async () => {
    setLoading(true);
    try {
      if (isEdit && id) {
        const position = await getCareerPositionById(parseInt(id));
        if (position) {
          setFormData({
            title: position.title,
            department: position.department,
            location: position.location,
            employment_type: position.employment_type,
            status: position.status as 'open' | 'closed' | 'filled',
            description: position.description,
            requirements: position.requirements,
            responsibilities: position.responsibilities,
            salary_range: position.salary_range,
            experience_required: position.experience_required
          });
        }
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.requirements.trim()) newErrors.requirements = 'Requirements are required';
    if (!formData.responsibilities.trim()) newErrors.responsibilities = 'Responsibilities are required';
    if (!formData.salary_range.trim()) newErrors.salary_range = 'Salary range is required';
    if (!formData.experience_required.trim()) newErrors.experience_required = 'Experience requirement is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setSaveStatus('idle');

    try {
      let result;
      if (isEdit && id) {
        result = await updateCareerPosition(parseInt(id), formData);
      } else {
        result = await createCareerPosition(formData);
      }

      if (result.success) {
        setSaveStatus('success');
        setTimeout(() => {
          navigate('/admin/career');
        }, 1500);
      } else {
        setSaveStatus('error');
        console.error('Save error:', result.error);
      }
    } catch (error) {
      setSaveStatus('error');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading career position editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/admin/career')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Positions
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEdit ? 'Edit Career Position' : 'Create New Career Position'}
                </h1>
                <p className="text-sm text-gray-500">
                  {isEdit ? 'Update the career position details' : 'Add a new job opening to your careers page'}
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary-hover text-white"
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Position'}
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Save Status */}
        {saveStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            saveStatus === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {saveStatus === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {saveStatus === 'success' ? 'Career position saved successfully! Redirecting...' : 'Error saving career position. Please try again.'}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Senior Software Engineer"
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.department ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Department</option>
                      {departmentOptions.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.department && <p className="text-red-600 text-sm mt-1">{errors.department}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.location ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Location</option>
                      {locationOptions.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employment Type
                    </label>
                    <select
                      name="employment_type"
                      value={formData.employment_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Required *
                    </label>
                    <input
                      type="text"
                      name="experience_required"
                      value={formData.experience_required}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.experience_required ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 3-5 years"
                    />
                    {errors.experience_required && <p className="text-red-600 text-sm mt-1">{errors.experience_required}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range *
                  </label>
                  <input
                    type="text"
                    name="salary_range"
                    value={formData.salary_range}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.salary_range ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., ₹8-12 LPA"
                  />
                  {errors.salary_range && <p className="text-red-600 text-sm mt-1">{errors.salary_range}</p>}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Job Description
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe the role, company overview, and what the position entails..."
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Requirements
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements *
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={8}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.requirements ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="List the required qualifications, skills, education, etc. (one per line or bullet points)"
                />
                {errors.requirements && <p className="text-red-600 text-sm mt-1">{errors.requirements}</p>}
              </div>
            </div>

            {/* Responsibilities */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Responsibilities
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Responsibilities *
                </label>
                <textarea
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleInputChange}
                  rows={8}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.responsibilities ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="List the main duties and responsibilities for this role (one per line or bullet points)"
                />
                {errors.responsibilities && <p className="text-red-600 text-sm mt-1">{errors.responsibilities}</p>}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Position Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Status</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="open">Open - Accepting Applications</option>
                    <option value="closed">Closed - Not Accepting Applications</option>
                    <option value="filled">Filled - Position Filled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Summary</h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Briefcase className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Title:</span>
                  <span className="ml-2 font-medium">{formData.title || 'Not set'}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Building className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Department:</span>
                  <span className="ml-2 font-medium">{formData.department || 'Not set'}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Location:</span>
                  <span className="ml-2 font-medium">{formData.location || 'Not set'}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Salary:</span>
                  <span className="ml-2 font-medium">{formData.salary_range || 'Not set'}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Experience:</span>
                  <span className="ml-2 font-medium">{formData.experience_required || 'Not set'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
              <div className="space-y-3">
                <Button
                  onClick={handleSave}
                  className="w-full bg-primary hover:bg-primary-hover text-white"
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : (isEdit ? 'Update Position' : 'Create Position')}
                </Button>
                
                <Button
                  onClick={() => navigate('/admin/career')}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCareerForm;