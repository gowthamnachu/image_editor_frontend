import React, { useState } from 'react';
import { Scissors, Check } from 'lucide-react';
import useEditorStore from '../../store/editorStore';

const SegmentPanel = ({ onSegment, hasMask }) => {
  const { isProcessing, showMaskOverlay, setShowMaskOverlay, maskOpacity, setMaskOpacity } = useEditorStore();
  const [threshold, setThreshold] = useState(0.3); // Lower default for better coverage

  const handleSegment = () => {
    onSegment(threshold);
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Scissors className="w-5 h-5 mr-2" />
          Person Detection
        </h2>
        
        <p className="text-sm text-editor-accent mb-4">
          Automatically detect and segment the person in your image using AI.
        </p>
      </div>

      <div>
        <label className="text-sm block mb-2">
          Detection Sensitivity: {Math.round(threshold * 100)}%
        </label>
        <input
          type="range"
          min="0.1"
          max="0.9"
          step="0.05"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-editor-accent mt-1">
          Lower = More inclusive (captures more), Higher = More precise
        </p>
      </div>

      <button
        onClick={handleSegment}
        disabled={isProcessing}
        className="w-full btn-primary flex items-center justify-center"
      >
        {hasMask ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Re-detect Person
          </>
        ) : (
          <>
            <Scissors className="w-4 h-4 mr-2" />
            Detect Person
          </>
        )}
      </button>

      {hasMask && (
        <>
          <div className="pt-4 border-t border-editor-border">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showMaskOverlay}
                onChange={(e) => setShowMaskOverlay(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Show Mask Overlay</span>
            </label>
          </div>

          {showMaskOverlay && (
            <div>
              <label className="text-sm block mb-2">
                Mask Opacity: {Math.round(maskOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={maskOpacity}
                onChange={(e) => setMaskOpacity(parseFloat(e.target.value))}
              />
            </div>
          )}

          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md">
            <p className="text-sm text-green-400">
              ✓ Person detected successfully
            </p>
          </div>
        </>
      )}

      <div className="pt-4 border-t border-editor-border">
        <h3 className="text-sm font-semibold mb-2">Tips</h3>
        <ul className="text-xs text-editor-accent space-y-1">
          <li>• Works best with clear photos of people</li>
          <li>• Detection uses Mediapipe AI (fast & accurate)</li>
          <li>• Adjust sensitivity if edges aren't perfect</li>
          <li>• Lower sensitivity captures more details</li>
          <li>• Use "Refine Mask" tool to improve edges</li>
        </ul>
      </div>
    </div>
  );
};

export default SegmentPanel;
