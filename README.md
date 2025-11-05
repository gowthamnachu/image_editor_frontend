# Image Editor Frontend

Modern React-based image editor with AI-powered features. Built with Vite, React-Konva, and Tailwind CSS.

## Features

- **Drag & Drop Upload**: Easy image upload with validation
- **Person Detection**: AI-powered segmentation with visual mask overlay
- **Text Behind Person**: Unique feature to place text on background behind detected person
- **Background Removal**: Transparent PNG, solid colors, or gradients
- **Multi-Layer System**: Manage background, person, text, and sticker layers
- **Filters**: Brightness, contrast, saturation, blur, vignette with presets
- **Undo/Redo**: Full history management (client-side)
- **Export**: High-quality PNG/JPEG download
- **Responsive UI**: Black/grey Canva-like theme

## Requirements

- Node.js 16+ and npm

## Installation

```powershell
cd frontend
npm install
```

## Running Development Server

```powershell
cd frontend
npm run dev
```

The app will be available at `http://localhost:3000`

The dev server automatically proxies API requests to `http://localhost:8000`

## Building for Production

```powershell
cd frontend
npm run build
```

Build output will be in `frontend/dist/`

## Serving Production Build

### Option 1: Serve via Backend

Copy the built files to backend and serve them:

```powershell
# After building
xcopy /E /I /Y dist ..\backend\static

# Then modify backend/app/main.py to serve static files
```

Add to `backend/app/main.py`:

```python
from fastapi.staticfiles import StaticFiles

app.mount("/", StaticFiles(directory="static", html=True), name="static")
```

### Option 2: Separate Static Server

Use any static file server:

```powershell
# Using Python
cd frontend\dist
python -m http.server 3000

# Using Node serve
npm install -g serve
cd frontend\dist
serve -s . -p 3000
```

### Option 3: Deploy to Static Hosting

Deploy `frontend/dist` to:
- Vercel
- Netlify  
- GitHub Pages
- AWS S3 + CloudFront
- Any CDN

Update API URL in environment:
```
VITE_API_URL=https://your-api-domain.com/api
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── TopBar.jsx           # Top navigation bar
│   │   ├── Toolbar.jsx          # Left tool sidebar
│   │   ├── Canvas.jsx           # Main Konva canvas
│   │   ├── PropertiesPanel.jsx  # Right properties panel
│   │   ├── ImageUploader.jsx    # Drag & drop uploader
│   │   └── panels/
│   │       ├── SegmentPanel.jsx     # Person detection
│   │       ├── TextPanel.jsx        # Text options
│   │       ├── BackgroundPanel.jsx  # BG removal/replace
│   │       ├── FiltersPanel.jsx     # Image filters
│   │       └── LayersPanel.jsx      # Layer management
│   ├── store/
│   │   └── editorStore.js       # Zustand state management
│   ├── api/
│   │   └── api.js               # API client
│   ├── hooks/
│   │   └── useImage.js          # Custom image hook
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Tailwind styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Key Components

### State Management (Zustand)

The app uses Zustand for global state:

- **Image Data**: original, current, mask
- **Layers**: multi-layer system with properties
- **History**: undo/redo with 50-item limit
- **UI State**: active tool, zoom, pan, processing status
- **Properties**: text, filter settings

### Canvas System (React-Konva)

- Stage with zoom/pan controls
- Multiple layers: background, person, text, stickers
- Interactive transforms: drag, resize, rotate
- Real-time preview of changes

### API Integration

All heavy processing delegated to backend:
- Person segmentation (Mediapipe)
- Text behind person compositing
- Background removal
- Filter pipelines

Client-side operations:
- Layer management
- Transforms
- Undo/redo
- Simple text layers (not behind person)

## Usage Flow

### Basic Workflow

1. **Upload Image**
   - Drag & drop or click to select
   - Max 12MB, auto-validation

2. **Detect Person**
   - Click "Detect Person" in Segment panel
   - View mask overlay (adjustable opacity)
   - Optional: refine mask with brush tool

3. **Add Text Behind Person**
   - Select Text tool
   - Enter text and customize properties
   - Toggle "Place Text Behind Person"
   - Optional: enable auto-position
   - Click "Add Text Layer"

4. **Remove/Replace Background**
   - Select Background tool
   - Choose mode: transparent, color, gradient
   - Configure options
   - Click "Apply Background"

5. **Apply Filters**
   - Select Filters tool
   - Adjust sliders or use presets
   - Click "Apply Filters"

6. **Export**
   - Click "Export" button in top bar
   - Downloads PNG with all layers composited

### Keyboard Shortcuts

- `Ctrl+Z`: Undo
- `Ctrl+Shift+Z` or `Ctrl+Y`: Redo
- Mouse wheel on canvas: Zoom in/out
- Drag canvas: Pan around

## Customization

### Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  'editor-bg': '#0b0b0b',
  'editor-panel': '#101010',
  'editor-panel-light': '#1f1f1f',
  'editor-accent': '#6b6b6b',
  // ...
}
```

### API Endpoint

Set environment variable:

```
# .env
VITE_API_URL=http://localhost:8000/api
```

Or edit `src/api/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

### Max History

Edit `src/store/editorStore.js`:

```javascript
const MAX_HISTORY = 50; // Change this
```

## Features Deep Dive

### Text Behind Person

This is the standout feature. When enabled:

1. Client sends original image + mask + text options to backend
2. Backend renders text on background layer using PIL
3. Backend composites with proper alpha blending:
   - Person pixels preserved on top
   - Text appears behind person
   - Smooth antialiased edges
4. Result returned as base64 and added as new layer

Benefits:
- Professional antialiasing (server-side PIL rendering)
- Complex font support
- Perfect edge blending with mask feathering
- Text truly behind person, not just lower z-index

### Layer System

Each layer has:
- `type`: background, person, text, sticker, image
- `visible`: show/hide toggle
- `locked`: prevent editing
- `opacity`: 0.0 to 1.0
- `transform`: x, y, rotation, scaleX, scaleY
- `data`: image base64 or text content

Layers render in order (bottom to top) on Konva canvas.

### Undo/Redo

- Client-side only (no server state)
- Stores snapshots of layers + current image
- Limited to 50 history items (configurable)
- Works with all layer operations

## Performance Tips

1. **Image Size**: Keep images under 3000px width for smooth canvas performance
2. **Filters**: Use presets instead of manual adjustment for faster workflow
3. **Layers**: Limit to ~20 layers for optimal performance
4. **Export**: High-quality export with 2x pixel ratio

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires WebGL for Konva canvas acceleration.

## Troubleshooting

**Canvas not rendering**: Check browser WebGL support

**API errors**: Ensure backend is running on port 8000

**Slow performance**: Reduce image size or layer count

**Export not working**: Check browser popup blocker settings

**Text not showing**: Ensure text layer is visible and not behind other layers

## Development

### Adding New Tools

1. Create panel component in `src/components/panels/`
2. Add tool to `Toolbar.jsx` tools array
3. Add case in `PropertiesPanel.jsx` renderPanel()
4. Add API call if needed in `src/api/api.js`
5. Update store if new state needed

### Adding New Filters

1. Implement filter in backend `app/utils.py`
2. Add operation handler in backend `app/main.py` advanced_process
3. Add UI controls in `FiltersPanel.jsx`
4. Update filter properties in store

## License

MIT
