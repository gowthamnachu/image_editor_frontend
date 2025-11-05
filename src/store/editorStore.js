import { create } from 'zustand';

const MAX_HISTORY = 50;

const useEditorStore = create((set, get) => ({
  // Image data
  originalImage: null,
  currentImage: null,
  uncroppedImage: null, // Store the full uncropped version for reset
  segmentationMask: null,
  
  // Layers
  layers: [],
  selectedLayerId: null,
  
  // Tools
  activeTool: null, // 'select', 'text', 'image', 'crop'
  
  // History for undo/redo
  history: [],
  historyIndex: -1,
  
  // UI state
  isProcessing: false,
  showMaskOverlay: false,
  maskOpacity: 0.5,
  zoom: 1,
  panX: 0,
  panY: 0,
  
  // Text properties
  textProperties: {
    text: 'Hello World',
    fontSize: 72,
    fontFamily: 'Arial',
    fontWeight: 'normal', // 'normal', 'bold'
    fontStyle: 'normal', // 'normal', 'italic'
    color: '#FFFFFF',
    align: 'left',
    stroke: false,
    strokeColor: '#000000',
    strokeWidth: 2,
    shadow: false,
    shadowColor: '#000000',
    shadowBlur: 10,
    shadowOffsetX: 5,
    shadowOffsetY: 5,
    backgroundColor: 'transparent',
    padding: 10,
    letterSpacing: 0,
    lineHeight: 1.2,
    textDecoration: 'none', // 'none', 'underline', 'line-through'
    textTransform: 'none', // 'none', 'uppercase', 'lowercase', 'capitalize'
    placeBehindPerson: false,
    autoPosition: false,
  },
  
  // Filter properties
  filterProperties: {
    brightness: 0,
    contrast: 1,
    saturation: 1,
    blur: 0,
    vignette: 0,
  },
  
  // Actions
  setOriginalImage: (image) => set({ 
    originalImage: image, 
    currentImage: image,
    uncroppedImage: image // Store as uncropped when first loaded
  }),
  
  updateOriginalImage: (image) => {
    const state = get();
    
    // Update the original image and set as new uncropped base
    set({ 
      originalImage: image, 
      currentImage: image,
      uncroppedImage: image // Update uncropped when manually updated
    });
    
    // Find and update the background layer with the new image
    const backgroundLayer = state.layers.find(l => l.id === 'background' || l.type === 'background');
    if (backgroundLayer) {
      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        const updatedLayers = state.layers.map(layer => {
          if (layer.id === backgroundLayer.id) {
            return {
              ...layer,
              data: image,
              width: img.width,
              height: img.height,
            };
          }
          return layer;
        });
        set({ layers: updatedLayers });
        state.pushToHistory();
      };
      img.src = image;
    } else {
      state.pushToHistory();
    }
  },
  
  setCurrentImage: (image) => {
    const state = get();
    set({ currentImage: image });
    state.pushToHistory();
  },
  
  setSegmentationMask: (mask) => set({ segmentationMask: mask }),
  
  setLayers: (layers) => set({ layers }),
  
  addLayer: (layer) => {
    const state = get();
    const newLayer = {
      id: `layer-${Date.now()}-${Math.random()}`,
      type: layer.type, // 'background', 'person', 'text', 'image'
      visible: true,
      locked: false,
      opacity: 1,
      x: layer.x || 0,
      y: layer.y || 0,
      width: layer.width,
      height: layer.height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      data: layer.data, // image data, text content, etc.
      ...layer,
    };
    
    set({ 
      layers: [...state.layers, newLayer],
      selectedLayerId: newLayer.id,
    });
    state.pushToHistory();
  },
  
  updateLayer: (layerId, updates) => {
    const state = get();
    set({
      layers: state.layers.map(layer =>
        layer.id === layerId ? { ...layer, ...updates } : layer
      ),
    });
    state.pushToHistory();
  },
  
  deleteLayer: (layerId) => {
    const state = get();
    set({
      layers: state.layers.filter(layer => layer.id !== layerId),
      selectedLayerId: state.selectedLayerId === layerId ? null : state.selectedLayerId,
    });
    state.pushToHistory();
  },
  
  moveLayerUp: (layerId) => {
    const state = get();
    const index = state.layers.findIndex(l => l.id === layerId);
    if (index < state.layers.length - 1) {
      const newLayers = [...state.layers];
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
      set({ layers: newLayers });
      state.pushToHistory();
    }
  },
  
  moveLayerDown: (layerId) => {
    const state = get();
    const index = state.layers.findIndex(l => l.id === layerId);
    if (index > 0) {
      const newLayers = [...state.layers];
      [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
      set({ layers: newLayers });
      state.pushToHistory();
    }
  },
  
  moveLayerToTop: (layerId) => {
    const state = get();
    const index = state.layers.findIndex(l => l.id === layerId);
    if (index !== -1 && index < state.layers.length - 1) {
      const newLayers = [...state.layers];
      const [layer] = newLayers.splice(index, 1);
      newLayers.push(layer);
      set({ layers: newLayers });
      state.pushToHistory();
    }
  },
  
  moveLayerToBottom: (layerId) => {
    const state = get();
    const index = state.layers.findIndex(l => l.id === layerId);
    if (index > 0) {
      const newLayers = [...state.layers];
      const [layer] = newLayers.splice(index, 1);
      newLayers.unshift(layer);
      set({ layers: newLayers });
      state.pushToHistory();
    }
  },
  
  duplicateLayer: (layerId) => {
    const state = get();
    const layer = state.layers.find(l => l.id === layerId);
    if (layer) {
      const newLayer = {
        ...layer,
        id: `layer-${Date.now()}-${Math.random()}`,
        x: layer.x + 20,
        y: layer.y + 20,
      };
      set({ 
        layers: [...state.layers, newLayer],
        selectedLayerId: newLayer.id,
      });
      state.pushToHistory();
    }
  },
  
  reorderLayers: (newLayers) => {
    set({ layers: newLayers });
    get().pushToHistory();
  },
  
  setSelectedLayerId: (id) => set({ selectedLayerId: id }),
  
  setActiveTool: (tool) => set({ activeTool: tool }),
  
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  
  setShowMaskOverlay: (show) => set({ showMaskOverlay: show }),
  
  setMaskOpacity: (opacity) => set({ maskOpacity: opacity }),
  
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  
  setPan: (panX, panY) => set({ panX, panY }),
  
  setTextProperties: (props) => {
    const state = get();
    set({ textProperties: { ...state.textProperties, ...props } });
  },
  
  setFilterProperties: (props) => {
    const state = get();
    set({ filterProperties: { ...state.filterProperties, ...props } });
  },
  
  // History management
  pushToHistory: () => {
    const state = get();
    const snapshot = {
      layers: JSON.parse(JSON.stringify(state.layers)),
      currentImage: state.currentImage,
      timestamp: Date.now(),
    };
    
    // Remove any history after current index
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(snapshot);
    
    // Keep only MAX_HISTORY items
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },
  
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const snapshot = state.history[newIndex];
      set({
        layers: JSON.parse(JSON.stringify(snapshot.layers)),
        currentImage: snapshot.currentImage,
        historyIndex: newIndex,
      });
    }
  },
  
  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const snapshot = state.history[newIndex];
      set({
        layers: JSON.parse(JSON.stringify(snapshot.layers)),
        currentImage: snapshot.currentImage,
        historyIndex: newIndex,
      });
    }
  },
  
  canUndo: () => {
    const state = get();
    return state.historyIndex > 0;
  },
  
  canRedo: () => {
    const state = get();
    return state.historyIndex < state.history.length - 1;
  },
  
  // Reset editor
  reset: () => set({
    originalImage: null,
    currentImage: null,
    uncroppedImage: null,
    segmentationMask: null,
    layers: [],
    selectedLayerId: null,
    activeTool: null,
    history: [],
    historyIndex: -1,
    isProcessing: false,
    showMaskOverlay: false,
    zoom: 1,
    panX: 0,
    panY: 0,
  }),
}));

export default useEditorStore;
