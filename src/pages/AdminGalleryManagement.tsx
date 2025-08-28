/**
 * Admin Gallery Management Page
 * Comprehensive management interface for Life at Acmedix gallery
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Grid,
  List,
  SortAsc,
  SortDesc,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { verifyAdminSession } from '@/lib/adminAuth';
import { 
  fetchAllGalleryItems, 
  deleteGalleryItem, 
  toggleGalleryItemStatus,
  reorderGalleryItems,
  LifeAtAcmedixGalleryItem 
} from '@/lib/galleryService';
import GalleryGrid from '@/components/GalleryGrid';
import AddImageForm from '@/components/AddImageForm';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'active' | 'inactive';
type SortField = 'created_at' | 'title' | 'display_order';
type SortDirection = 'asc' | 'desc';

const AdminGalleryManagement: React.FC = () => {
  const navigate = useNavigate();
  const [galleryItems, setGalleryItems] = useState<LifeAtAcmedixGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('display_order');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await verifyAdminSession();
      if (!isValid) {
        navigate('/admin/login');
        return;
      }
      loadGalleryItems();
    };
    checkAuth();
  }, [navigate]);

  // Load gallery items from Supabase
  const loadGalleryItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchAllGalleryItems();
      
      if (result.success && result.data) {
        setGalleryItems(result.data);
        
        // Calculate stats
        const total = result.data.length;
        const active = result.data.filter(item => item.is_active).length;
        const inactive = total - active;
        
        setStats({ total, active, inactive });
      } else {
        setError(result.error || 'Failed to load gallery items');
        toast.error('Failed to load gallery items');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle successful image addition
  const handleAddSuccess = () => {
    setShowAddForm(false);
    loadGalleryItems();
    toast.success('Image added successfully!');
  };

  // Handle item deletion
  const handleDelete = async (id: number) => {
    try {
      const result = await deleteGalleryItem(id);
      
      if (result.success) {
        loadGalleryItems();
        toast.success('Gallery item deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete gallery item');
      }
    } catch (error) {
      toast.error('An unexpected error occurred while deleting');
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      const result = await toggleGalleryItemStatus(id, isActive);
      
      if (result.success) {
        loadGalleryItems();
        toast.success(`Gallery item ${isActive ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(result.error || 'Failed to update gallery item status');
      }
    } catch (error) {
      toast.error('An unexpected error occurred while updating status');
    }
  };

  // Handle reordering
  const handleReorder = async (reorderedItems: LifeAtAcmedixGalleryItem[]) => {
    try {
      const itemOrders = reorderedItems.map(item => ({
        id: item.id!,
        display_order: item.display_order
      }));

      const result = await reorderGalleryItems(itemOrders);
      
      if (result.success) {
        setGalleryItems(reorderedItems);
        toast.success('Gallery items reordered successfully');
      } else {
        toast.error(result.error || 'Failed to reorder gallery items');
      }
    } catch (error) {
      toast.error('An unexpected error occurred while reordering');
    }
  };

  // Filter and sort items
  const getFilteredAndSortedItems = (): LifeAtAcmedixGalleryItem[] => {
    let filtered = galleryItems.filter(item => {
      // Status filter
      if (filterStatus === 'active' && !item.is_active) return false;
      if (filterStatus === 'inactive' && item.is_active) return false;
      
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          item.title.toLowerCase().includes(search) ||
          item.description?.toLowerCase().includes(search) ||
          item.alt_text.toLowerCase().includes(search)
        );
      }
      
      return true;
    });

    // Sort items
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortField) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'created_at':
          aVal = new Date(a.created_at || 0).getTime();
          bVal = new Date(b.created_at || 0).getTime();
          break;
        case 'display_order':
        default:
          aVal = a.display_order;
          bVal = b.display_order;
          break;
      }

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  };

  const filteredItems = getFilteredAndSortedItems();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                onClick={() => navigate('/admin/dashboard')}
                variant="ghost"
                size="sm"
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center">
                <ImageIcon className="h-8 w-8 text-primary mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Life at Acmedix Gallery</h1>
                  <p className="text-sm text-gray-500">Manage gallery images and content</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowAddForm(true)}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
              <Button
                onClick={loadGalleryItems}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ImageIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Images</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <EyeOff className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search images by title, description, or alt text..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={(value: FilterStatus) => setFilterStatus(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Sort Field */}
              <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="display_order">Display Order</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="created_at">Created Date</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Sort Direction */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {sortDirection === 'asc' ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredItems.length} of {stats.total} images
            {searchTerm && (
              <span className="ml-1">
                matching "<span className="font-medium">{searchTerm}</span>"
              </span>
            )}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Gallery Grid */}
        <GalleryGrid
          items={filteredItems}
          loading={loading}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onReorder={handleReorder}
          showAdminControls={true}
        />
      </main>

      {/* Add Image Form Modal */}
      <AddImageForm
        isOpen={showAddForm}
        onSuccess={handleAddSuccess}
        onCancel={() => setShowAddForm(false)}
      />
    </div>
  );
};

export default AdminGalleryManagement;