import { useState } from 'react';
import { X, Upload, Trash2, Edit, Save } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
}

interface AdminPanelProps {
  onClose: () => void;
  onUpdate: () => void;
}

const AdminPanel = ({ onClose, onUpdate }: AdminPanelProps) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    file: null as File | null,
  });

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-primary-600 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <button
            onClick={onClose}
            className="hover:bg-primary-700 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Upload Section */}
          <div className="mb-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload New Video
            </h3>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video File *
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setNewVideo({ ...newVideo, file: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {uploading && (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary-600 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{uploadProgress}% uploaded</p>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {uploading ? 'Uploading...' : 'Upload Video'}
              </button>
            </form>
          </div>

          {/* Video List */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Existing Videos</h3>

            <div className="space-y-3">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{video.title}</h4>
                    {video.description && (
                      <p className="text-sm text-gray-600">{video.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Duration: {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(video.id, video.is_active)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        video.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {video.is_active ? 'Active' : 'Hidden'}
                    </button>

                    <button
                      onClick={() => handleDelete(video.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {videos.length === 0 && (
                <p className="text-center text-gray-500 py-8">No videos uploaded yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
