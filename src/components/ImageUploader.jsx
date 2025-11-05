import React, { useState, useCallback } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import useEditorStore from '../store/editorStore';
import { imageToBase64 } from '../api/api';

const ImageUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const setOriginalImage = useEditorStore((state) => state.setOriginalImage);
  const setLayers = useEditorStore((state) => state.setLayers);
  const pushToHistory = useEditorStore((state) => state.pushToHistory);

  const handleFile = useCallback(async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 12MB)
    if (file.size > 12 * 1024 * 1024) {
      setError('Image size must be less than 12MB');
      return;
    }

    try {
      setError(null);
      const base64 = await imageToBase64(file);
      
      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalImage(base64);
        
        // Create initial background layer
        setLayers([{
          id: 'background',
          type: 'background',
          name: 'Background',
          visible: true,
          locked: false,
          opacity: 1,
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
          data: base64,
        }]);
        
        pushToHistory();
      };
      img.src = base64;
    } catch (err) {
      console.error('Error loading image:', err);
      setError('Failed to load image');
    }
  }, [setOriginalImage, setLayers, pushToHistory]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    handleFile(file);
  }, [handleFile]);

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div
        className={`w-full max-w-2xl border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging ? 'border-editor-accent bg-editor-panel-light' : 'border-editor-border'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-16 h-16 mx-auto mb-4 text-editor-accent" />
        <h2 className="text-2xl font-semibold mb-2">Upload an Image</h2>
        <p className="text-editor-accent mb-6">
          Drag and drop an image here, or click to select
        </p>
        
        <label className="btn-primary inline-block cursor-pointer">
          Select Image
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
        
        {error && (
          <div className="mt-4 flex items-center justify-center text-red-500">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        <p className="mt-6 text-sm text-editor-accent">
          Supported formats: PNG, JPEG • Max size: 12MB
        </p>
      </div>
    </div>
  );
};

export default ImageUploader;
