import React from 'react';
import {
  MousePointer2, Type, Image as ImageIcon, Scissors, 
  Wand2, Sliders, Crop, Paintbrush, Layers, Sparkles
} from 'lucide-react';
import useEditorStore from '../store/editorStore';

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'segment', icon: Scissors, label: 'Detect Person' },
  { id: 'text', icon: Type, label: 'Add Text' },
  { id: 'layers', icon: Layers, label: 'Layers' },
  { id: 'background', icon: Wand2, label: 'Background' },
  { id: 'filters', icon: Sliders, label: 'Filters' },
  { id: 'advanced', icon: Sparkles, label: 'Advanced' },
  { id: 'crop', icon: Crop, label: 'Crop' },
];

const Toolbar = () => {
  const { activeTool, setActiveTool } = useEditorStore();

  return (
    <div className="w-16 bg-editor-panel border-r border-editor-border flex flex-col items-center py-4 space-y-2">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        
        return (
          <button
            key={tool.id}
            onClick={() => setActiveTool(isActive ? null : tool.id)}
            className={`btn-icon ${isActive ? 'active' : ''}`}
            title={tool.label}
          >
            <Icon className="w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
};

export default Toolbar;
