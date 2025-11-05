import React, { useState } from 'react';
import { Sliders } from 'lucide-react';
import useEditorStore from '../../store/editorStore';
import { advancedProcess } from '../../api/api';
import BeforeAfterSlider from '../BeforeAfterSlider';

const FiltersPanel = () => {
  const { 
    filterProperties, 
    setFilterProperties, 
    originalImage, 
    setIsProcessing,
    updateOriginalImage,
    addLayer
  } = useEditorStore();
  
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [beforeAfterImages, setBeforeAfterImages] = useState({ before: null, after: null });

  const handleApply = async () => {
    if (!originalImage) {
      alert('Please load an image first');
      return;
    }

    const ops = [];
    
    if (filterProperties.brightness !== 0 || filterProperties.contrast !== 1) {
      ops.push({
        op: 'brightness_contrast',
        params: {
          brightness: filterProperties.brightness,
          contrast: filterProperties.contrast,
        },
      });
    }
    
    if (filterProperties.saturation !== 1) {
      ops.push({
        op: 'saturation',
        params: {
          saturation: filterProperties.saturation,
        },
      });
    }
    
    if (filterProperties.blur > 0) {
      ops.push({
        op: 'blur',
        params: {
          amount: filterProperties.blur,
        },
      });
    }
    
    if (filterProperties.vignette > 0) {
      ops.push({
        op: 'vignette',
        params: {
          intensity: filterProperties.vignette,
        },
      });
    }
    
    if (ops.length === 0) {
      alert('No filters to apply');
      return;
    }

    try {
      setIsProcessing(true);
      const result = await advancedProcess(originalImage, ops);
      const resultBase64 = `data:image/png;base64,${result.resultBase64}`;
      
      // Show before/after comparison
      setBeforeAfterImages({
        before: originalImage,
        after: resultBase64
      });
      setShowBeforeAfter(true);
      
      // Add as new layer
      const img = new Image();
      img.onload = () => {
        addLayer({
          type: 'image',
          name: 'Filtered',
          data: resultBase64,
          width: img.width,
          height: img.height,
          x: 0,
          y: 0,
        });
      };
      img.src = resultBase64;
      
    } catch (error) {
      alert(`❌ Filter failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFilterProperties({
      brightness: 0,
      contrast: 1,
      saturation: 1,
      blur: 0,
      vignette: 0,
    });
  };

  return (
    <>
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
      
      <div className="p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Sliders className="w-5 h-5 mr-2" />
          Filters
        </h2>
      </div>

      <div>
        <label className="text-sm block mb-2">
          Brightness: {filterProperties.brightness}
        </label>
        <input
          type="range"
          min="-100"
          max="100"
          value={filterProperties.brightness}
          onChange={(e) => setFilterProperties({ brightness: parseInt(e.target.value) })}
        />
      </div>

      <div>
        <label className="text-sm block mb-2">
          Contrast: {filterProperties.contrast.toFixed(2)}
        </label>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={filterProperties.contrast}
          onChange={(e) => setFilterProperties({ contrast: parseFloat(e.target.value) })}
        />
      </div>

      <div>
        <label className="text-sm block mb-2">
          Saturation: {filterProperties.saturation.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={filterProperties.saturation}
          onChange={(e) => setFilterProperties({ saturation: parseFloat(e.target.value) })}
        />
      </div>

      <div>
        <label className="text-sm block mb-2">
          Blur: {filterProperties.blur}
        </label>
        <input
          type="range"
          min="0"
          max="20"
          value={filterProperties.blur}
          onChange={(e) => setFilterProperties({ blur: parseInt(e.target.value) })}
        />
      </div>

      <div>
        <label className="text-sm block mb-2">
          Vignette: {filterProperties.vignette.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={filterProperties.vignette}
          onChange={(e) => setFilterProperties({ vignette: parseFloat(e.target.value) })}
        />
      </div>

      <div className="flex space-x-2">
        <button onClick={handleReset} className="flex-1 btn-secondary">
          Reset
        </button>
        <button onClick={handleApply} className="flex-1 btn-primary">
          Apply Filters
        </button>
      </div>

      <div className="pt-4 border-t border-editor-border">
        <h3 className="text-sm font-semibold mb-2">Quick Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setFilterProperties({
                brightness: 0,
                contrast: 1.2,
                saturation: 1.3,
                blur: 0,
                vignette: 0,
              });
            }}
            className="btn-secondary text-sm py-2"
          >
            Vivid
          </button>
          <button
            onClick={() => {
              setFilterProperties({
                brightness: 10,
                contrast: 0.9,
                saturation: 0.7,
                blur: 0,
                vignette: 0.3,
              });
            }}
            className="btn-secondary text-sm py-2"
          >
            Vintage
          </button>
          <button
            onClick={() => {
              setFilterProperties({
                brightness: -10,
                contrast: 1.3,
                saturation: 0.8,
                blur: 0,
                vignette: 0.4,
              });
            }}
            className="btn-secondary text-sm py-2"
          >
            Drama
          </button>
          <button
            onClick={() => {
              setFilterProperties({
                brightness: 0,
                contrast: 1,
                saturation: 0,
                blur: 0,
                vignette: 0,
              });
            }}
            className="btn-secondary text-sm py-2"
          >
            B&W
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default FiltersPanel;
