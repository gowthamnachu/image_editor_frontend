import React from 'react';
import { 
  Layers, Eye, EyeOff, Lock, Unlock, Trash2, 
  ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, Copy
} from 'lucide-react';
import useEditorStore from '../../store/editorStore';

const LayersPanel = () => {
  const { 
    layers, 
    selectedLayerId, 
    setSelectedLayerId,
    updateLayer,
    deleteLayer,
    moveLayerUp,
    moveLayerDown,
    moveLayerToTop,
    moveLayerToBottom,
    duplicateLayer,
  } = useEditorStore();

  const handleToggleVisibility = (layerId) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      updateLayer(layerId, { visible: !layer.visible });
    }
  };

  const handleToggleLock = (layerId) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      updateLayer(layerId, { locked: !layer.locked });
    }
  };

  const handleDelete = (layerId) => {
    if (window.confirm('Delete this layer?')) {
      deleteLayer(layerId);
    }
  };

  const handleOpacityChange = (layerId, opacity) => {
    updateLayer(layerId, { opacity: parseFloat(opacity) });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Layers className="w-5 h-5 mr-2" />
          Layers ({layers.length})
        </h2>
      </div>

      {layers.length === 0 ? (
        <div className="p-4 bg-editor-panel-light border border-editor-border rounded-md text-center">
          <p className="text-sm text-editor-accent">
            No layers yet. Upload an image to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...layers].reverse().map((layer, idx) => {
            const isSelected = layer.id === selectedLayerId;
            const displayName = layer.name || `${layer.type} ${layers.length - idx}`;
            const actualIndex = layers.length - 1 - idx;
            const canMoveUp = actualIndex < layers.length - 1;
            const canMoveDown = actualIndex > 0;
            
            return (
              <div
                key={layer.id}
                className={`layer-item ${isSelected ? 'active' : ''}`}
              >
                <div className="flex items-start space-x-2 w-full">
                  {/* Layer reordering buttons */}
                  <div className="flex flex-col space-y-1 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayerToTop(layer.id);
                      }}
                      disabled={!canMoveUp}
                      className="btn-icon p-0.5 disabled:opacity-30"
                      title="Move to Top"
                    >
                      <ChevronsUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayerUp(layer.id);
                      }}
                      disabled={!canMoveUp}
                      className="btn-icon p-0.5 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayerDown(layer.id);
                      }}
                      disabled={!canMoveDown}
                      className="btn-icon p-0.5 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayerToBottom(layer.id);
                      }}
                      disabled={!canMoveDown}
                      className="btn-icon p-0.5 disabled:opacity-30"
                      title="Move to Bottom"
                    >
                      <ChevronsDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Layer info and controls */}
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setSelectedLayerId(layer.id)}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium truncate">
                        {displayName}
                      </span>
                      <span className="text-xs text-editor-accent px-1.5 py-0.5 bg-editor-bg rounded">
                        {layer.type}
                      </span>
                    </div>
                    
                    {isSelected && (
                      <div className="mt-2">
                        <label className="text-xs text-editor-accent block mb-1">
                          Opacity: {Math.round(layer.opacity * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={layer.opacity}
                          onChange={(e) => handleOpacityChange(layer.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(layer.id);
                      }}
                      className="btn-icon p-1"
                      title={layer.visible ? 'Hide' : 'Show'}
                    >
                      {layer.visible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLock(layer.id);
                      }}
                      className="btn-icon p-1"
                      title={layer.locked ? 'Unlock' : 'Lock'}
                    >
                      {layer.locked ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <Unlock className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateLayer(layer.id);
                      }}
                      className="btn-icon p-1"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {layer.type !== 'background' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(layer.id);
                        }}
                        className="btn-icon p-1 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-4 border-t border-editor-border">
        <h3 className="text-sm font-semibold mb-2">Layer Controls</h3>
        <ul className="text-xs text-editor-accent space-y-1">
          <li>• Click to select a layer</li>
          <li>• Use arrows to reorder layers</li>
          <li>• Drag on canvas to reposition</li>
          <li>• Adjust opacity for transparency</li>
          <li>• Toggle visibility (eye icon)</li>
          <li>• Lock to prevent edits</li>
          <li>• Duplicate with copy icon</li>
        </ul>
      </div>
    </div>
  );
};

export default LayersPanel;
