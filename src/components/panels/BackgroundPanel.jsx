import React, { useState } from 'react';
import { Wand2 } from 'lucide-react';

const BackgroundPanel = ({ onRemoveBackground, hasMask }) => {
  const [mode, setMode] = useState('transparent');
  const [color, setColor] = useState('#FFFFFF');
  const [gradientStart, setGradientStart] = useState('#000000');
  const [gradientEnd, setGradientEnd] = useState('#FFFFFF');
  const [gradientDirection, setGradientDirection] = useState('vertical');

  const handleApply = () => {
    const options = { mode };
    
    if (mode === 'color') {
      options.color = color;
    } else if (mode === 'gradient') {
      options.gradient = {
        start_color: gradientStart,
        end_color: gradientEnd,
        direction: gradientDirection,
      };
    }
    
    onRemoveBackground(options);
  };

  if (!hasMask) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Wand2 className="w-5 h-5 mr-2" />
          Background
        </h2>
        <div className="p-4 bg-editor-panel-light border border-editor-border rounded-md text-center">
          <p className="text-sm text-editor-accent">
            Please use "Detect Person" first to segment the image.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Wand2 className="w-5 h-5 mr-2" />
          Background
        </h2>
      </div>

      <div>
        <label className="text-sm block mb-2">Background Mode</label>
        <div className="space-y-2">
          {[
            { value: 'transparent', label: 'Transparent (PNG)' },
            { value: 'color', label: 'Solid Color' },
            { value: 'gradient', label: 'Gradient' },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-editor-highlight"
            >
              <input
                type="radio"
                name="bgMode"
                value={option.value}
                checked={mode === option.value}
                onChange={(e) => setMode(e.target.value)}
                className="w-4 h-4"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {mode === 'color' && (
        <div>
          <label className="text-sm block mb-2">Background Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="input-field flex-1"
            />
          </div>
        </div>
      )}

      {mode === 'gradient' && (
        <>
          <div>
            <label className="text-sm block mb-2">Start Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={gradientStart}
                onChange={(e) => setGradientStart(e.target.value)}
              />
              <input
                type="text"
                value={gradientStart}
                onChange={(e) => setGradientStart(e.target.value)}
                className="input-field flex-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm block mb-2">End Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={gradientEnd}
                onChange={(e) => setGradientEnd(e.target.value)}
              />
              <input
                type="text"
                value={gradientEnd}
                onChange={(e) => setGradientEnd(e.target.value)}
                className="input-field flex-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm block mb-2">Direction</label>
            <select
              value={gradientDirection}
              onChange={(e) => setGradientDirection(e.target.value)}
              className="input-field w-full"
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
              <option value="diagonal">Diagonal</option>
              <option value="radial">Radial</option>
            </select>
          </div>
        </>
      )}

      <button
        onClick={handleApply}
        className="w-full btn-primary"
      >
        Apply Background
      </button>
    </div>
  );
};

export default BackgroundPanel;
