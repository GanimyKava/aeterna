# Quick Start Guide

Get up and running with Echoes of Eternity AR in 5 minutes!

## Step 1: Generate AR Markers (2 minutes)

1. Open `generate-markers.html` in your browser
2. Click the link to open the marker generator
3. Generate and download **two** marker patterns:
   - Save first as `markers/pattern-marker1.patt`
   - Save second as `markers/pattern-marker2.patt`

**Tip:** You can also visit: https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html

## Step 2: Start the Server (30 seconds)

**Option A: Using the script (Linux/Mac)**
```bash
./start-server.sh
```

**Option B: Using Python**
```bash
python3 -m http.server 8000
```

**Option C: Using Node.js**
```bash
npx http-server -p 8000
```

## Step 3: Open the App (30 seconds)

1. Open your browser and go to: `http://localhost:8000`
2. Allow camera and location permissions when prompted
3. Start exploring!

## Step 4: Test AR Features (2 minutes)

1. **Browse Attractions**: Click "Browse Attractions" to see available historical sites
2. **Start AR**: Click "Start AR Experience"
3. **Point at Marker**: Point your camera at one of the generated markers (display on another screen or print it)
4. **Listen**: Audio narration will play automatically (if enabled)

## Troubleshooting

### Camera not working?
- Make sure you're using `localhost` or HTTPS
- Check browser permissions
- Try Chrome or Firefox

### Markers not detected?
- Ensure good lighting
- Hold marker steady and flat
- Make sure marker files are in `markers/` folder

### Location not working?
- Enable location permissions in browser
- Use HTTPS for production (localhost works for development)

## Next Steps

- Customize attractions in `app.js`
- Add your own audio files
- Create custom 3D models
- Read full documentation in `README.md`

Enjoy your AR historical tour! 🏛️✨

