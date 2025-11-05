import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer } from 'react-konva';
import useEditorStore from '../store/editorStore';
import useImage from '../hooks/useImage';

// Component to render a layer image
const LayerImage = ({ layer, isSelected, onSelect, onTransform }) => {
  const [image] = useImage(layer.data);
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={image}
        x={layer.x}
        y={layer.y}
        width={layer.width}
        height={layer.height}
        scaleX={layer.scaleX}
        scaleY={layer.scaleY}
        rotation={layer.rotation}
        opacity={layer.opacity}
        draggable={!layer.locked}
        visible={layer.visible}
        onClick={onSelect}
        onTap={onSelect}
        onDragMove={(e) => {
          onTransform({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onDragEnd={(e) => {
          onTransform({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          onTransform({
            x: node.x(),
            y: node.y(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && !layer.locked && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

// Component to render text layer
const LayerText = ({ layer, isSelected, onSelect, onTransform }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaText
        ref={shapeRef}
        text={layer.data.text}
        x={layer.x}
        y={layer.y}
        fontSize={layer.data.fontSize}
        fontFamily={layer.data.fontFamily || 'Arial'}
        fontStyle={`${layer.data.fontStyle || 'normal'} ${layer.data.fontWeight || 'normal'}`}
        fill={layer.data.color}
        align={layer.data.align || 'left'}
        width={layer.width}
        scaleX={layer.scaleX}
        scaleY={layer.scaleY}
        rotation={layer.rotation}
        opacity={layer.opacity}
        draggable={!layer.locked}
        visible={layer.visible}
        letterSpacing={layer.data.letterSpacing || 0}
        lineHeight={layer.data.lineHeight || 1.2}
        stroke={layer.data.stroke ? layer.data.strokeColor : undefined}
        strokeWidth={layer.data.stroke ? layer.data.strokeWidth : 0}
        shadowColor={layer.data.shadow ? layer.data.shadowColor : undefined}
        shadowBlur={layer.data.shadow ? layer.data.shadowBlur : 0}
        shadowOffsetX={layer.data.shadow ? layer.data.shadowOffsetX : 0}
        shadowOffsetY={layer.data.shadow ? layer.data.shadowOffsetY : 0}
        padding={layer.data.padding || 0}
        textDecoration={layer.data.textDecoration || ''}
        onClick={onSelect}
        onTap={onSelect}
        onDragMove={(e) => {
          onTransform({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onDragEnd={(e) => {
          onTransform({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          onTransform({
            x: node.x(),
            y: node.y(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && !layer.locked && (
        <Transformer ref={trRef} />
      )}
    </>
  );
};

const Canvas = forwardRef((props, ref) => {
  const {
    layers,
    selectedLayerId,
    setSelectedLayerId,
    updateLayer,
    zoom,
    panX,
    panY,
    setPan,
  } = useEditorStore();

  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Expose the stage ref to parent
  useImperativeHandle(ref, () => ({
    getStage: () => stageRef.current,
  }));

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleLayerSelect = (layerId) => {
    setSelectedLayerId(layerId);
  };

  const handleLayerTransform = (layerId, updates) => {
    updateLayer(layerId, updates);
  };

  const handleStageClick = (e) => {
    // Deselect when clicking on empty area
    if (e.target === e.target.getStage()) {
      setSelectedLayerId(null);
    }
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    stage.scale({ x: clampedScale, y: clampedScale });
    stage.position(newPos);
    stage.batchDraw();
  };

  // Calculate canvas size based on layers
  const canvasWidth = Math.max(
    dimensions.width,
    ...layers.map(l => (l.x + l.width) * (l.scaleX || 1))
  );
  const canvasHeight = Math.max(
    dimensions.height,
    ...layers.map(l => (l.y + l.height) * (l.scaleY || 1))
  );

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-editor-bg overflow-hidden relative"
      style={{ 
        backgroundImage: 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={zoom}
        scaleY={zoom}
        x={panX}
        y={panY}
        draggable
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTouchStart={handleStageClick}
      >
        <Layer>
          {layers.map((layer) => {
            const isSelected = layer.id === selectedLayerId;
            
            if (layer.type === 'text') {
              return (
                <LayerText
                  key={layer.id}
                  layer={layer}
                  isSelected={isSelected}
                  onSelect={() => handleLayerSelect(layer.id)}
                  onTransform={(updates) => handleLayerTransform(layer.id, updates)}
                />
              );
            } else {
              return (
                <LayerImage
                  key={layer.id}
                  layer={layer}
                  isSelected={isSelected}
                  onSelect={() => handleLayerSelect(layer.id)}
                  onTransform={(updates) => handleLayerTransform(layer.id, updates)}
                />
              );
            }
          })}
        </Layer>
      </Stage>
    </div>
  );
});

export default Canvas;
