# Demo Showcase Application

A modern, containerized video showcase application designed for trade shows and client demonstrations. Features a sleek tile-based interface for displaying demo videos with an intuitive admin panel for content management.

![Demo Showcase](./images/screenshot.png)

## Features

### User Interface
- 🎬 **Modern Tile Gallery** - Beautiful grid layout with video thumbnails
- ▶️ **Full-Screen Video Player** - Smooth playback with navigation controls
- 📱 **Responsive Design** - Works on all screen sizes
- 🎨 **Professional Theme** - Clean, modern UI with smooth animations
- ⌨️ **Keyboard Navigation** - Previous/Next video controls

### Admin Panel
- 📤 **Drag-and-Drop Upload** - Easy video uploads with progress tracking
- ✏️ **Edit Metadata** - Update titles and descriptions
- 🗑️ **Delete Videos** - Remove outdated content
- 👁️ **Hide/Show Videos** - Toggle video visibility
- 🖼️ **Auto-Thumbnails** - Automatic thumbnail generation from videos

### Technical Features
- 🐳 **Fully Containerized** - Docker & Docker Compose support
- 🔄 **Hot Reload** - Development mode with live updates
- 💾 **Persistent Storage** - Volume-mounted video and database storage
- 🚀 **Production Ready** - Optimized build with Nginx
- 🌐 **Cross-Platform** - Runs on macOS, Windows, and Linux

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- React Player for video playback
- Vite for build tooling
- Axios for API calls

**Backend:**
- FastAPI (Python)
- SQLAlchemy with SQLite
- MoviePy for video processing
- Pillow for thumbnail generation

**DevOps:**
- Docker & Docker Compose
- Nginx for production serving

## Quick Start

### Prerequisites
- Docker Desktop (macOS/Windows) or Docker Engine (Linux)
- OR: Node.js 20+ and Python 3.11+ for local development

### Option 1: Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd demo-showcase
   ```

2. **Start the application:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Option 2: Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Usage

### Upload Videos

1. Click the **Admin** button in the top-right corner
2. Fill in the video title and description
3. Select a video file (MP4, MOV, AVI, WebM, MKV)
4. Click **Upload Video**
5. Wait for upload and processing to complete

### Play Videos

1. Click on any video tile from the main gallery
2. Video will open in full-screen player
3. Use **Previous/Next** buttons to navigate
4. Press **Close** or ESC to return to gallery

### Manage Videos

In the Admin Panel:
- **Toggle Active/Hidden** - Show or hide videos from the gallery
- **Delete** - Remove videos permanently (with confirmation)
- **View Metadata** - See video duration and details

## Project Structure

```
demo-showcase/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   └── videos.py      # Video API endpoints
│   │   ├── main.py            # FastAPI application
│   │   ├── models.py          # Database models
│   │   └── database.py        # Database connection
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoTile.tsx    # Video grid tile
│   │   │   ├── VideoPlayer.tsx  # Full-screen player
│   │   │   └── AdminPanel.tsx   # Admin interface
│   │   ├── App.tsx              # Main application
│   │   ├── main.tsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── videos/                    # Video storage (volume-mounted)
├── database/                  # SQLite database (volume-mounted)
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Videos

- `GET /api/videos` - List all active videos
- `GET /api/videos/{id}` - Get video by ID
- `POST /api/videos` - Upload new video
- `PUT /api/videos/{id}` - Update video metadata
- `DELETE /api/videos/{id}` - Delete video
- `GET /api/videos/stream/{filename}` - Stream video file
- `GET /api/videos/thumbnail/{filename}` - Get video thumbnail

### Health

- `GET /` - API info
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation

## Configuration

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL=sqlite:///./database/videos.db
UPLOAD_DIR=./uploads
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8000
```

### Docker Compose

Edit `docker-compose.yml` to customize:
- Ports
- Volume mounts
- Environment variables
- Resource limits

## Deployment

### Production Build

1. **Build Docker images:**
   ```bash
   docker-compose build
   ```

2. **Run in detached mode:**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

### Podman

Works with Podman as a Docker alternative:

```bash
podman-compose up --build
```

### Kiosk Mode

For trade show kiosks, add these browser flags:
- **Chrome:** `--kiosk --incognito`
- **Firefox:** `-kiosk`

Auto-start on boot:
- macOS: Add to Login Items
- Windows: Add to Startup folder
- Linux: Create systemd service

## Customization

### Branding

**Logo:** Edit `frontend/index.html` and `frontend/src/App.tsx`

**Colors:** Modify `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#YOUR_COLOR',
    600: '#YOUR_COLOR',
    // ...
  }
}
```

**Title:** Update in `frontend/src/App.tsx`:
```typescript
<h1>Your Company Name</h1>
```

### Video Settings

**Supported formats:** MP4, MOV, AVI, WebM, MKV

**Recommended specs:**
- Resolution: 1920x1080 (1080p)
- Codec: H.264
- Bitrate: 5-8 Mbps
- Duration: 2-10 minutes

## Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Change ports in docker-compose.yml
ports:
  - "8080:80"  # Frontend
  - "8001:8000"  # Backend
```

**Permission denied:**
```bash
chmod -R 755 videos database
```

### Video Upload Fails

- Check file size (default limit: 500MB)
- Verify video format is supported
- Ensure sufficient disk space
- Check backend logs: `docker-compose logs backend`

### Thumbnails Not Generating

Requires ffmpeg:
- Docker: Already included
- Local: Install ffmpeg separately

## Development

### Hot Reload

Both frontend and backend support hot reload in development mode.

**Backend:**
```bash
uvicorn app.main:app --reload
```

**Frontend:**
```bash
npm run dev
```

### Running Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Contact: your-email@example.com

## Screenshots

### Main Gallery
![Gallery View](./images/gallery.png)

### Video Player
![Player View](./images/player.png)

### Admin Panel
![Admin Panel](./images/admin.png)

---

**Built with ❤️ for trade shows and demos**
