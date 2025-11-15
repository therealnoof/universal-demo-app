import { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { X, SkipBack, SkipForward, Maximize, Minimize } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  description?: string;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

const VideoPlayer = ({
  videoUrl,
  title,
  description,
  onClose,
  onPrevious,
  onNext,
}: VideoPlayerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black to-transparent z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors flex items-center gap-2 text-lg"
          >
            <X className="w-6 h-6" />
            <span className="hidden sm:inline">Close</span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-gray-300 transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="w-6 h-6" />
            ) : (
              <Maximize className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Video Player */}
      <div ref={containerRef} className="w-full max-w-6xl">
        <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
          <ReactPlayer
            url={videoUrl}
            controls
            playing
            width="100%"
            height="100%"
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                },
              },
            }}
          />
        </div>

        {/* Video Info */}
        <div className="mt-6 bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          {description && (
            <p className="text-gray-300 text-lg">{description}</p>
          )}
        </div>

        {/* Navigation */}
        {(onPrevious || onNext) && (
          <div className="mt-6 flex items-center justify-center gap-4">
            {onPrevious && (
              <button
                onClick={onPrevious}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                <SkipBack className="w-5 h-5" />
                Previous
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Next
                <SkipForward className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
