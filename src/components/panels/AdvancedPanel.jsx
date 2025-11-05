import React, { useState } from 'react';
import { 
  Sparkles, Wand2, Eraser, Droplet, ZoomIn, 
  Image as ImageIcon, Sun, Grid3x3, Trash2
} from 'lucide-react';
import useEditorStore from '../../store/editorStore';
import { 
  upscaleImage, removeObject, removeWatermark,
  smartEnhance, reduceNoise, autoExposure, 
  perspectiveCorrection 
} from '../../api/api';
import LoadingOverlay from '../LoadingOverlay';
import BrushCanvas from '../BrushCanvas';
import BeforeAfterSlider from '../BeforeAfterSlider';

const AdvancedPanel = () => {
  const { 
    originalImage, 
    layers,
    addLayer,
    setIsProcessing,
    isProcessing,
    updateOriginalImage
  } = useEditorStore();

  const [upscaleSettings, setUpscaleSettings] = useState({
    scaleFactor: 2.0,
    method: 'bicubic',
  });

  const [noiseSettings, setNoiseSettings] = useState({
    strength: 10,
    method: 'nlm',
  });

  const [exposureSettings, setExposureSettings] = useState({
    clipLimit: 2.0,
  });

  const [enhanceSettings, setEnhanceSettings] = useState({
    denoise: true,
    sharpen: true,
    colorBalance: true,
  });

  const [showBrushCanvas, setShowBrushCanvas] = useState(false);
  const [brushMode, setBrushMode] = useState(null); // 'object' or 'watermark'
  const [loadingMessage, setLoadingMessage] = useState('Processing...');
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [beforeAfterImages, setBeforeAfterImages] = useState({ before: null, after: null });

  const getCurrentImageBase64 = () => {
    if (!originalImage) return null;
    return originalImage;
  };

  const handleUpscale = async () => {
    const imageBase64 = getCurrentImageBase64();
    if (!imageBase64) {
      alert('Please load an image first');
      return;
    }

    setLoadingMessage(`Upscaling image ${upscaleSettings.scaleFactor}x...`);
    setIsProcessing(true);
    try {
      const result = await upscaleImage(
        imageBase64, 
        upscaleSettings.scaleFactor, 
        upscaleSettings.method
      );
      
      const upscaledImage = `data:image/png;base64,${result.resultBase64}`;
      
      // Show before/after comparison
      setBeforeAfterImages({
        before: imageBase64,
        after: upscaledImage
      });
      setShowBeforeAfter(true);
      
      // Add as new layer
      addLayer({
        type: 'image',
        src: upscaledImage,
        name: `Upscaled ${upscaleSettings.scaleFactor}x`,
        opacity: 1,
        visible: true,
        locked: false,
      });

      // Don't show alert since we're showing the slider
    } catch (error) {
      alert(`❌ Upscale failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSmartEnhance = async () => {
    const imageBase64 = getCurrentImageBase64();
    if (!imageBase64) {
      alert('Please load an image first');
      return;
    }

    setLoadingMessage('Applying smart enhancement...');
    setIsProcessing(true);
    try {
      const result = await smartEnhance(imageBase64, enhanceSettings);
      
      const enhancedImage = `data:image/png;base64,${result.resultBase64}`;
      // Show before/after comparison
      setBeforeAfterImages({ before: imageBase64, after: enhancedImage });
      setShowBeforeAfter(true);

      addLayer({
        type: 'image',
        src: enhancedImage,
        name: 'Smart Enhanced',
        opacity: 1,
        visible: true,
        locked: false,
      });
    } catch (error) {
      alert(`❌ Smart enhance failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNoiseReduction = async () => {
    const imageBase64 = getCurrentImageBase64();
    if (!imageBase64) {
      alert('Please load an image first');
      return;
    }

    setLoadingMessage('Reducing noise...');
    setIsProcessing(true);
    try {
      const result = await reduceNoise(
        imageBase64, 
        noiseSettings.strength, 
        noiseSettings.method
      );
      
      const denoisedImage = `data:image/png;base64,${result.resultBase64}`;
      // Show before/after comparison
      setBeforeAfterImages({ before: imageBase64, after: denoisedImage });
      setShowBeforeAfter(true);

      addLayer({
        type: 'image',
        src: denoisedImage,
        name: 'Noise Reduced',
        opacity: 1,
        visible: true,
        locked: false,
      });
    } catch (error) {
      alert(`❌ Noise reduction failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoExposure = async () => {
    const imageBase64 = getCurrentImageBase64();
    if (!imageBase64) {
      alert('Please load an image first');
      return;
    }

    setLoadingMessage('Correcting exposure...');
    setIsProcessing(true);
    try {
      const result = await autoExposure(imageBase64, exposureSettings.clipLimit);
      
      const correctedImage = `data:image/png;base64,${result.resultBase64}`;
      // Show before/after comparison
      setBeforeAfterImages({ before: imageBase64, after: correctedImage });
      setShowBeforeAfter(true);

      addLayer({
        type: 'image',
        src: correctedImage,
        name: 'Exposure Corrected',
        opacity: 1,
        visible: true,
        locked: false,
      });
    } catch (error) {
      alert(`❌ Auto exposure failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveWatermark = async () => {
    const imageBase64 = getCurrentImageBase64();
    if (!imageBase64) {
      alert('Please load an image first');
      return;
    }

    setLoadingMessage('Removing watermark...');
    setIsProcessing(true);
    try {
      const result = await removeWatermark(imageBase64, null, true);
      
      const cleanImage = `data:image/png;base64,${result.resultBase64}`;
      // Show before/after comparison
      setBeforeAfterImages({ before: imageBase64, after: cleanImage });
      setShowBeforeAfter(true);

      addLayer({
        type: 'image',
        src: cleanImage,
        name: 'Watermark Removed',
        opacity: 1,
        visible: true,
        locked: false,
      });
    } catch (error) {
      alert(`❌ Watermark removal failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleObjectRemovalWithMask = async (maskBase64) => {
    const imageBase64 = getCurrentImageBase64();
    if (!imageBase64) return;

    setShowBrushCanvas(false);
    setLoadingMessage('Removing object...');
    setIsProcessing(true);
    
    try {
      const result = await removeObject(imageBase64, maskBase64, 'telea');
      
      const cleanImage = `data:image/png;base64,${result.resultBase64}`;
      // Show before/after comparison
      setBeforeAfterImages({ before: imageBase64, after: cleanImage });
      setShowBeforeAfter(true);

      addLayer({
        type: 'image',
        src: cleanImage,
        name: 'Object Removed',
        opacity: 1,
        visible: true,
        locked: false,
      });
    } catch (error) {
      alert(`❌ Object removal failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWatermarkRemovalWithMask = async (maskBase64) => {
    const imageBase64 = getCurrentImageBase64();
    if (!imageBase64) return;

    setShowBrushCanvas(false);
    setLoadingMessage('Removing watermark...');
    setIsProcessing(true);
    
    try {
      const result = await removeWatermark(imageBase64, maskBase64, false);
      
      const cleanImage = `data:image/png;base64,${result.resultBase64}`;
      // Show before/after comparison
      setBeforeAfterImages({ before: imageBase64, after: cleanImage });
      setShowBeforeAfter(true);

      addLayer({
        type: 'image',
        src: cleanImage,
        name: 'Watermark Removed',
        opacity: 1,
        visible: true,
        locked: false,
      });
    } catch (error) {
      alert(`❌ Watermark removal failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleObjectRemovalMode = () => {
    const imageBase64 = getCurrentImageBase64();
    if (!imageBase64) {
      alert('Please load an image first');
      return;
    }
    
    setBrushMode('object');
    setShowBrushCanvas(true);
  };

  const toggleWatermarkRemovalMode = () => {
    const imageBase64 = getCurrentImageBase64();
    if (!imageBase64) {
      alert('Please load an image first');
      return;
    }
    
    setBrushMode('watermark');
    setShowBrushCanvas(true);
  };

  return (
    <>
      <LoadingOverlay isVisible={isProcessing} message={loadingMessage} />
      
      {showBrushCanvas && (
        <BrushCanvas
          imageBase64={getCurrentImageBase64()}
          onMaskComplete={(maskBase64) => {
            if (brushMode === 'object') {
              handleObjectRemovalWithMask(maskBase64);
            } else if (brushMode === 'watermark') {
              handleWatermarkRemovalWithMask(maskBase64);
            }
          }}
          onCancel={() => setShowBrushCanvas(false)}
          title={brushMode === 'object' ? 'Draw Over Object to Remove' : 'Draw Over Watermark to Remove'}
        />
      )}
      
      {showBeforeAfter && beforeAfterImages.before && beforeAfterImages.after && (
        <BeforeAfterSlider
          beforeImage={beforeAfterImages.before}
          afterImage={beforeAfterImages.after}
          onClose={() => setShowBeforeAfter(false)}
          onApply={(processedImage) => {
            updateOriginalImage(processedImage);
          }}
        />
      )}
      
      <div className="space-y-6 p-4">
      {/* Upscale Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ZoomIn size={18} className="text-blue-400" />
          <h3 className="font-medium text-white">Upscale Image</h3>
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Scale Factor: {upscaleSettings.scaleFactor}x
          </label>
          <input
            type="range"
            min="1.5"
            max="4"
            step="0.5"
            value={upscaleSettings.scaleFactor}
            onChange={(e) => setUpscaleSettings({
              ...upscaleSettings,
              scaleFactor: parseFloat(e.target.value)
            })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Method</label>
          <select
            value={upscaleSettings.method}
            onChange={(e) => setUpscaleSettings({
              ...upscaleSettings,
              method: e.target.value
            })}
            className="w-full bg-[#1f1f1f] border border-gray-700 rounded px-3 py-2 text-white"
          >
            <option value="bicubic">Bicubic (Fast)</option>
            <option value="lanczos">Lanczos (High Quality)</option>
            <option value="super_resolution">Super Resolution (Enhanced)</option>
          </select>
        </div>

        <button
          onClick={handleUpscale}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
        >
          <ZoomIn size={18} />
          Upscale Image
        </button>
      </div>

      <div className="border-t border-gray-700"></div>

      {/* Smart Enhancement */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-purple-400" />
          <h3 className="font-medium text-white">Smart Enhancement</h3>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={enhanceSettings.denoise}
              onChange={(e) => setEnhanceSettings({
                ...enhanceSettings,
                denoise: e.target.checked
              })}
              className="rounded"
            />
            Denoise
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={enhanceSettings.sharpen}
              onChange={(e) => setEnhanceSettings({
                ...enhanceSettings,
                sharpen: e.target.checked
              })}
              className="rounded"
            />
            Sharpen
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={enhanceSettings.colorBalance}
              onChange={(e) => setEnhanceSettings({
                ...enhanceSettings,
                colorBalance: e.target.checked
              })}
              className="rounded"
            />
            Color Balance
          </label>
        </div>

        <button
          onClick={handleSmartEnhance}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
        >
          <Sparkles size={18} />
          Apply Smart Enhancement
        </button>
      </div>

      <div className="border-t border-gray-700"></div>

      {/* Noise Reduction */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Wand2 size={18} className="text-green-400" />
          <h3 className="font-medium text-white">Noise Reduction</h3>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Strength: {noiseSettings.strength}
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={noiseSettings.strength}
            onChange={(e) => setNoiseSettings({
              ...noiseSettings,
              strength: parseInt(e.target.value)
            })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Method</label>
          <select
            value={noiseSettings.method}
            onChange={(e) => setNoiseSettings({
              ...noiseSettings,
              method: e.target.value
            })}
            className="w-full bg-[#1f1f1f] border border-gray-700 rounded px-3 py-2 text-white"
          >
            <option value="nlm">Non-Local Means (Best)</option>
            <option value="bilateral">Bilateral (Edge-Preserving)</option>
            <option value="gaussian">Gaussian (Fastest)</option>
          </select>
        </div>

        <button
          onClick={handleNoiseReduction}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
        >
          <Wand2 size={18} />
          Reduce Noise
        </button>
      </div>

      <div className="border-t border-gray-700"></div>

      {/* Auto Exposure */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sun size={18} className="text-yellow-400" />
          <h3 className="font-medium text-white">Auto Exposure</h3>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Intensity: {exposureSettings.clipLimit.toFixed(1)}
          </label>
          <input
            type="range"
            min="1"
            max="4"
            step="0.1"
            value={exposureSettings.clipLimit}
            onChange={(e) => setExposureSettings({
              clipLimit: parseFloat(e.target.value)
            })}
            className="w-full"
          />
        </div>

        <button
          onClick={handleAutoExposure}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
        >
          <Sun size={18} />
          Auto Correct Exposure
        </button>
      </div>

      <div className="border-t border-gray-700"></div>

      {/* Object Removal */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Eraser size={18} className="text-red-400" />
          <h3 className="font-medium text-white">Object Removal</h3>
        </div>

        <p className="text-xs text-gray-400">
          Draw a mask over the object you want to remove using the brush tool
        </p>

        <button
          onClick={toggleObjectRemovalMode}
          className="w-full py-2 px-4 rounded flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white"
        >
          <Eraser size={18} />
          Draw & Remove Object
        </button>
      </div>

      <div className="border-t border-gray-700"></div>

      {/* Watermark Removal */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Droplet size={18} className="text-cyan-400" />
          <h3 className="font-medium text-white">Watermark Removal</h3>
        </div>

        <p className="text-xs text-gray-400">
          Automatically detect and remove watermarks in corners
        </p>

        <button
          onClick={handleRemoveWatermark}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
        >
          <Trash2 size={18} />
          Auto Remove Watermark
        </button>

        <button
          onClick={toggleWatermarkRemovalMode}
          className="w-full py-2 px-4 rounded flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white"
        >
          <Droplet size={18} />
          Manual Watermark Removal
        </button>
      </div>

      <div className="border-t border-gray-700"></div>

      {/* Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 Tip: All operations create new layers</p>
        <p>⚡ Processing may take a few seconds</p>
      </div>
    </div>
    </>
  );
};

export default AdvancedPanel;
