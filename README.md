# Echoes of Eternity AR

An immersive Augmented Reality application that brings history to life for tourists visiting attractions and museums. Experience historical sites through interactive AR visualizations and audio narration.

## Features

### 🎯 Core Functionality
- **Marker-Based AR**: Point your camera at AR markers to see 3D historical reconstructions
- **Demo Mode**: Test the app without camera or markers - perfect for presentations and demos!
- **Audio Narration**: Listen to detailed historical information about each attraction
- **Location-Based Discovery**: Find nearby historical attractions using GPS
- **Interactive 3D Models**: View animated 3D representations of historical monuments
- **Multi-Language Support**: Switch between English, Spanish, French, and German

### 📱 User Interface
- Modern, intuitive design with smooth animations
- Attraction browsing with detailed information cards
- AR overlay with historical context panels
- Settings panel for customization (audio, haptics, language, volume)

## Getting Started

### Prerequisites
- A modern web browser with camera access (Chrome, Firefox, Safari, Edge)
- A device with a camera (smartphone, tablet, or laptop with webcam)
- HTTPS connection (required for camera access) or localhost
- AR marker patterns (included in setup instructions)

### Installation

1. **Clone or download this repository**
   ```bash
   cd EchoesOfEternityAR
   ```

2. **Set up AR Markers**
   
   You need to create marker pattern files for AR.js. There are two options:
   
   **Option A: Generate markers online** (Recommended)
   - Visit: https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
   - Generate pattern markers and download them
   - Save them as:
     - `markers/pattern-marker1.patt`
     - `markers/pattern-marker2.patt`
   
   **Option B: Use NFT markers** (Alternative)
   - NFT markers work without printing but require marker image files
   - Update the marker type in `index.html` from `type="pattern"` to `type="nft"`

3. **Set up a local server**
   
   Since AR.js requires HTTPS or localhost, you need to serve the files via a web server:
   
   **Using Python:**
   ```bash
   python3 -m http.server 8000
   ```
   
   **Using Node.js (http-server):**
   ```bash
   npx http-server -p 8000
   ```
   
   **Using PHP:**
   ```bash
   php -S localhost:8000
   ```

4. **Open the application**
   - Navigate to `http://localhost:8000` in your browser
   - Allow camera and location permissions when prompted

## Usage Guide

### Demo Mode (No Camera Required)

Perfect for presentations, testing, or when camera access isn't available:

1. Click **"Demo Mode (No Camera)"** from the main menu
2. Select an attraction from the dropdown
3. View the 3D model, historical information, and audio narration
4. No camera, markers, or special permissions needed!

**Great for:**
- Presentations and demos
- Testing the app interface
- Devices without camera access
- Quick previews of attractions
- Teaching/showcasing the AR concept

### Starting an AR Experience

1. **From Main Menu:**
   - Click "Start AR Experience"
   - Allow camera access when prompted
   - Point your camera at an AR marker (printed or displayed on screen)
   - View the 3D historical reconstruction

2. **From Attractions List:**
   - Click "Browse Attractions"
   - Select an attraction
   - AR mode will start automatically

3. **Audio Narration:**
   - Audio automatically plays when a marker is detected (if enabled in settings)
   - Use the audio controls in the AR info panel to play/pause
   - Adjust volume in Settings

### Finding Nearby Attractions

1. Click "Nearby Places" from the main menu
2. Enable location permissions
3. View attractions sorted by distance from your location
4. Tap an attraction to start its AR experience

### Settings

- **Audio Narration**: Toggle audio on/off
- **Haptic Feedback**: Enable/disable vibration when markers are detected
- **Language**: Choose your preferred language
- **Volume**: Adjust audio narration volume

## AR Markers

This application uses pattern markers from AR.js. You can:

1. **Print markers**: Print the marker pattern files and place them at historical sites
2. **Display on screen**: Show markers on another device or screen
3. **Custom markers**: Generate new markers for specific attractions

### Marker Pattern Files Required:
- `markers/pattern-marker1.patt` - For attractions marked with marker1
- `markers/pattern-marker2.patt` - For attractions marked with marker2

## Project Structure

```
EchoesOfEternityAR/
├── index.html          # Main HTML file with AR scene
├── styles.css          # Application styling
├── app.js              # Main JavaScript logic
├── README.md           # This file
└── markers/            # AR marker pattern files
    ├── pattern-marker1.patt
    └── pattern-marker2.patt
```

## Customization

### Adding New Attractions

Edit `app.js` and add new entries to the `attractions` array:

```javascript
{
    id: 7,
    name: "Your Attraction",
    description: "Description here",
    icon: "🏛️",
    audio: "path/to/audio.mp3",
    marker: "marker1",
    year: "Time period",
    location: { lat: 0.0, lng: 0.0 }
}
```

### Adding Audio Files

1. Record or obtain audio narration files
2. Place them in an `audio/` directory
3. Update the `audio` property in attraction objects
4. Or use online URLs for audio hosting

### Customizing 3D Models

Edit the AR scene in `index.html` to add custom 3D models:

```html
<a-entity gltf-model="path/to/model.gltf"></a-entity>
```

## Browser Compatibility

- **Chrome/Edge**: Full support ✅
- **Firefox**: Full support ✅
- **Safari (iOS)**: Full support ✅
- **Opera**: Full support ✅

**Note**: HTTPS is required for camera access on most browsers. Use `localhost` for development.

## Troubleshooting

### Camera not working
- Ensure HTTPS or localhost is used
- Check browser permissions in settings
- Try a different browser

### Markers not detected
- Ensure good lighting
- Hold marker steady and flat
- Make sure marker is fully visible
- Check that marker pattern files exist

### Location not working
- Enable location permissions in browser
- Some browsers require HTTPS for geolocation
- Check that GPS/location services are enabled on device

### Audio not playing
- Check audio file paths/URLs
- Ensure audio is enabled in settings
- Some browsers require user interaction before playing audio

## Future Enhancements

- [ ] QR code scanning for quick attraction access
- [ ] Offline mode with downloaded content
- [ ] Social sharing features
- [ ] Augmented Reality filters and effects
- [ ] Interactive quizzes and historical games
- [ ] VR mode for immersive experiences
- [ ] Database integration for dynamic content
- [ ] User reviews and ratings
- [ ] Augmented reality pathfinding

## Technologies Used

- **A-Frame**: Web framework for building VR/AR experiences
- **AR.js**: JavaScript library for AR in the browser
- **Web APIs**: Geolocation, MediaDevices, Web Audio

## License

This project is open source and available for educational and commercial use.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## Contact & Support

For questions, issues, or feature requests, please open an issue in the repository.

---

**Enjoy exploring history through Augmented Reality!** 🏛️✨

