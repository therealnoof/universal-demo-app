import { useState, useEffect } from 'react';
import { Settings, Filter } from 'lucide-react';
import axios from 'axios';
import VideoTile from './components/VideoTile';
import VideoPlayer from './components/VideoPlayer';
import AdminPanel from './components/AdminPanel';

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

function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadVideos = async (categoryId: number | null = null) => {
    try {
      setLoading(true);
      const params = categoryId ? { category_id: categoryId } : {};
      const response = await axios.get(`${API_URL}/api/videos`, { params });
      setVideos(response.data);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadVideos();
  }, []);

  useEffect(() => {
    loadVideos(selectedCategory);
  }, [selectedCategory]);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };

  const handlePrevious = () => {
    if (!selectedVideo) return;
    const currentIndex = videos.findIndex((v) => v.id === selectedVideo.id);
    if (currentIndex > 0) {
      setSelectedVideo(videos[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (!selectedVideo) return;
    const currentIndex = videos.findIndex((v) => v.id === selectedVideo.id);
    if (currentIndex < videos.length - 1) {
      setSelectedVideo(videos[currentIndex + 1]);
    }
  };

  const currentIndex = selectedVideo
    ? videos.findIndex((v) => v.id === selectedVideo.id)
    : -1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-dark-900 to-dark-800">
      {/* Header */}
      <header className="bg-black shadow-xl border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/assets/f5-logo.svg"
                alt="F5 Logo"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  F5 Solutions
                </h1>
                <p className="text-gray-400 mt-1">
                  The Application Delivery and Security Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                    className="pl-10 pr-8 py-2 bg-dark-800 border border-dark-600 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 cursor-pointer appearance-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.video_count || 0})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={() => setShowAdmin(true)}
                className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white border border-dark-600 rounded-lg transition-colors"
                title="Admin Panel"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              No videos available. Upload some videos from the admin panel.
            </p>
            <button
              onClick={() => setShowAdmin(true)}
              className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-lg shadow-primary-900/50"
            >
              Open Admin Panel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <VideoTile
                key={video.id}
                id={video.id}
                title={video.title}
                description={video.description}
                thumbnail={
                  video.thumbnail
                    ? `${API_URL}/api/videos/thumbnail/${video.thumbnail}`
                    : undefined
                }
                duration={video.duration}
                onClick={() => handleVideoClick(video)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          videoUrl={`${API_URL}/api/videos/stream/${selectedVideo.filename}`}
          title={selectedVideo.title}
          description={selectedVideo.description}
          onClose={handleClosePlayer}
          onPrevious={currentIndex > 0 ? handlePrevious : undefined}
          onNext={currentIndex < videos.length - 1 ? handleNext : undefined}
        />
      )}

      {/* Admin Panel Modal */}
      {showAdmin && (
        <AdminPanel
          onClose={() => setShowAdmin(false)}
          onUpdate={() => {
            loadVideos();
            loadCategories();
          }}
          categories={categories}
        />
      )}

      {/* Footer */}
      <footer className="bg-black border-t border-dark-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center gap-3">
            <img
              src="/assets/f5-logo.svg"
              alt="F5 Logo"
              className="h-8 w-auto opacity-80"
            />
            <p className="text-center text-gray-400">
              © 2024 F5 Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
