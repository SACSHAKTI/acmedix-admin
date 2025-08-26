import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save,
  Eye,
  ArrowLeft,
  Image,
  Calendar,
  User,
  Tag,
  Globe,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyAdminSession, getCurrentAdminUser } from '@/lib/adminAuth';
import { 
  createBlogPost,
  updateBlogPost,
  getBlogPostById,
  fetchAllCategories,
  fetchAllAuthors,
  generateSlug,
  BlogFormData
} from '@/lib/adminBlogService';

const AdminBlogForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const adminUser = getCurrentAdminUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category_id: 0,
    author_id: 0,
    status: 'draft',
    featured: false,
    read_time: 5,
    meta_title: '',
    meta_description: '',
    published_at: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

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
      const [categoriesData, authorsData] = await Promise.all([
        fetchAllCategories(),
        fetchAllAuthors()
      ]);

      setCategories(categoriesData);
      setAuthors(authorsData);

      if (isEdit && id) {
        const post = await getBlogPostById(parseInt(id));
        if (post) {
          setFormData({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            featured_image: post.featured_image,
            category_id: categoriesData.find(c => c.name === post.category_name)?.id || 0,
            author_id: authorsData.find(a => a.name === post.author_name)?.id || 0,
            status: post.status as 'draft' | 'published' | 'archived',
            featured: post.featured,
            read_time: post.read_time,
            meta_title: post.meta_title || '',
            meta_description: post.meta_description || '',
            published_at: post.published_at || ''
          });
        }
      } else {
        // Set default author for new posts
        if (authorsData.length > 0) {
          setFormData(prev => ({ ...prev, author_id: authorsData[0].id }));
        }
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate slug from title
    if (name === 'title') {
      const newSlug = generateSlug(value);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.featured_image.trim()) newErrors.featured_image = 'Featured image URL is required';
    if (formData.category_id === 0) newErrors.category_id = 'Category is required';
    if (formData.author_id === 0) newErrors.author_id = 'Author is required';
    if (formData.read_time < 1) newErrors.read_time = 'Read time must be at least 1 minute';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status?: 'draft' | 'published') => {
    if (!validateForm()) return;

    setSaving(true);
    setSaveStatus('idle');

    try {
      const submitData = {
        ...formData,
        status: status || formData.status,
        published_at: status === 'published' ? new Date().toISOString() : formData.published_at
      };

      let result;
      if (isEdit && id) {
        result = await updateBlogPost(parseInt(id), submitData);
      } else {
        result = await createBlogPost(submitData);
      }

      if (result.success) {
        setSaveStatus('success');
        setTimeout(() => {
          navigate('/admin/blog');
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
          <p className="text-gray-600">Loading blog editor...</p>
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
                onClick={() => navigate('/admin/blog')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog List
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEdit ? 'Edit Blog Post' : 'Create New Blog Post'}
                </h1>
                <p className="text-sm text-gray-500">
                  {isEdit ? 'Update your blog post' : 'Create a new blog post for your website'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {formData.slug && (
                <Button
                  onClick={() => window.open(`/blog/${formData.slug}`, '_blank')}
                  variant="outline"
                  size="sm"
                  disabled={!isEdit}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}
              
              <Button
                onClick={() => handleSave('draft')}
                variant="outline"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </Button>
              
              <Button
                onClick={() => handleSave('published')}
                className="bg-primary hover:bg-primary-hover text-white"
                disabled={saving}
              >
                <Globe className="h-4 w-4 mr-2" />
                {saving ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
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
            {saveStatus === 'success' ? 'Blog post saved successfully! Redirecting...' : 'Error saving blog post. Please try again.'}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter blog post title..."
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.slug ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="url-friendly-slug"
                  />
                  {errors.slug && <p className="text-red-600 text-sm mt-1">{errors.slug}</p>}
                  <p className="text-gray-500 text-sm mt-1">URL: /blog/{formData.slug}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt *
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.excerpt ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Brief description of the blog post..."
                  />
                  {errors.excerpt && <p className="text-red-600 text-sm mt-1">{errors.excerpt}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image URL *
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="url"
                      name="featured_image"
                      value={formData.featured_image}
                      onChange={handleInputChange}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.featured_image ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="https://images.unsplash.com/..."
                    />
                    {formData.featured_image && (
                      <img
                        src={formData.featured_image}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                  </div>
                  {errors.featured_image && <p className="text-red-600 text-sm mt-1">{errors.featured_image}</p>}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blog Content * (HTML supported)
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={20}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm ${
                    errors.content ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="<p>Write your blog content here using HTML...</p>"
                />
                {errors.content && <p className="text-red-600 text-sm mt-1">{errors.content}</p>}
                <p className="text-gray-500 text-sm mt-1">
                  You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, etc.
                </p>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="SEO optimized title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="SEO description for search engines..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Publish Settings</h3>
              
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
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured Post</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Read Time (minutes) *
                  </label>
                  <input
                    type="number"
                    name="read_time"
                    value={formData.read_time}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.read_time ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.read_time && <p className="text-red-600 text-sm mt-1">{errors.read_time}</p>}
                </div>
              </div>
            </div>

            {/* Category & Author */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category & Author</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.category_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value={0}>Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && <p className="text-red-600 text-sm mt-1">{errors.category_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author *
                  </label>
                  <select
                    name="author_id"
                    value={formData.author_id}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.author_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value={0}>Select Author</option>
                    {authors.map(author => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                  {errors.author_id && <p className="text-red-600 text-sm mt-1">{errors.author_id}</p>}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Button
                  onClick={() => handleSave('draft')}
                  variant="outline"
                  className="w-full"
                  disabled={saving}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                
                <Button
                  onClick={() => handleSave('published')}
                  className="w-full bg-primary hover:bg-primary-hover text-white"
                  disabled={saving}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Publish Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminBlogForm;