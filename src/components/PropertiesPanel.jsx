import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import useEditorStore from '../store/editorStore';
import { segmentPerson, placeTextBehind, removeBackground, advancedProcess } from '../api/api';
import SegmentPanel from './panels/SegmentPanel';
import TextPanel from './panels/TextPanel';
import BackgroundPanel from './panels/BackgroundPanel';
import FiltersPanel from './panels/FiltersPanel';
import LayersPanel from './panels/LayersPanel';
import AdvancedPanel from './panels/AdvancedPanel';
import CropPanel from './panels/CropPanel';

const PropertiesPanel = () => {
  const { 
    activeTool, 
    originalImage, 
    segmentationMask,
    setSegmentationMask,
    addLayer,
    layers,
    setIsProcessing,
    textProperties,
    setTextProperties,
  } = useEditorStore();
  
  const [error, setError] = useState(null);

  const handleSegment = async (threshold = 0.3) => {
    if (!originalImage) return;
    
    try {
      setError(null);
      setIsProcessing(true);
      
      // Remove data URL prefix
      const imageData = originalImage.replace(/^data:image\/\w+;base64,/, '');
      
      const result = await segmentPerson(imageData, threshold);
      const maskBase64 = `data:image/png;base64,${result.maskBase64}`;
      
      setSegmentationMask(maskBase64);
      setIsProcessing(false);
      
      // Show success message
      console.log(`Segmentation complete: ${result.method}, confidence: ${result.confidence}`);
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  const handleAddText = async (textOptions) => {
    if (!originalImage) return;
    
    try {
      setError(null);
      setIsProcessing(true);
      
      if (textOptions.placeBehindPerson && segmentationMask) {
        // Server-side rendering for text behind person
        const result = await placeTextBehind(
          originalImage,
          segmentationMask,
          textOptions
        );
        
        const resultBase64 = `data:image/png;base64,${result.resultBase64}`;
        
        // Add as new layer
        const img = new Image();
        img.onload = () => {
          addLayer({
            type: 'image',
            name: 'Text Behind Person',
            data: resultBase64,
            width: img.width,
            height: img.height,
            x: 0,
            y: 0,
          });
          setIsProcessing(false);
        };
        img.src = resultBase64;
      } else {
        // Client-side text layer with all properties
        addLayer({
          type: 'text',
          name: 'Text Layer',
          data: {
            text: textOptions.text,
            fontSize: textOptions.fontSize,
            fontFamily: textOptions.fontFamily || 'Arial',
            fontWeight: textOptions.fontWeight || 'normal',
            fontStyle: textOptions.fontStyle || 'normal',
            color: textOptions.color,
            align: textOptions.align,
            stroke: textOptions.stroke,
            strokeColor: textOptions.strokeColor,
            strokeWidth: textOptions.strokeWidth,
            shadow: textOptions.shadow,
            shadowColor: textOptions.shadowColor,
            shadowBlur: textOptions.shadowBlur,
            shadowOffsetX: textOptions.shadowOffsetX,
            shadowOffsetY: textOptions.shadowOffsetY,
            backgroundColor: textOptions.backgroundColor,
            padding: textOptions.padding,
            letterSpacing: textOptions.letterSpacing,
            lineHeight: textOptions.lineHeight,
            textDecoration: textOptions.textDecoration,
            textTransform: textOptions.textTransform,
          },
          x: textOptions.x || 100,
          y: textOptions.y || 200,
          width: 500,
          height: 200,
        });
        setIsProcessing(false);
      }
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  const handleRemoveBackground = async (options) => {
    if (!originalImage || !segmentationMask) return;
    
    try {
      setError(null);
      setIsProcessing(true);
      
      const result = await removeBackground(originalImage, segmentationMask, options);
      const resultBase64 = `data:image/png;base64,${result.resultBase64}`;
      
      // Add as new layer
      const img = new Image();
      img.onload = () => {
        addLayer({
          type: 'image',
          name: 'Background Removed',
          data: resultBase64,
          width: img.width,
          height: img.height,
          x: 0,
          y: 0,
        });
        setIsProcessing(false);
      };
      img.src = resultBase64;
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  const handleApplyFilters = async (filterOps) => {
    const backgroundLayer = layers.find(l => l.type === 'background');
    if (!backgroundLayer) return;
    
    try {
      setError(null);
      setIsProcessing(true);
      
      const result = await advancedProcess(backgroundLayer.data, filterOps);
      const resultBase64 = `data:image/png;base64,${result.resultBase64}`;
      
      // Update background layer
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
        setIsProcessing(false);
      };
      img.src = resultBase64;
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  const renderPanel = () => {
    switch (activeTool) {
      case 'segment':
        return (
          <SegmentPanel 
            onSegment={handleSegment}
            hasMask={!!segmentationMask}
          />
        );
      
      case 'text':
        return (
          <TextPanel 
            onAddText={handleAddText}
            textProperties={textProperties}
            setTextProperties={setTextProperties}
            hasMask={!!segmentationMask}
          />
        );
      
      case 'background':
        return (
          <BackgroundPanel 
            onRemoveBackground={handleRemoveBackground}
            hasMask={!!segmentationMask}
          />
        );
      
      case 'filters':
        return <FiltersPanel />;
      
      case 'crop':
        return <CropPanel />;
      
      case 'advanced':
        return <AdvancedPanel />;
      
      case 'layers':
        return <LayersPanel />;
      
      default:
        return <LayersPanel />;
    }
  };

  return (
    <div className="w-80 bg-editor-panel border-l border-editor-border flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="m-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}
        
        {renderPanel()}
      </div>
    </div>
  );
};

export default PropertiesPanel;
