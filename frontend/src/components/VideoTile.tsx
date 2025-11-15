import { Play, Clock } from 'lucide-react';

interface VideoTileProps {
  id: number;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  onClick: () => void;
}

const VideoTile = ({ title, description, thumbnail, duration, onClick }: VideoTileProps) => {
  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-dark-900 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-primary-900/50 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-dark-800 hover:border-primary-600"
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-primary-900 to-dark-900 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-16 h-16 text-gray-600 opacity-50" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <div className="bg-primary-600 rounded-full p-4 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
            <Play className="w-8 h-8 text-white" fill="currentColor" />
          </div>
        </div>

        {/* Duration badge */}
        {duration !== undefined && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(duration)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-400 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoTile;
