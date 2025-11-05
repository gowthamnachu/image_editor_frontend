import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Check } from 'lucide-react';

const BeforeAfterSlider = ({ beforeImage, afterImage, onClose, onApply }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    updateSliderPosition(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    updateSliderPosition(e.touches[0].clientX);
  };

  const updateSliderPosition = (clientX) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1f1f1f] border border-gray-700 rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Before / After Comparison</h2>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-400">
          💡 Drag the slider left and right to compare the images
        </div>

        <div
          ref={containerRef}
          className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden cursor-col-resize select-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          {/* After Image (Full) */}
          <div className="absolute inset-0">
            <img
              src={afterImage}
              alt="After"
              className="w-full h-full object-contain"
              draggable={false}
            />
            <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              AFTER
            </div>
          </div>

          {/* Before Image (Clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={beforeImage}
              alt="Before"
              className="w-full h-full object-contain"
              draggable={false}
            />
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              BEFORE
            </div>
          </div>

          {/* Slider Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Slider Handle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
              <div className="flex gap-1">
                <div className="w-1 h-6 bg-gray-800"></div>
                <div className="w-1 h-6 bg-gray-800"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => setSliderPosition(0)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Show Before
          </button>
          <button
            onClick={() => setSliderPosition(50)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded"
          >
            50/50
          </button>
          <button
            onClick={() => setSliderPosition(100)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            Show After
          </button>
        </div>

        {onApply && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onApply(afterImage);
                onClose();
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded font-medium flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Apply Changes to Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
