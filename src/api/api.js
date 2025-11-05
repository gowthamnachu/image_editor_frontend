import axios from 'axios';

// Use environment variable for API URL, fallback to local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for heavy processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Image utilities
export const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const base64ToImage = (base64) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
  });
};

export const canvasToBase64 = (canvas, format = 'png', quality = 0.95) => {
  return canvas.toDataURL(`image/${format}`, quality);
};

// API calls
export const segmentPerson = async (imageBase64, threshold = 0.3) => {
  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const response = await api.post('/segment', {
      imageBase64: base64Data,
      method: 'auto',
      threshold: threshold,
    });
    
    return response.data;
  } catch (error) {
    console.error('Segmentation error:', error);
    throw new Error(error.response?.data?.detail || 'Segmentation failed');
  }
};

export const refineMask = async (imageBase64, maskBase64, fgStrokes, bgStrokes) => {
  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const maskData = maskBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const response = await api.post('/refine-mask', {
      imageBase64: base64Data,
      maskBase64: maskData,
      fgStrokesBase64: fgStrokes ? fgStrokes.replace(/^data:image\/\w+;base64,/, '') : null,
      bgStrokesBase64: bgStrokes ? bgStrokes.replace(/^data:image\/\w+;base64,/, '') : null,
    });
    
    return response.data;
  } catch (error) {
    console.error('Mask refinement error:', error);
    throw new Error(error.response?.data?.detail || 'Mask refinement failed');
  }
};

export const removeBackground = async (imageBase64, maskBase64, options = {}) => {
  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const maskData = maskBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const requestData = {
      imageBase64: base64Data,
      maskBase64: maskData,
      mode: options.mode || 'transparent',
    };
    
    if (options.color) requestData.color = options.color;
    if (options.bgImageBase64) {
      requestData.bgImageBase64 = options.bgImageBase64.replace(/^data:image\/\w+;base64,/, '');
    }
    if (options.gradient) requestData.gradient = options.gradient;
    
    const response = await api.post('/remove-bg', requestData);
    
    return response.data;
  } catch (error) {
    console.error('Background removal error:', error);
    throw new Error(error.response?.data?.detail || 'Background removal failed');
  }
};

export const placeTextBehind = async (imageBase64, maskBase64, textOptions) => {
  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const maskData = maskBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const requestData = {
      imageBase64: base64Data,
      maskBase64: maskData,
      text: textOptions.text,
      x: textOptions.x || 100,
      y: textOptions.y || 200,
      fontSize: textOptions.fontSize || 72,
      fontFamily: textOptions.fontFamily || 'Arial',
      fontWeight: textOptions.fontWeight || 'normal',
      fontStyle: textOptions.fontStyle || 'normal',
      color: textOptions.color || '#FFFFFF',
      align: textOptions.align || 'left',
      lineSpacing: textOptions.lineSpacing || 10,
      letterSpacing: textOptions.letterSpacing || 0,
      autoPosition: textOptions.autoPosition || false,
      // Text effects
      stroke: textOptions.stroke || false,
      strokeColor: textOptions.strokeColor || '#000000',
      strokeWidth: textOptions.strokeWidth || 2,
      shadow: textOptions.shadow || false,
      shadowColor: textOptions.shadowColor || '#000000',
      shadowBlur: textOptions.shadowBlur || 10,
      shadowOffsetX: textOptions.shadowOffsetX || 5,
      shadowOffsetY: textOptions.shadowOffsetY || 5,
      textTransform: textOptions.textTransform || 'none',
    };
    
    if (textOptions.fontPath) requestData.fontPath = textOptions.fontPath;
    if (textOptions.bgColor) requestData.bgColor = textOptions.bgColor;
    if (textOptions.backgroundColor && textOptions.backgroundColor !== 'transparent') {
      requestData.bgColor = textOptions.backgroundColor;
    }
    if (textOptions.bgImageBase64) {
      requestData.bgImageBase64 = textOptions.bgImageBase64.replace(/^data:image\/\w+;base64,/, '');
    }
    if (textOptions.maxWidth) requestData.maxWidth = textOptions.maxWidth;
    
    const response = await api.post('/place-text-behind', requestData);
    
    return response.data;
  } catch (error) {
    console.error('Text placement error:', error);
    throw new Error(error.response?.data?.detail || 'Text placement failed');
  }
};

export const advancedProcess = async (imageBase64, operations) => {
  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const response = await api.post('/advanced-process', {
      imageBase64: base64Data,
      ops: operations,
    });
    
    return response.data;
  } catch (error) {
    console.error('Advanced processing error:', error);
    throw new Error(error.response?.data?.detail || 'Processing failed');
  }
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    return { status: 'error', mediapipe: false };
  }
};

// ============================================================================
// ADVANCED EDITING APIs
// ============================================================================

export const upscaleImage = async (imageBase64, scaleFactor = 2.0, method = 'bicubic') => {
  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const response = await api.post('/upscale', {
      imageBase64: base64Data,
      scaleFactor: scaleFactor,
      method: method, // bicubic, lanczos, super_resolution
    });
    
    return response.data;
  } catch (error) {
    console.error('Upscale error:', error);
    throw new Error(error.response?.data?.detail || 'Upscale failed');
  }
};

export const removeObject = async (imageBase64, maskBase64, method = 'telea') => {
  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const maskData = maskBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const response = await api.post('/remove-object', {
      imageBase64: base64Data,
      maskBase64: maskData,
      method: method, // telea or navier_stokes
    });
    
    return response.data;
  } catch (error) {
    console.error('Object removal error:', error);
    throw new Error(error.response?.data?.detail || 'Object removal failed');
  }
};

export const removeWatermark = async (imageBase64, maskBase64 = null, autoDetect = true) => {
  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const requestData = {
      imageBase64: base64Data,
      autoDetect: autoDetect,
    };
    
    if (maskBase64) {
      requestData.maskBase64 = maskBase64.replace(/^data:image\/\w+;base64,/, '');
    }
    
    const response = await api.post('/remove-watermark', requestData);
    
    return response.data;
  } catch (error) {
    console.error('Watermark removal error:', error);
    throw new Error(error.response?.data?.detail || 'Watermark removal failed');
  }
};

export const smartEnhance = async (imageBase64, options = {}) => {
  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const response = await api.post('/smart-enhance', {
      imageBase64: base64Data,
      denoise: options.denoise !== undefined ? options.denoise : true,
      sharpen: options.sharpen !== undefined ? options.sharpen : true,
      colorBalance: options.colorBalance !== undefined ? options.colorBalance : true,
    });
    
    return response.data;
  } catch (error) {
    console.error('Smart enhance error:', error);
    throw new Error(error.response?.data?.detail || 'Smart enhance failed');
  }
};

export const reduceNoise = async (imageBase64, strength = 10, method = 'nlm') => {
  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const response = await api.post('/reduce-noise', {
      imageBase64: base64Data,
      strength: strength, // 1-30
      method: method, // nlm, bilateral, gaussian
    });
    
    return response.data;
  } catch (error) {
    console.error('Noise reduction error:', error);
    throw new Error(error.response?.data?.detail || 'Noise reduction failed');
  }
};

export const autoExposure = async (imageBase64, clipLimit = 2.0) => {
  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const response = await api.post('/auto-exposure', {
      imageBase64: base64Data,
      clipLimit: clipLimit, // 1.0-4.0
    });
    
    return response.data;
  } catch (error) {
    console.error('Auto exposure error:', error);
    throw new Error(error.response?.data?.detail || 'Auto exposure failed');
  }
};

export const perspectiveCorrection = async (imageBase64, corners) => {
  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const response = await api.post('/perspective-correction', {
      imageBase64: base64Data,
      corners: corners, // [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
    });
    
    return response.data;
  } catch (error) {
    console.error('Perspective correction error:', error);
    throw new Error(error.response?.data?.detail || 'Perspective correction failed');
  }
};

export default api;
