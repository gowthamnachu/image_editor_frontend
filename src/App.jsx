import React, { useState, useEffect, useRef } from 'react';
import TopBar from './components/TopBar';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import ImageUploader from './components/ImageUploader';
import LoadingOverlay from './components/LoadingOverlay';
import useEditorStore from './store/editorStore';

function App() {
  const { originalImage, layers, reset, isProcessing } = useEditorStore();
  const [showUploader, setShowUploader] = useState(true);
  const stageRef = useRef(null);

  useEffect(() => {
    setShowUploader(!originalImage);
  }, [originalImage]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          useEditorStore.getState().redo();
        } else {
          useEditorStore.getState().undo();
        }
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        useEditorStore.getState().redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExport = () => {
    // Get the stage
    const stage = stageRef.current?.getStage();
    if (!stage) {
      console.error('Stage not found');
      return;
    }

    try {
      // Export as data URL
      const dataURL = stage.toDataURL({ pixelRatio: 2 });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `edited-image-${Date.now()}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export image');
    }
  };

  const handleNewImage = () => {
    if (window.confirm('Start new project? Current work will be lost.')) {
      reset();
      setShowUploader(true);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-editor-bg text-white">
      <LoadingOverlay isVisible={isProcessing} message="Processing..." />
      
      <TopBar onExport={handleExport} onNewImage={handleNewImage} />
      
      <div className="flex-1 flex overflow-hidden">
        {showUploader ? (
          <ImageUploader />
        ) : (
          <>
            <Toolbar />
            <Canvas ref={stageRef} />
            <PropertiesPanel />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
