import { useState } from 'react';
import { X, Upload, Trash2, FolderPlus, Edit2, Tag } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Category {
  id: number;
  name: string;
  order_position: number;
  video_count?: number;
}

interface Video {
  id: number;
  title: string;
  description?: string;
  filename: string;
  thumbnail?: string;
  duration?: number;
  file_size?: number;
  order_position: number;
  is_active: boolean;
  categories?: Category[];
}

interface AdminPanelProps {
  onClose: () => void;
  onUpdate: () => void;
  categories: Category[];
}

const AdminPanel = ({ onClose, onUpdate, categories }: AdminPanelProps) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'videos' | 'categories'>('videos');
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    file: null as File | null,
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [managingVideoCategories, setManagingVideoCategories] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [editingVideo, setEditingVideo] = useState<number | null>(null);
  const [editVideoData, setEditVideoData] = useState({ title: '', description: '' });

  const loadVideos = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/videos?active_only=false`);
      setVideos(response.data);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  };

  useState(() => {
    loadVideos();
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.file || !newVideo.title) {
      alert('Please provide a title and select a file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', newVideo.file);
    formData.append('title', newVideo.title);
    if (newVideo.description) {
      formData.append('description', newVideo.description);
    }

    try {
      await axios.post(`${API_URL}/api/videos/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      setNewVideo({ title: '', description: '', file: null });
      await loadVideos();
      onUpdate();
      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await axios.delete(`${API_URL}/api/videos/${id}`);
      await loadVideos();
      onUpdate();
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await axios.put(`${API_URL}/api/videos/${id}`, { is_active: !isActive });
      await loadVideos();
      onUpdate();
    } catch (error) {
      console.error('Error updating video:', error);
      alert('Failed to update video');
    }
  };

  const handleEditVideo = async (id: number) => {
    try {
      await axios.put(`${API_URL}/api/videos/${id}`, editVideoData);
      setEditingVideo(null);
      setEditVideoData({ title: '', description: '' });
      await loadVideos();
      onUpdate();
    } catch (error) {
      console.error('Error editing video:', error);
      alert('Failed to edit video');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await axios.post(`${API_URL}/api/categories/`, { name: newCategoryName });
      setNewCategoryName('');
      onUpdate();
      alert('Category created successfully!');
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category');
    }
  };

  const handleEditCategory = async (id: number, name: string) => {
    try {
      await axios.put(`${API_URL}/api/categories/${id}`, { name });
      setEditingCategory(null);
      setEditCategoryName('');
      onUpdate();
    } catch (error) {
      console.error('Error editing category:', error);
      alert('Failed to edit category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await axios.delete(`${API_URL}/api/categories/${id}`);
      onUpdate();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const handleOpenVideoCategories = (videoId: number, currentCategories: Category[]) => {
    setManagingVideoCategories(videoId);
    setSelectedCategories(currentCategories.map(c => c.id));
  };

  const handleUpdateVideoCategories = async () => {
    if (managingVideoCategories === null) return;

    try {
      await axios.put(`${API_URL}/api/videos/${managingVideoCategories}/categories`, {
        category_ids: selectedCategories
      });
      setManagingVideoCategories(null);
      setSelectedCategories([]);
      await loadVideos();
      onUpdate();
    } catch (error) {
      console.error('Error updating video categories:', error);
      alert('Failed to update video categories');
    }
  };

  const toggleCategorySelection = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-dark-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-dark-800">
        {/* Header */}
        <div className="bg-primary-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Admin Panel</h2>
            <button
              onClick={onClose}
              className="hover:bg-primary-700 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                activeTab === 'videos'
                  ? 'bg-white text-primary-600'
                  : 'bg-primary-700 text-white hover:bg-primary-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              Videos
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                activeTab === 'categories'
                  ? 'bg-white text-primary-600'
                  : 'bg-primary-700 text-white hover:bg-primary-800'
              }`}
            >
              <FolderPlus className="w-4 h-4" />
              Categories
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'videos' && (
            <>
              {/* Upload Section */}
              <div className="mb-8 bg-black rounded-lg p-6 border border-dark-800">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
              <Upload className="w-5 h-5" />
              Upload New Video
            </h3>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Video File *
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setNewVideo({ ...newVideo, file: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700"
                  required
                />
              </div>

              {uploading && (
                <div>
                  <div className="w-full bg-dark-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary-600 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{uploadProgress}% uploaded</p>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-primary-900/50"
              >
                {uploading ? 'Uploading...' : 'Upload Video'}
              </button>
            </form>
          </div>

          {/* Video List */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Existing Videos</h3>

            <div className="space-y-3">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-4 bg-dark-800 border border-dark-700 rounded-lg hover:shadow-md hover:border-primary-600 transition-all"
                >
                  <div className="flex-1">
                    {editingVideo === video.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editVideoData.title}
                          onChange={(e) => setEditVideoData({ ...editVideoData, title: e.target.value })}
                          className="w-full px-3 py-2 bg-dark-900 border border-dark-600 text-white rounded focus:ring-2 focus:ring-primary-500"
                          placeholder="Video title"
                          autoFocus
                        />
                        <textarea
                          value={editVideoData.description}
                          onChange={(e) => setEditVideoData({ ...editVideoData, description: e.target.value })}
                          className="w-full px-3 py-2 bg-dark-900 border border-dark-600 text-white rounded focus:ring-2 focus:ring-primary-500"
                          placeholder="Video description"
                          rows={2}
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="font-semibold text-white">{video.title}</h4>
                        {video.description && (
                          <p className="text-sm text-gray-400">{video.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Duration: {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : 'N/A'}
                        </p>
                        {video.categories && video.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {video.categories.map((cat) => (
                              <span
                                key={cat.id}
                                className="px-2 py-1 bg-primary-600 text-white text-xs rounded"
                              >
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {editingVideo === video.id ? (
                      <>
                        <button
                          onClick={() => handleEditVideo(video.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingVideo(null);
                            setEditVideoData({ title: '', description: '' });
                          }}
                          className="px-3 py-1 bg-dark-600 text-gray-400 rounded text-sm font-medium hover:bg-dark-500"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingVideo(video.id);
                            setEditVideoData({ title: video.title, description: video.description || '' });
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleOpenVideoCategories(video.id, video.categories || [])}
                          className="p-2 text-purple-500 hover:bg-purple-900/30 rounded-lg transition-colors"
                          title="Manage Categories"
                        >
                          <Tag className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleToggleActive(video.id, video.is_active)}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            video.is_active
                              ? 'bg-green-600 text-white'
                              : 'bg-dark-600 text-gray-400'
                          }`}
                        >
                          {video.is_active ? 'Active' : 'Hidden'}
                        </button>

                        <button
                          onClick={() => handleDelete(video.id)}
                          className="p-2 text-red-500 hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {videos.length === 0 && (
                <p className="text-center text-gray-500 py-8">No videos uploaded yet</p>
              )}
            </div>
          </div>
            </>
          )}

          {activeTab === 'categories' && (
            <>
              {/* Create Category Section */}
              <div className="mb-8 bg-black rounded-lg p-6 border border-dark-800">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                  <FolderPlus className="w-5 h-5" />
                  Create New Category
                </h3>

                <form onSubmit={handleCreateCategory} className="flex gap-3">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name (e.g., Access Policy Manager)"
                    className="flex-1 px-4 py-2 bg-dark-800 border border-dark-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-lg shadow-primary-900/50"
                  >
                    Create
                  </button>
                </form>
              </div>

              {/* Categories List */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white">Existing Categories</h3>

                <div className="space-y-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 bg-dark-800 border border-dark-700 rounded-lg hover:shadow-md hover:border-primary-600 transition-all"
                    >
                      <div className="flex-1">
                        {editingCategory === category.id ? (
                          <input
                            type="text"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            className="w-full px-3 py-1 bg-dark-900 border border-dark-600 text-white rounded focus:ring-2 focus:ring-primary-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleEditCategory(category.id, editCategoryName);
                              } else if (e.key === 'Escape') {
                                setEditingCategory(null);
                                setEditCategoryName('');
                              }
                            }}
                          />
                        ) : (
                          <>
                            <h4 className="font-semibold text-white">{category.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {category.video_count || 0} video{category.video_count !== 1 ? 's' : ''}
                            </p>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {editingCategory === category.id ? (
                          <>
                            <button
                              onClick={() => handleEditCategory(category.id, editCategoryName)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingCategory(null);
                                setEditCategoryName('');
                              }}
                              className="px-3 py-1 bg-dark-600 text-gray-400 rounded text-sm font-medium hover:bg-dark-500"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingCategory(category.id);
                                setEditCategoryName(category.name);
                              }}
                              className="p-2 text-blue-500 hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="p-2 text-red-500 hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {categories.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No categories created yet</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Video Categories Modal */}
        {managingVideoCategories !== null && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-dark-800 rounded-lg p-6 max-w-md w-full border border-dark-700">
              <h3 className="text-xl font-semibold text-white mb-4">Assign Categories</h3>

              <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-3 p-3 bg-dark-900 rounded-lg cursor-pointer hover:bg-dark-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => toggleCategorySelection(category.id)}
                      className="w-5 h-5 rounded border-dark-600 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                    />
                    <span className="text-white">{category.name}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpdateVideoCategories}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setManagingVideoCategories(null);
                    setSelectedCategories([]);
                  }}
                  className="flex-1 px-4 py-2 bg-dark-600 text-gray-300 rounded-lg hover:bg-dark-500 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
