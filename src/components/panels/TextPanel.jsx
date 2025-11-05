import React, { useState } from 'react';
import { Type, Bold, Italic, Underline, Strikethrough, Palette, Droplet } from 'lucide-react';

// Popular font families
const FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New',
  'Verdana', 'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS',
  'Brush Script MT', 'Lucida Console', 'Palatino', 'Garamond', 'Book Antiqua',
];

// Preset color palettes
const COLOR_PRESETS = [
  ['#FFFFFF', '#000000', '#808080', '#C0C0C0'],
  ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
  ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
  ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9'],
  ['#2C3E50', '#34495E', '#E74C3C', '#3498DB'],
  ['#FF1493', '#9370DB', '#00CED1', '#FFD700'],
];

const TextPanel = ({ onAddText, textProperties, setTextProperties, hasMask }) => {
  const [localText, setLocalText] = useState(textProperties.text);

  const handleAdd = () => {
    onAddText({
      ...textProperties,
      text: localText,
      x: 100,
      y: 200,
    });
  };

  const toggleBold = () => {
    setTextProperties({ 
      fontWeight: textProperties.fontWeight === 'bold' ? 'normal' : 'bold' 
    });
  };

  const toggleItalic = () => {
    setTextProperties({ 
      fontStyle: textProperties.fontStyle === 'italic' ? 'normal' : 'italic' 
    });
  };

  const toggleStroke = () => {
    setTextProperties({ stroke: !textProperties.stroke });
  };

  const toggleShadow = () => {
    setTextProperties({ shadow: !textProperties.shadow });
  };

  return (
    <div className="p-4 space-y-4 max-h-full overflow-y-auto">
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Type className="w-5 h-5 mr-2" />
          Text Styles
        </h2>
      </div>

      {/* Text Content */}
      <div>
        <label className="text-sm block mb-2 font-medium">Text Content</label>
        <textarea
          value={localText}
          onChange={(e) => {
            setLocalText(e.target.value);
            setTextProperties({ text: e.target.value });
          }}
          className="input-field w-full h-20 resize-none"
          placeholder="Enter your text..."
        />
      </div>

      {/* Font Selection */}
      <div>
        <label className="text-sm block mb-2 font-medium">Font Family</label>
        <select
          value={textProperties.fontFamily}
          onChange={(e) => setTextProperties({ fontFamily: e.target.value })}
          className="input-field w-full"
        >
          {FONTS.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label className="text-sm block mb-2 font-medium">
          Font Size: <span className="text-editor-accent">{textProperties.fontSize}px</span>
        </label>
        <input
          type="range"
          min="12"
          max="200"
          value={textProperties.fontSize}
          onChange={(e) => setTextProperties({ fontSize: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Text Style Buttons */}
      <div>
        <label className="text-sm block mb-2 font-medium">Text Style</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={toggleBold}
            className={`btn-icon flex items-center justify-center space-x-1 ${
              textProperties.fontWeight === 'bold' ? 'active' : ''
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
            <span className="text-xs">Bold</span>
          </button>
          <button
            onClick={toggleItalic}
            className={`btn-icon flex items-center justify-center space-x-1 ${
              textProperties.fontStyle === 'italic' ? 'active' : ''
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
            <span className="text-xs">Italic</span>
          </button>
        </div>
      </div>

      {/* Text Color */}
      <div>
        <label className="text-sm block mb-2 font-medium flex items-center">
          <Palette className="w-4 h-4 mr-1" />
          Text Color
        </label>
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="color"
            value={textProperties.color}
            onChange={(e) => setTextProperties({ color: e.target.value })}
            className="w-12 h-12"
          />
          <input
            type="text"
            value={textProperties.color}
            onChange={(e) => setTextProperties({ color: e.target.value })}
            className="input-field flex-1"
            placeholder="#FFFFFF"
          />
        </div>
        {/* Color Presets */}
        <div className="grid grid-cols-8 gap-1">
          {COLOR_PRESETS.flat().map((color, idx) => (
            <button
              key={idx}
              onClick={() => setTextProperties({ color })}
              className="w-8 h-8 rounded border-2 border-editor-border hover:border-editor-accent transition-colors"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Alignment */}
      <div>
        <label className="text-sm block mb-2 font-medium">Alignment</label>
        <div className="grid grid-cols-3 gap-2">
          {['left', 'center', 'right'].map((align) => (
            <button
              key={align}
              onClick={() => setTextProperties({ align })}
              className={`py-2 rounded-md border transition-colors ${
                textProperties.align === align
                  ? 'border-editor-accent bg-editor-accent/20'
                  : 'border-editor-border hover:bg-editor-highlight'
              }`}
            >
              {align.charAt(0).toUpperCase() + align.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Text Transform */}
      <div>
        <label className="text-sm block mb-2 font-medium">Text Transform</label>
        <select
          value={textProperties.textTransform}
          onChange={(e) => setTextProperties({ textTransform: e.target.value })}
          className="input-field w-full"
        >
          <option value="none">Normal</option>
          <option value="uppercase">UPPERCASE</option>
          <option value="lowercase">lowercase</option>
          <option value="capitalize">Capitalize</option>
        </select>
      </div>

      {/* Letter Spacing */}
      <div>
        <label className="text-sm block mb-2 font-medium">
          Letter Spacing: <span className="text-editor-accent">{textProperties.letterSpacing}px</span>
        </label>
        <input
          type="range"
          min="-5"
          max="20"
          value={textProperties.letterSpacing}
          onChange={(e) => setTextProperties({ letterSpacing: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Stroke (Outline) */}
      <div className="pt-4 border-t border-editor-border">
        <label className="flex items-center space-x-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={textProperties.stroke}
            onChange={toggleStroke}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">Text Outline</span>
        </label>
        {textProperties.stroke && (
          <div className="space-y-3 ml-6">
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={textProperties.strokeColor}
                onChange={(e) => setTextProperties({ strokeColor: e.target.value })}
                className="w-10 h-10"
              />
              <input
                type="text"
                value={textProperties.strokeColor}
                onChange={(e) => setTextProperties({ strokeColor: e.target.value })}
                className="input-field flex-1"
                placeholder="#000000"
              />
            </div>
            <div>
              <label className="text-xs block mb-1">
                Width: <span className="text-editor-accent">{textProperties.strokeWidth}px</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={textProperties.strokeWidth}
                onChange={(e) => setTextProperties({ strokeWidth: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Shadow */}
      <div className="pt-4 border-t border-editor-border">
        <label className="flex items-center space-x-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={textProperties.shadow}
            onChange={toggleShadow}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">Drop Shadow</span>
        </label>
        {textProperties.shadow && (
          <div className="space-y-3 ml-6">
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={textProperties.shadowColor}
                onChange={(e) => setTextProperties({ shadowColor: e.target.value })}
                className="w-10 h-10"
              />
              <input
                type="text"
                value={textProperties.shadowColor}
                onChange={(e) => setTextProperties({ shadowColor: e.target.value })}
                className="input-field flex-1"
                placeholder="#000000"
              />
            </div>
            <div>
              <label className="text-xs block mb-1">
                Blur: <span className="text-editor-accent">{textProperties.shadowBlur}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={textProperties.shadowBlur}
                onChange={(e) => setTextProperties({ shadowBlur: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs block mb-1">
                Offset X: <span className="text-editor-accent">{textProperties.shadowOffsetX}px</span>
              </label>
              <input
                type="range"
                min="-20"
                max="20"
                value={textProperties.shadowOffsetX}
                onChange={(e) => setTextProperties({ shadowOffsetX: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs block mb-1">
                Offset Y: <span className="text-editor-accent">{textProperties.shadowOffsetY}px</span>
              </label>
              <input
                type="range"
                min="-20"
                max="20"
                value={textProperties.shadowOffsetY}
                onChange={(e) => setTextProperties({ shadowOffsetY: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Background Color */}
      <div className="pt-4 border-t border-editor-border">
        <label className="text-sm block mb-2 font-medium">Text Background</label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={textProperties.backgroundColor === 'transparent' ? '#000000' : textProperties.backgroundColor}
            onChange={(e) => setTextProperties({ backgroundColor: e.target.value })}
            className="w-12 h-12"
          />
          <button
            onClick={() => setTextProperties({ backgroundColor: 'transparent' })}
            className={`flex-1 py-2 rounded-md border ${
              textProperties.backgroundColor === 'transparent'
                ? 'border-editor-accent bg-editor-accent/20'
                : 'border-editor-border hover:bg-editor-highlight'
            }`}
          >
            Transparent
          </button>
        </div>
      </div>

      {/* Behind Person Option */}
      {hasMask && (
        <div className="pt-4 border-t border-editor-border">
          <label className="flex items-center space-x-2 cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={textProperties.placeBehindPerson}
              onChange={(e) => setTextProperties({ placeBehindPerson: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold">Place Text Behind Person</span>
          </label>
          <p className="text-xs text-editor-accent ml-6">
            Text will appear behind the detected person
          </p>
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={handleAdd}
        className="w-full btn-primary py-3 font-semibold"
      >
        Add Text Layer
      </button>

      <div className="pt-4 border-t border-editor-border">
        <h3 className="text-sm font-semibold mb-2">Quick Tips</h3>
        <ul className="text-xs text-editor-accent space-y-1">
          <li>• Choose from 15+ professional fonts</li>
          <li>• Apply bold, italic, or custom styles</li>
          <li>• Add outlines and shadows for impact</li>
          <li>• Use color presets or custom colors</li>
          <li>• Drag text layers to reposition</li>
        </ul>
      </div>
    </div>
  );
};

export default TextPanel;
