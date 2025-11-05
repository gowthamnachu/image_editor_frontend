import React, { useState } from 'react';
import { Crop, Square, Maximize, Monitor, Smartphone, Layout, Check, X } from 'lucide-react';
import useEditorStore from '../../store/editorStore';

const CropPanel = () => {
  const { 
    originalImage,
    uncroppedImage,
    updateOriginalImage,
    addLayer,
    setIsProcessing,
  } = useEditorStore();

  const [cropSettings, setCropSettings] = useState({
    aspectRatio: 'free', // 'free', '1:1', '4:3', '16:9', '9:16', '3:4', 'custom'
    width: 1000,
    height: 1000,
    x: 0,
    y: 0,
    maintainAspect: false,
  });

  // Aspect ratio presets
  const aspectRatios = [
    { id: 'free', label: 'Free', icon: Maximize, ratio: null },
    { id: '1:1', label: 'Square (1:1)', icon: Square, ratio: 1 },
    { id: '4:3', label: 'Standard (4:3)', icon: Monitor, ratio: 4/3 },
    { id: '16:9', label: 'Widescreen (16:9)', icon: Monitor, ratio: 16/9 },
    { id: '9:16', label: 'Portrait (9:16)', icon: Smartphone, ratio: 9/16 },
    { id: '3:4', label: 'Portrait (3:4)', icon: Smartphone, ratio: 3/4 },
    { id: '21:9', label: 'Ultrawide (21:9)', icon: Layout, ratio: 21/9 },
    { id: '2:3', label: 'Classic (2:3)', icon: Layout, ratio: 2/3 },
  ];

  // Common size presets
  const sizePresets = [
    { name: 'Instagram Square', width: 1080, height: 1080 },
    { name: 'Instagram Portrait', width: 1080, height: 1350 },
    { name: 'Instagram Story', width: 1080, height: 1920 },
    { name: 'Facebook Post', width: 1200, height: 630 },
    { name: 'Twitter Post', width: 1200, height: 675 },
    { name: 'YouTube Thumbnail', width: 1280, height: 720 },
    { name: 'LinkedIn Post', width: 1200, height: 627 },
    { name: 'Pinterest Pin', width: 1000, height: 1500 },
    { name: 'HD (1080p)', width: 1920, height: 1080 },
    { name: '4K', width: 3840, height: 2160 },
    { name: 'A4 Portrait', width: 2480, height: 3508 },
    { name: 'A4 Landscape', width: 3508, height: 2480 },
  ];

  const handleAspectRatioChange = (aspectId) => {
    // Use uncropped image as the source, fallback to original if not available
    const sourceImage = uncroppedImage || originalImage;
    if (!sourceImage) return;

    const selected = aspectRatios.find(ar => ar.id === aspectId);
    
    // Load image to get actual dimensions
    const img = new Image();
    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;

      if (selected && selected.ratio) {
        // Calculate best fit crop dimensions for the selected aspect ratio
        let cropWidth, cropHeight;
        
        // Calculate dimensions to fill the aspect ratio (crop to fit)
        const imageRatio = imgWidth / imgHeight;
        
        if (imageRatio > selected.ratio) {
          // Image is wider - crop width
          cropHeight = imgHeight;
          cropWidth = Math.round(cropHeight * selected.ratio);
        } else {
          // Image is taller - crop height
          cropWidth = imgWidth;
          cropHeight = Math.round(cropWidth / selected.ratio);
        }

        // Center the crop
        const centerX = Math.max(0, Math.floor((imgWidth - cropWidth) / 2));
        const centerY = Math.max(0, Math.floor((imgHeight - cropHeight) / 2));

        setCropSettings({
          aspectRatio: aspectId,
          width: cropWidth,
          height: cropHeight,
          x: centerX,
          y: centerY,
          maintainAspect: true,
        });

        // Auto-apply the crop
        applyCropWithSettings(img, cropWidth, cropHeight, centerX, centerY);
      } else {
        // Free aspect ratio - use full image
        setCropSettings({
          aspectRatio: aspectId,
          width: imgWidth,
          height: imgHeight,
          x: 0,
          y: 0,
          maintainAspect: false,
        });
        
        // For free aspect, restore the full uncropped image
        updateOriginalImage(sourceImage);
      }
    };
    img.src = sourceImage;
  };

  const handleWidthChange = (width) => {
    const selected = aspectRatios.find(ar => ar.id === cropSettings.aspectRatio);
    if (selected && selected.ratio && cropSettings.maintainAspect) {
      setCropSettings(prev => ({
        ...prev,
        width: parseInt(width),
        height: Math.round(parseInt(width) / selected.ratio),
      }));
    } else {
      setCropSettings(prev => ({ ...prev, width: parseInt(width) }));
    }
  };

  const handleHeightChange = (height) => {
    const selected = aspectRatios.find(ar => ar.id === cropSettings.aspectRatio);
    if (selected && selected.ratio && cropSettings.maintainAspect) {
      setCropSettings(prev => ({
        ...prev,
        height: parseInt(height),
        width: Math.round(parseInt(height) * selected.ratio),
      }));
    } else {
      setCropSettings(prev => ({ ...prev, height: parseInt(height) }));
    }
  };

  const handlePresetSelect = (preset) => {
    // Use uncropped image as the source, fallback to original if not available
    const sourceImage = uncroppedImage || originalImage;
    if (!sourceImage) return;

    const img = new Image();
    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;

      // Use preset dimensions, but ensure they don't exceed image dimensions
      const cropWidth = Math.min(preset.width, imgWidth);
      const cropHeight = Math.min(preset.height, imgHeight);

      // Center the crop
      const centerX = Math.max(0, Math.floor((imgWidth - cropWidth) / 2));
      const centerY = Math.max(0, Math.floor((imgHeight - cropHeight) / 2));

      setCropSettings({
        aspectRatio: 'custom',
        width: cropWidth,
        height: cropHeight,
        x: centerX,
        y: centerY,
        maintainAspect: false,
      });

      // Auto-apply the crop
      applyCropWithSettings(img, cropWidth, cropHeight, centerX, centerY);
    };
    img.src = sourceImage;
  };

  const applyCropWithSettings = (img, cropWidth, cropHeight, cropX, cropY) => {
    try {
      setIsProcessing(true);

      // Create canvas for cropping
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Calculate actual crop dimensions
      const actualCropWidth = Math.min(cropWidth, img.width - cropX);
      const actualCropHeight = Math.min(cropHeight, img.height - cropY);
      const actualCropX = Math.max(0, Math.min(cropX, img.width - actualCropWidth));
      const actualCropY = Math.max(0, Math.min(cropY, img.height - actualCropHeight));

      canvas.width = actualCropWidth;
      canvas.height = actualCropHeight;

      // Draw cropped image
      ctx.drawImage(
        img,
        actualCropX, actualCropY, actualCropWidth, actualCropHeight,
        0, 0, actualCropWidth, actualCropHeight
      );

      const croppedImage = canvas.toDataURL('image/png');

      // Directly update the original image
      updateOriginalImage(croppedImage);

      setIsProcessing(false);
    } catch (error) {
      alert(`❌ Crop failed: ${error.message}`);
      setIsProcessing(false);
    }
  };

  const handleCrop = async () => {
    // Use uncropped image as the source, fallback to original if not available
    const sourceImage = uncroppedImage || originalImage;
    if (!sourceImage) {
      alert('Please load an image first');
      return;
    }

    const img = new Image();
    img.onload = () => {
      applyCropWithSettings(img, cropSettings.width, cropSettings.height, cropSettings.x, cropSettings.y);
    };

    img.onerror = () => {
      alert('Failed to load image for cropping');
      setIsProcessing(false);
    };

    img.src = sourceImage;
  };

  const handleCenterCrop = () => {
    // Use uncropped image as the source, fallback to original if not available
    const sourceImage = uncroppedImage || originalImage;
    if (!sourceImage) return;

    const img = new Image();
    img.onload = () => {
      const centerX = Math.max(0, Math.floor((img.width - cropSettings.width) / 2));
      const centerY = Math.max(0, Math.floor((img.height - cropSettings.height) / 2));
      
      setCropSettings(prev => ({
        ...prev,
        x: centerX,
        y: centerY,
      }));
    };
    img.src = sourceImage;
  };

  return (
    <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Crop className="w-5 h-5 mr-2" />
            Crop Image
          </h2>
        </div>

        {/* Aspect Ratio Selection */}
        <div>
          <label className="text-sm font-medium block mb-3">Aspect Ratio</label>
          <div className="grid grid-cols-2 gap-2">
            {aspectRatios.map((ratio) => {
              const Icon = ratio.icon;
              return (
                <button
                  key={ratio.id}
                  onClick={() => handleAspectRatioChange(ratio.id)}
                  className={`p-3 rounded-md border text-left transition-colors ${
                    cropSettings.aspectRatio === ratio.id
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-editor-panel-light border-editor-border hover:bg-editor-highlight'
                  }`}
                >
                  <Icon size={16} className="mb-1" />
                  <div className="text-xs">{ratio.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-3">
          <label className="text-sm font-medium block">Dimensions</label>
          
          <div>
            <label className="text-xs text-gray-400 block mb-1">Width (px)</label>
            <input
              type="number"
              min="1"
              value={cropSettings.width}
              onChange={(e) => handleWidthChange(e.target.value)}
              className="w-full bg-editor-panel border border-editor-border rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Height (px)</label>
            <input
              type="number"
              min="1"
              value={cropSettings.height}
              onChange={(e) => handleHeightChange(e.target.value)}
              className="w-full bg-editor-panel border border-editor-border rounded px-3 py-2 text-white"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={cropSettings.maintainAspect}
              onChange={(e) => setCropSettings(prev => ({ ...prev, maintainAspect: e.target.checked }))}
              className="rounded"
            />
            Lock aspect ratio
          </label>
        </div>

        {/* Position */}
        <div className="space-y-3">
          <label className="text-sm font-medium block">Position</label>
          
          <div>
            <label className="text-xs text-gray-400 block mb-1">X Offset (px)</label>
            <input
              type="number"
              min="0"
              value={cropSettings.x}
              onChange={(e) => setCropSettings(prev => ({ ...prev, x: parseInt(e.target.value) }))}
              className="w-full bg-editor-panel border border-editor-border rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Y Offset (px)</label>
            <input
              type="number"
              min="0"
              value={cropSettings.y}
              onChange={(e) => setCropSettings(prev => ({ ...prev, y: parseInt(e.target.value) }))}
              className="w-full bg-editor-panel border border-editor-border rounded px-3 py-2 text-white"
            />
          </div>

          <button
            onClick={handleCenterCrop}
            className="w-full btn-secondary text-sm"
          >
            Center Crop
          </button>
        </div>

        {/* Size Presets */}
        <div>
          <label className="text-sm font-medium block mb-3">Popular Sizes</label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sizePresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetSelect(preset)}
                className="w-full p-2 text-left rounded-md bg-editor-panel-light hover:bg-editor-highlight border border-editor-border transition-colors"
              >
                <div className="text-sm font-medium">{preset.name}</div>
                <div className="text-xs text-gray-400">{preset.width} × {preset.height}px</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setCropSettings({
              aspectRatio: 'free',
              width: 1000,
              height: 1000,
              x: 0,
              y: 0,
              maintainAspect: false,
            })}
            className="flex-1 btn-secondary"
          >
            Reset
          </button>
          <button
            onClick={handleCrop}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
          >
            <Crop size={18} />
            Apply Crop
          </button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 Tip: Select aspect ratio first, then adjust dimensions</p>
          <p>⚡ Use presets for common social media sizes</p>
        </div>
      </div>
  );
};

export default CropPanel;
