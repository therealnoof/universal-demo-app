# Quick Start Guide

Get your Demo Showcase application running in 5 minutes!

## Fastest Way (Docker)

### macOS / Linux
```bash
cd demo-showcase
./start.sh
```

### Windows
```bash
cd demo-showcase
start.bat
```

The script will:
✅ Check if Docker is installed and running
✅ Create necessary directories
✅ Build and start the containers
✅ Show you the URLs to access the app

**Access:**
- **Frontend:** http://localhost
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## Manual Docker Start

```bash
cd demo-showcase
docker-compose up --build
```

## Stop the Application

```bash
docker-compose down
```

## First Steps

1. **Open the app:** Go to http://localhost
2. **Click Admin button** in the top-right
3. **Upload a video:**
   - Enter a title (e.g., "Product Demo")
   - Add description (optional)
   - Select a video file (.mp4, .mov, etc.)
   - Click "Upload Video"
4. **Wait** for processing to complete
5. **Click the video tile** to watch it

## Troubleshooting

### Docker not running?
Start Docker Desktop first

### Port 80 already in use?
Edit `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "8080:80"  # Change 80 to 8080
```

Then access at http://localhost:8080

### Video upload fails?
- Check file size (max 500MB recommended)
- Ensure video format is supported (.mp4, .mov, .avi, .webm, .mkv)
- View logs: `docker-compose logs backend`

## Next Steps

- Read the full [README.md](README.md) for detailed information
- Customize the branding and colors
- Deploy to a server for your trade show
- Set up kiosk mode for unattended displays

## Need Help?

Check the logs:
```bash
docker-compose logs -f
```

Restart fresh:
```bash
docker-compose down -v
docker-compose up --build
```
