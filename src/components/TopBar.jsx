import React from 'react';
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Download, Upload, Save,
  Scissors, User, Type, Sticker, Layers, Settings
} from 'lucide-react';
import useEditorStore from '../store/editorStore';

const TopBar = ({ onExport, onNewImage }) => {
  const { 
    undo, redo, canUndo, canRedo, 
    zoom, setZoom, 
    isProcessing 
  } = useEditorStore();

  const handleZoomIn = () => setZoom(zoom * 1.2);
  const handleZoomOut = () => setZoom(zoom / 1.2);
  const handleZoomReset = () => setZoom(1);

  return (
    <div className="h-14 bg-editor-panel border-b border-editor-border flex items-center justify-between px-4">
      {/* Left side - Logo */}
      <div className="flex items-center space-x-3">
        <Scissors className="w-6 h-6" />
        <h1 className="text-xl font-bold">Image Editor</h1>
      </div>

      {/* Center - Main actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onNewImage}
          className="btn-icon"
          title="New Image"
          disabled={isProcessing}
        >
          <Upload className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-editor-border mx-2" />

        <button
          onClick={undo}
          className="btn-icon"
          disabled={!canUndo() || isProcessing}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-5 h-5" />
        </button>

        <button
          onClick={redo}
          className="btn-icon"
          disabled={!canRedo() || isProcessing}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-editor-border mx-2" />

        <button
          onClick={handleZoomOut}
          className="btn-icon"
          title="Zoom Out"
          disabled={isProcessing}
        >
          <ZoomOut className="w-5 h-5" />
        </button>

        <button
          onClick={handleZoomReset}
          className="btn-icon px-3"
          title="Reset Zoom"
          disabled={isProcessing}
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          onClick={handleZoomIn}
          className="btn-icon"
          title="Zoom In"
          disabled={isProcessing}
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>

      {/* Right side - Export */}
      <div className="flex items-center space-x-2">
        {isProcessing && (
          <div className="text-sm text-editor-accent mr-2">
            Processing...
          </div>
        )}
        
        <button
          onClick={onExport}
          className="btn-primary"
          disabled={isProcessing}
        >
          <Download className="w-4 h-4 mr-2 inline" />
          Export
        </button>
      </div>
    </div>
  );
};

export default TopBar;
