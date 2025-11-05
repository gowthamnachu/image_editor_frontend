import React, { useRef, useEffect, useState } from 'react';
import { Eraser, RotateCcw, Check, X } from 'lucide-react';

const BrushCanvas = ({ imageBase64, onMaskComplete, onCancel, title = "Draw Mask" }) => {
  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size to match image
      const maxWidth = 800;
      const maxHeight = 600;
      let width = img.width;
      let height = img.height;

      // Scale down if too large
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;
      maskCanvas.width = width;
      maskCanvas.height = height;

      // Draw image on main canvas
      ctx.drawImage(img, 0, 0, width, height);
      
      // Initialize mask canvas with black
      maskCtx.fillStyle = 'black';
      maskCtx.fillRect(0, 0, width, height);
      
      setOriginalImage(img);
      setImageLoaded(true);
    };

    img.src = imageBase64;
  }, [imageBase64]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;

    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    let x, y;
    if (e.type.includes('touch')) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Draw on display canvas (red for visibility)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw on mask canvas (white on black)
    maskCtx.fillStyle = 'white';
    maskCtx.strokeStyle = 'white';
    maskCtx.lineWidth = brushSize;
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';

    if (e.type === 'mousedown' || e.type === 'touchstart') {
      // Display canvas
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Mask canvas
      maskCtx.beginPath();
      maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      maskCtx.fill();
    } else {
      // Display canvas
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      // Mask canvas
      maskCtx.lineTo(x, y);
      maskCtx.stroke();
      maskCtx.beginPath();
      maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      maskCtx.fill();
      maskCtx.beginPath();
      maskCtx.moveTo(x, y);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    
    // Redraw original image
    if (originalImage) {
      ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    }
    
    // Reset mask to black
    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
  };

  const handleComplete = () => {
    const maskCanvas = maskCanvasRef.current;
    
    // Convert mask to base64
    const maskBase64 = maskCanvas.toDataURL('image/png');
    onMaskComplete(maskBase64);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1f1f1f] border border-gray-700 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
        
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">
              Brush Size: {brushSize}px
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-48"
            />
          </div>
          
          <div className="text-sm text-gray-400">
            💡 Draw over the area you want to remove/mark (shows in red)
          </div>
        </div>

        <div className="mb-4 border border-gray-700 rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center p-4">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="max-w-full cursor-crosshair"
            style={{ touchAction: 'none' }}
          />
          {/* Hidden mask canvas */}
          <canvas
            ref={maskCanvasRef}
            style={{ display: 'none' }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={clearCanvas}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Clear
          </button>
          
          <button
            onClick={onCancel}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center justify-center gap-2"
          >
            <X size={18} />
            Cancel
          </button>
          
          <button
            onClick={handleComplete}
            disabled={!imageLoaded}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={18} />
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrushCanvas;
